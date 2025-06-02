document.getElementById("signupForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const fullname = document.getElementById("fullname").value.trim();
  const email = document.getElementById("email").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const category = document.getElementById("category").value;

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  const data = {
    first_name: fullname,
    email: email,
    username: username,
    password: password,
    category: category,
  };

  try {
    const response = await fetch("https://your-api.com/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      alert("Registration successful!");
      window.location.href = "login.html";
    } else {
      alert("Error: " + (result.message || "Registration failed"));
    }
  } catch (error) {
    alert("Network error. Please try again later.");
    console.error(error);
  }
});
