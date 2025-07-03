document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.querySelector('.sign-in-form');
  const signupForm = document.querySelector('.sign-up-form');

  const loginErrorDiv = document.getElementById('login-error');
  const signupErrorDiv = document.getElementById('signup-error');

  const signUpBtn = document.getElementById('sign-up-btn');
  const signInBtn = document.getElementById('sign-in-btn');
  const container = document.querySelector('.container');

  // Utility to show message with optional success style
  function showMessage(element, message, isSuccess = false) {
    element.textContent = message;
    element.classList.toggle('success', isSuccess);
    element.classList.toggle('error', !isSuccess);
  }

  // Clear messages when switching forms
  function clearMessages() {
    loginErrorDiv.textContent = '';
    signupErrorDiv.textContent = '';
    loginErrorDiv.classList.remove('success', 'error');
    signupErrorDiv.classList.remove('success', 'error');
  }

  // LOGIN FORM SUBMIT
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    loginErrorDiv.textContent = '';
    loginErrorDiv.classList.remove('success', 'error');

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
      showMessage(loginErrorDiv, 'Please fill in both username and password.');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/user/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        sessionStorage.setItem('authToken', data.token);
        showMessage(loginErrorDiv, 'Login successful! Redirecting...', true);
        // Small delay to show success message before redirect
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      } else {
        showMessage(loginErrorDiv, data.detail || data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login Error:', error);
      showMessage(loginErrorDiv, 'An error occurred during login.');
    }
  });

  // SIGNUP FORM SUBMIT
  signupForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    signupErrorDiv.textContent = '';
    signupErrorDiv.classList.remove('success', 'error');

    const fullName = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const category = document.getElementById('role').value;

    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validation checks
    if (!fullName || !email || !username || !password || !confirmPassword || !category) {
      showMessage(signupErrorDiv, 'Please fill in all required fields.');
      return;
    }

    if (!nameRegex.test(fullName)) {
      showMessage(signupErrorDiv, 'Full name should contain only letters and spaces.');
      return;
    }

    if (!emailRegex.test(email)) {
      showMessage(signupErrorDiv, 'Invalid email format.');
      return;
    }

    if (password.length < 4) {
      showMessage(signupErrorDiv, 'Password must be at least 4 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      showMessage(signupErrorDiv, 'Passwords do not match.');
      return;
    }

    const payload = {
      first_name: fullName,
      email: email,
      username: username,
      password: password,
      category: category,
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/user/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Reset form and show success message
        signupForm.reset();
        showMessage(signupErrorDiv, 'Registration successful! You can now sign in with your credentials.', true);
        
        // IMPORTANT: No automatic redirect or form switching
        // User stays on registration form to see the success message
        // They can manually switch to login form when ready
        
      } else {
        showMessage(signupErrorDiv, data.message || data.detail || 'Registration failed.');
      }
    } catch (error) {
      console.error('Signup Error:', error);
      showMessage(signupErrorDiv, 'Network error. Please try again later.');
    }
  });

  // Panel toggle buttons to switch forms manually
  signUpBtn.addEventListener('click', () => {
    container.classList.add('sign-up-mode');
    clearMessages(); // Clear messages when switching forms
  });

  signInBtn.addEventListener('click', () => {
    container.classList.remove('sign-up-mode');
    clearMessages(); // Clear messages when switching forms
  });
});