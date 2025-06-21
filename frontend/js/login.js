document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.querySelector('.sign-in-form');
  const signupForm = document.querySelector('.sign-up-form');


  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
      alert('Please fill in both username and password.');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/user/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.message === 'Successfully Logged In' && data.token) {
        localStorage.setItem('authToken', data.token);
        alert('Login successful!');
        window.location.href = 'index.html';
      } else {
        alert(`Login failed: ${data.detail || 'Invalid credentials'}`);
      }
    } catch (error) {
      console.error('Login Error:', error);
      alert('An error occurred during login.');
    }
  });

 
  signupForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const fullName = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const category = document.getElementById('role').value;

   
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!fullName || !email || !username || !password || !confirmPassword || !category) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!nameRegex.test(fullName)) {
      alert("Full name should contain only letters and spaces.");
      return;
    }

    if (!emailRegex.test(email)) {
      alert("Invalid email format.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const payload = {
      first_name: fullName,
      email: email,
      username: username,
      password: password,
      category: category
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/user/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || "Registration successful!");
        document.getElementById('sign-in-btn').click(); 
      } else {
        let errorMessage = "Registration failed";
        try {
          const errorText = await response.text();
          if (errorText) {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          }
        } catch {}
        alert("Error: " + errorMessage);
      }
    } catch (error) {
      console.error("Signup Error:", error);
      alert("Network error. Please try again later.");
    }
  });


  const signUpBtn = document.getElementById('sign-up-btn');
  const signInBtn = document.getElementById('sign-in-btn');
  const container = document.querySelector('.container');

  signUpBtn.addEventListener('click', () => {
    container.classList.add('sign-up-mode');
  });

  signInBtn.addEventListener('click', () => {
    container.classList.remove('sign-up-mode');
  });
});
