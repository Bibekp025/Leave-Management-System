
document.addEventListener("DOMContentLoaded", function () {
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            
            localStorage.removeItem("authToken");

            
            window.location.href = "login.html";
        });
    }
});
