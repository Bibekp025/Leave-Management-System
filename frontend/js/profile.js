document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  fetch("http://127.0.0.1:8000/user/self/", {
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch user data");
      return res.json();
    })
    .then(user => {
      document.getElementById("profileInfo").innerHTML = `
        <div class="profile-info-line"><strong>Username:</strong> ${user.username}</div>
        <div class="profile-info-line"><strong>First Name:</strong> ${user.first_name}</div>
        <div class="profile-info-line"><strong>Last Name:</strong> ${user.last_name}</div>
        <div class="profile-info-line"><strong>Category:</strong> ${user.category || "N/A"}</div>
      `;
    })
    .catch(err => {
      console.error(err);
      document.getElementById("profileInfo").innerText = "Error loading profile.";
    });
});
