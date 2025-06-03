document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const form = document.getElementById("editProfileForm");
  const statusMsg = document.getElementById("statusMsg");

  // Fetch current user data to pre-fill form
  fetch("http://127.0.0.1:8000/user/self/", {
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then(res => res.json())
    .then(user => {
      document.getElementById("firstName").value = user.first_name || "";
      document.getElementById("lastName").value = user.last_name || "";
      document.getElementById("email").value = user.email || "";
      document.getElementById("phone").value = user.phone || "";
      document.getElementById("category").value = user.category || "";
    });

  form.addEventListener("submit", e => {
    e.preventDefault();

    const data = {
      first_name: form.first_name.value,
      last_name: form.last_name.value,
      email: form.email.value,
      phone: form.phone.value,
      category: form.category.value,
    };

    fetch("http://127.0.0.1:8000/user/update/", {
      method: "PUT",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to update profile");
        return res.json();
      })
      .then(() => {
        statusMsg.textContent = "Profile updated successfully!";
        statusMsg.style.color = "green";
      })
      .catch(err => {
        statusMsg.textContent = "Error updating profile.";
        statusMsg.style.color = "red";
        console.error(err);
      });
  });
});
