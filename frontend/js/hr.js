document.addEventListener('DOMContentLoaded', async () => {
  const token = sessionStorage.getItem('authToken');
  if (!token) return; // no token, do nothing

  try {
    const response = await fetch('http://127.0.0.1:8000/user/self/', {
      headers: { 'Authorization': `Token ${token}` }
    });

    if (!response.ok) throw new Error('Failed to fetch user info');

    const user = await response.json();

    if (user.category === 'hr') {
      // Hide the apply leave link/button
      const applyLeaveLink = document.getElementById('applyLeaveLink');
      if (applyLeaveLink) {
        applyLeaveLink.style.display = 'none';
      }
      // Or if it's a button:
      // const applyLeaveBtn = document.getElementById('applyLeaveBtn');
      // if (applyLeaveBtn) applyLeaveBtn.style.display = 'none';
    }
  } catch (error) {
    console.error('Error checking user category:', error);
  }
});

