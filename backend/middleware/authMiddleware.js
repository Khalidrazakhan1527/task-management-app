const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {

    try {

        // Get Authorization header

        const authHeader =
            req.headers.authorization;


        // Check header

        if (!authHeader) {

            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }


        // Check Bearer format

        if (!authHeader.startsWith("Bearer ")) {

            return res.status(401).json({
                success: false,
                message: "Invalid authorization format"
            });
        }


        // Extract token

        const token =
            authHeader.split(" ")[1];


        // Verify token

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        // Attach user ID to request

        req.userId =
            decoded.userId;


        // Continue

        next();


    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};


module.exports = authMiddleware;
