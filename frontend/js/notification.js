async function fetchNotifications() {
  const token = sessionStorage.getItem('authToken');
  if (!token) {
    console.warn('No auth token found');
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:8000/notification/', {
      headers: {
        'Authorization': 'Token ' + token,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    const notifications = await response.json();
    const unreadNotifications = notifications.filter(n => !n.is_read);

    // Update count badge
    const countElem = document.getElementById('notificationCount');
    if (unreadNotifications.length > 0) {
      countElem.style.display = 'block';
      countElem.textContent = unreadNotifications.length;
    } else {
      countElem.style.display = 'none';
    }

    // Render notifications list
    const dropdown = document.getElementById('notificationDropdown');
    dropdown.innerHTML = ''; // Clear previous notifications

    if (unreadNotifications.length === 0) {
      dropdown.innerHTML = '<div style="padding:10px; color:#888;">No new notifications</div>';
    } else {
      unreadNotifications.forEach(n => {
        const item = document.createElement('div');
        item.style = `
          display:block; padding:10px; border-bottom:1px solid #eee; 
          color:#333; text-decoration:none; cursor:pointer;
        `;
        item.innerHTML = `
          <strong>${n.title}</strong><br/>
          <small>${n.message}</small><br/>
          <small style="color:#999;">${new Date(n.created_at).toLocaleString()}</small>
        `;

        // Add click event to mark as read and redirect
        item.addEventListener('click', async () => {
          try {
            const markReadResponse = await fetch(`http://127.0.0.1:8000/notification/${n.id}/read/`, {
              method: 'PATCH',
              headers: {
                'Authorization': 'Token ' + token,
                'Content-Type': 'application/json',
              }
            });

            if (markReadResponse.ok) {
              // After marking as read, redirect
              window.location.href = 'my-leaves.html';
            } else {
              console.error('Failed to mark notification as read');
            }
          } catch (err) {
            console.error('Error marking notification as read:', err);
          }
        });

        dropdown.appendChild(item);
      });
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
}

// Toggle dropdown visibility on bell click
document.getElementById('notificationBtn').addEventListener('click', () => {
  const dropdown = document.getElementById('notificationDropdown');
  dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
});

// Fetch notifications initially
fetchNotifications();

// Optional: auto-refresh every 60 seconds
setInterval(fetchNotifications, 60000);
