document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.querySelector('.sign-in-form');
  const signupForm = document.querySelector('.sign-up-form');

  // ------- LOGIN FORM HANDLER -------
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

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
        window.location.href = 'index.html'; // Redirect to home page
      } else {
        alert(`Login failed: ${data.detail || 'Invalid credentials'}`);
      }
    } catch (error) {
      console.error('Login Error:', error);
      alert('An error occurred during login.');
    }
  });

  // ------- SIGN-UP FORM HANDLER -------
  signupForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const fullname = document.getElementById('fullname').value;
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/user/signup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullname,
          username,
          email,
          password
        }),
      });

      const data = await response.json();

      if (response.ok && data.message === 'Successfully Registered') {
        alert('Registration successful! You can now log in.');
        document.getElementById('sign-in-btn').click(); // Switch to sign-in panel
      } else {
        alert(`Sign-up failed: ${data.detail || 'Something went wrong'}`);
      }
    } catch (error) {
      console.error('Signup Error:', error);
      alert('An error occurred during sign-up.');
    }
  });

  // ------- PANEL TOGGLING (OPTIONAL) -------
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
