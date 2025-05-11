document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.querySelector('.login-form');
  
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault(); // Prevent form from submitting normally
  
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
  
      try {
        const response = await fetch('https://your-api-url.com/api/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          alert('Login successful!');
          // Optionally redirect:
          // window.location.href = 'dashboard.html';
        } else {
          alert(`Login failed: ${data.detail || 'Invalid credentials'}`);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
      }
    });
  });
document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.querySelector('.login-form');

  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent form from submitting normally

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

      if (response.ok) {
        alert('Login successful!');
        // Optionally redirect:
        // window.location.href = 'dashboard.html';
      } else {
        alert(`Login failed: ${data.detail || 'Invalid credentials'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again later.');
    }
  });
});
  