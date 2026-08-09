console.log("AUTH.JS LOADED");
const AUTH_API_URL =
    "https://task-management-app-oj6o.onrender.com/api/auth";


// =================================
// LOGIN
// =================================

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const email =
                document.getElementById(
                    "loginEmail"
                ).value.trim();

            const password =
                document.getElementById(
                    "loginPassword"
                ).value;

            const message =
                document.getElementById(
                    "loginMessage"
                );


            try {

                message.textContent =
                    "Signing in...";

                message.className =
                    "auth-message";


                const response =
                    await fetch(
                        `${AUTH_API_URL}/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email,
                                password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.textContent =
                        data.message ||
                        "Login failed.";

                    message.className =
                        "auth-message error";

                    return;
                }


                // Save JWT

                localStorage.setItem(
                    "token",
                    data.token
                );


                // Save user

                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        data.user
                    )
                );


                message.textContent =
                    "Login successful!";

                message.className =
                    "auth-message success";


                // Go to dashboard

                setTimeout(() => {

                    window.location.href =
                        "index.html";

                }, 500);


            } catch (error) {

                console.error(
                    "LOGIN ERROR:",
                    error
                );


                message.textContent =
                    error.message ||
                    "Login request failed.";

                message.className =
                    "auth-message error";
            }
        }
    );
}

// =================================
// SIGNUP
// =================================

const signupForm =
    document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const name =
                document.getElementById("signupName").value.trim();

            const email =
                document.getElementById("signupEmail").value.trim();

            const password =
                document.getElementById("signupPassword").value;

            const message =
                document.getElementById("signupMessage");

            try {

                message.textContent =
                    "Creating account...";

                message.className =
                    "auth-message";

                const response =
                    await fetch(
                        `${AUTH_API_URL}/signup`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                name,
                                email,
                                password
                            })
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    message.textContent =
                        data.message ||
                        "Signup failed.";

                    message.className =
                        "auth-message error";

                    return;
                }

                localStorage.setItem(
                    "token",
                    data.token
                );

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                message.textContent =
                    "Account created successfully!";

                message.className =
                    "auth-message success";

                setTimeout(() => {

                    window.location.href =
                        "index.html";

                }, 500);

            } catch (error) {

                console.error(
                    "SIGNUP ERROR:",
                    error
                );

                message.textContent =
                    error.message ||
                    "Signup request failed.";

                message.className =
                    "auth-message error";
            }
        }
    );
}
// =================================
// FORGOT PASSWORD
// =================================

const forgotPasswordForm =
    document.getElementById(
        "forgotPasswordForm"
    );


if (forgotPasswordForm) {

    forgotPasswordForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const email =
                document.getElementById(
                    "forgotEmail"
                ).value.trim();


            const message =
                document.getElementById(
                    "forgotMessage"
                );


            try {

                message.textContent =
                    "Generating reset link...";

                message.className =
                    "auth-message";


                const response =
                    await fetch(
                        `${AUTH_API_URL}/forgot-password`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.textContent =
                        data.message ||
                        "Unable to process request.";

                    message.className =
                        "auth-message error";

                    return;
                }


                message.textContent =
                    data.message ||
                    "Reset link generated successfully.";

                message.className =
                    "auth-message success";


                // Development/testing:
                // Show reset link

                if (data.resetLink) {

                    const link =
                        document.createElement(
                            "a"
                        );


                    link.href =
                        data.resetLink;


                    link.textContent =
                        " Open Reset Password Page";


                    link.target =
                        "_blank";


                    link.className =
                        "reset-link";


                    message.appendChild(
                        document.createElement(
                            "br"
                        )
                    );


                    message.appendChild(
                        link
                    );
                }


            } catch (error) {

                console.error(
                    "FORGOT PASSWORD ERROR:",
                    error
                );


                message.textContent =
                    "Unable to connect to server.";

                message.className =
                    "auth-message error";
            }

        }
    );
}
// =================================
// RESET PASSWORD
// =================================

const resetPasswordForm =
    document.getElementById(
        "resetPasswordForm"
    );


if (resetPasswordForm) {

    resetPasswordForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const newPassword =
                document.getElementById(
                    "newPassword"
                ).value;


            const confirmPassword =
                document.getElementById(
                    "confirmPassword"
                ).value;


            const message =
                document.getElementById(
                    "resetMessage"
                );


            // Check passwords

            if (
                newPassword !==
                confirmPassword
            ) {

                message.textContent =
                    "Passwords do not match.";

                message.className =
                    "auth-message error";

                return;
            }


            if (
                newPassword.length < 6
            ) {

                message.textContent =
                    "Password must be at least 6 characters.";

                message.className =
                    "auth-message error";

                return;
            }


            // Get token from URL

            const urlParams =
                new URLSearchParams(
                    window.location.search
                );


            const token =
                urlParams.get("token");


            if (!token) {

                message.textContent =
                    "Invalid or missing reset token.";

                message.className =
                    "auth-message error";

                return;
            }


            try {

                message.textContent =
                    "Resetting password...";

                message.className =
                    "auth-message";


                const response =
                    await fetch(
                        `${AUTH_API_URL}/reset-password/${encodeURIComponent(token)}`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                password:
                                    newPassword
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.textContent =
                        data.message ||
                        "Unable to reset password.";

                    message.className =
                        "auth-message error";

                    return;
                }


                message.textContent =
                    "Password reset successfully! Redirecting to login...";

                message.className =
                    "auth-message success";


                // Clear old authentication data

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "user"
                );


                setTimeout(
                    () => {

                        window.location.href =
                            "login.html";

                    },
                    1500
                );


            } catch (error) {

                console.error(
                    "RESET PASSWORD ERROR:",
                    error
                );


                message.textContent =
                    "Unable to connect to server.";

                message.className =
                    "auth-message error";
            }

        }
    );
}
