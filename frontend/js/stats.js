async function fetchLeaveSummary() {
  const token = sessionStorage.getItem('authToken');
  if (!token) {
    console.warn('No auth token found');
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:8000/leave/leave-summary/', {
      headers: {
        'Authorization': 'Token ' + token,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch leave summary');
    }

    const data = await response.json();

    // Update the HTML with API data
    document.getElementById('availableLeave').textContent = data.total_available_leave;
    document.getElementById('appliedLeave').textContent = data.total_applied_leave;
    document.getElementById('approvedLeave').textContent = data.total_approved_leave;

    // Total days is static 48, so you can keep it as is or update it here too
    document.getElementById('totalDays').textContent = 48;

    // Optional: Show apply leave button if user has available leaves
    const applyBtn = document.getElementById('dashboardApplyLeaveBtn');
    const applyLeaveBtn = document.getElementById('applyLeaveBtn');
    if (data.total_available_leave > 0) {
      applyBtn.style.display = 'inline-block';
      applyLeaveBtn.style.display = 'inline-block';
      
    } else {
      applyBtn.style.display = 'none';
      applyLeaveBtn.style.display = 'none';
    }

  } catch (error) {
    console.error('Error fetching leave summary:', error);
  }
}

// Call the function initially
fetchLeaveSummary();

// Optional: refresh summary every 60 seconds
setInterval(fetchLeaveSummary, 60000);
