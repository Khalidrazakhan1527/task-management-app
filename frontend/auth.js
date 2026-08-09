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
