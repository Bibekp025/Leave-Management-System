 const token = sessionStorage.getItem('authToken'); 
if (!token) {
    window.location.href = "login.html"; 
    alert("Please Login to visit this page");
}
