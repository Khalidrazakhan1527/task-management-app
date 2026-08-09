const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");

const router = express.Router();


// =================================
// SIGNUP
// =================================

router.post("/signup", async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        // Validate fields

        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message:
                    "Name, email and password are required"
            });
        }


        // Validate password

        if (password.length < 6) {

            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 6 characters"
            });
        }


        // Check existing user

        const existingUser =
            await User.findOne({
                email: email.toLowerCase().trim()
            });


        if (existingUser) {

            return res.status(409).json({
                success: false,
                message:
                    "User with this email already exists"
            });
        }


        // Hash password

        const hashedPassword =
            await bcrypt.hash(password, 10);


        // Create user

        const user =
            await User.create({

                name,

                email:
                    email.toLowerCase().trim(),

                password:
                    hashedPassword
            });


        // Generate token

        const token =
            jwt.sign(
                {
                    userId: user._id
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "7d"
                }
            );


        res.status(201).json({

            success: true,

            message:
                "Account created successfully",

            token,

            user: {

                id: user._id,

                name: user.name,

                email: user.email
            }
        });


    } catch (error) {

        console.error(
            "Signup error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to create account",

            error:
                error.message
        });
    }
});



// =================================
// LOGIN
// =================================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // Validate fields

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required"
            });
        }


        // Find user

        const user =
            await User.findOne({

                email:
                    email.toLowerCase().trim()

            });


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"
            });
        }


        // Compare password

        const isPasswordValid =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!isPasswordValid) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"
            });
        }


        // Generate JWT

        const token =
            jwt.sign(
                {
                    userId: user._id
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "7d"
                }
            );


        // Send response

        res.status(200).json({

            success: true,

            message:
                "Login successful",

            token,

            user: {

                id: user._id,

                name: user.name,

                email: user.email
            }
        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to login",

            error:
                error.message
        });
    }
});



// =================================
// FORGOT PASSWORD
// =================================

router.post(
    "/forgot-password",
    async (req, res) => {

        try {

            const { email } =
                req.body;


            // Validate email

            if (!email) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email is required"
                });
            }


            // Find user

            const user =
                await User.findOne({

                    email:
                        email.toLowerCase().trim()

                });


            // Don't reveal whether
            // account exists

            if (!user) {

                return res.status(200).json({

                    success: true,

                    message:
                        "If an account exists with this email, a password reset link has been generated."
                });
            }


            // Generate secure token

            const resetToken =
                crypto
                    .randomBytes(32)
                    .toString("hex");


            // Save token

            user.resetPasswordToken =
                resetToken;


            // Token expires
            // after 15 minutes

            user.resetPasswordExpires =
                new Date(
                    Date.now() +
                    15 * 60 * 1000
                );


            await user.save();


            // Temporary development
            // reset link

            const resetLink =
                `https://task-management-frontend-nnrr.onrender.com/reset-password.html?token=${resetToken}`;


            console.log(
                "================================="
            );

            console.log(
                "PASSWORD RESET LINK:"
            );

            console.log(
                resetLink
            );

            console.log(
                "================================="
            );


            return res.status(200).json({

                success: true,

                message:
                    "If an account exists with this email, a password reset link has been generated.",

                resetLink
            });


        } catch (error) {

            console.error(
                "Forgot password error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to process password reset request"
            });
        }
    }
);



// =================================
// RESET PASSWORD
// =================================

router.post(
    "/reset-password/:token",
    async (req, res) => {

        try {

            const {
                token
            } = req.params;


            const {
                password
            } = req.body;


            // Validate password

            if (!password) {

                return res.status(400).json({

                    success: false,

                    message:
                        "New password is required"
                });
            }


            // Validate password length

            if (password.length < 6) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Password must be at least 6 characters"
                });
            }


            // Find user with valid
            // and non-expired token

            const user =
                await User.findOne({

                    resetPasswordToken:
                        token,

                    resetPasswordExpires: {
                        $gt: new Date()
                    }

                });


            // Invalid / expired token

            if (!user) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid or expired password reset token"
                });
            }


            // Hash new password

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );


            // Update password

            user.password =
                hashedPassword;


            // Remove reset token

            user.resetPasswordToken =
                null;


            user.resetPasswordExpires =
                null;


            await user.save();


            return res.status(200).json({

                success: true,

                message:
                    "Password reset successfully. You can now login with your new password."
            });


        } catch (error) {

            console.error(
                "Reset password error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to reset password"
            });
        }
    }
);



module.exports = router;
