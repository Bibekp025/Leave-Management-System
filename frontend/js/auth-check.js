 const token = localStorage.getItem('token'); // Change this to your auth token source
if (!token) {
    window.location.href = "/frontend/login.html"; // Replace with your login page
}