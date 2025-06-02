document.getElementById("signupForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  console.log('hello');
  
  const fullName = document.getElementById("fullname").value.trim();
  const email = document.getElementById("email").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const category = document.getElementById("category").value;

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  const payload = {
    first_name:fullName,
    email:email,
    username: username,
    password: password,
    category: category
  };
  console.log("Payload to send:", payload);


  try {
    const response = await fetch("http://127.0.0.1:8000/user/create/", {  // <-- Fixed URL here
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();  // safely parse JSON response
      alert(data.message || "Registration successful!");
      window.location.href = "login.html";
    } else {
      // Try to parse error response JSON safely
      let errorMessage = "Registration failed";
      console.log("Payload to send:", payload);

      try {
        const errorText = await response.text();
        if (errorText) {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        }
      } catch {
        // Parsing failed, keep generic message
      }
      alert("Error: " + errorMessage);
    }
  } catch (error) {
    console.error("Network error:", error);
    alert("Network error. Please try again later.");
  }
});
