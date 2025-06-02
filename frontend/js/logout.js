// logout.js
document.addEventListener("DOMContentLoaded", function () {
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            // ✅ Remove token
            localStorage.removeItem("token");

            // ✅ Redirect to login page
            window.location.href = "login.html";
        });
    }
});
