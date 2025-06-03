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
        <p><strong>Username:</strong> ${user.username}</p>
        <p><strong>First Name:</strong> ${user.first_name}</p>
        <p><strong>Last Name:</strong> ${user.last_name}</p>
        <p><strong>Email:</strong> ${user.email || "N/A"}</p>
        <p><strong>Phone:</strong> ${user.phone || "N/A"}</p>
        <p><strong>Category:</strong> ${user.category || "N/A"}</p>
        <p><strong>Date Joined:</strong> ${new Date(user.date_joined).toLocaleDateString()}</p>
      `;
    })
    .catch(err => {
      console.error(err);
      document.getElementById("profileInfo").innerText = "Error loading profile.";
    });

  const editBtn = document.getElementById("editProfileBtn");
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      window.location.href = "edit-profile.html";
    });
  }
});
