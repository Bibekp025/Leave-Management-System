document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.querySelector('.login-form');

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
        console.log(data.token)
        
        window.location.href = 'index.html';
      } else {
        alert(`Login failed: ${data.detail || 'Invalid credentials'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again later.');
    }
  });
});
