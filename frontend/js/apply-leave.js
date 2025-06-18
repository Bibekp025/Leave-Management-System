
async function getCurrentUser() {
  try {
    const response = await fetch('http://127.0.0.1:8000/user/self/', {
      headers: {
        'Authorization': `Token ${localStorage.getItem('authToken')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch current user');
    return await response.json();
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

// 1. Load teachers or HRs from API and populate the select box
async function loadAssignedUsers() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return;

    let url = '';
    if (currentUser.category === 'student') {
      url = 'http://127.0.0.1:8000/user/?category=teacher';
      document.getElementById('assignedLabel').textContent = "Select Teacher(s)";
    } else if (currentUser.category === 'teacher') {
      url = 'http://127.0.0.1:8000/user/?category=hr';
      document.getElementById('assignedLabel').textContent = "Select HR(s)";
    } else {
      console.warn('Unknown category:', currentUser.category);
      return;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${localStorage.getItem('authToken')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch users');

    const users = await response.json();

    const select = document.getElementById('assignedTeachers');
    select.innerHTML = ''; // Clear old options

    users.forEach(user => {
      const option = document.createElement('option');
      option.value = user.id;
      option.textContent = user.username;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading assigned users:', error);
  }
}

window.addEventListener('DOMContentLoaded', loadAssignedUsers);

// 2. Handle leave form submission with multiple teachers/HRs
document.querySelector('.leave-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  // Clear old error messages
  document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

  // Collect form values
  const leaveType = document.getElementById('leaveType').value;
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;
  const reason = document.getElementById('reason').value;

  const selectedOptions = document.getElementById('assignedTeachers').selectedOptions;
  const assignedTeachers = Array.from(selectedOptions).map(option => option.value);

  // Prepare data
  const formData = {
    leave_type_id: leaveType,
    start_date: fromDate,
    end_date: toDate,
    reason: reason,
    assigned_teachers: assignedTeachers
  };

  try {
    const response = await fetch('http://127.0.0.1:8000/leave/leaves/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (response.ok) {
      alert('Leave applied successfully!');
      window.location.href = "my-leaves.html";
      document.querySelector('.leave-form').reset();
    } else {
      // Show backend validation errors
      if (data.leave_type_id) {
        document.getElementById('error-leaveType').textContent = data.leave_type_id[0];
      }
      if (data.start_date) {
        document.getElementById('error-fromDate').textContent = data.start_date[0];
      }
      if (data.end_date) {
        document.getElementById('error-toDate').textContent = data.end_date[0];
      }
      if (data.reason) {
        document.getElementById('error-reason').textContent = data.reason[0];
      }
      if (data.assigned_teachers) {
        alert('Selection error: ' + data.assigned_teachers.join(', '));
      }
    }

  } catch (error) {
    console.error('Error submitting leave:', error);
    console.log('Submitted Data:', formData);
  }
});

