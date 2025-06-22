document.addEventListener("DOMContentLoaded", function () {
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            const token = localStorage.getItem("authToken");

            if (token) {
                fetch("http://127.0.0.1:8000/user/logout/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Token ${token}`
                    }
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Failed to log out from backend");
                    }
                })
                .catch(error => {
                    console.error("Logout error:", error);
                })
                .finally(() => {
                    // Clear token from localStorage regardless
                    localStorage.removeItem("authToken");
                    window.location.href = "login.html";
                });
            } else {
                window.location.href = "login.html";
            }
        });
    }
});
