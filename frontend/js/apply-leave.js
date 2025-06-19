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
    select.innerHTML = ''; 

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

function validateDates(fromDateStr, toDateStr) {
  const errorFromDate = document.getElementById('error-fromDate');
  const errorToDate = document.getElementById('error-toDate');
  errorFromDate.textContent = '';
  errorToDate.textContent = '';

  if (!fromDateStr) {
    errorFromDate.textContent = 'Please select a From date.';
    return false;
  }
  if (!toDateStr) {
    errorToDate.textContent = 'Please select a To date.';
    return false;
  }

  const fromDate = new Date(fromDateStr);
  const toDate = new Date(toDateStr);

  if (toDate < fromDate) {
    errorToDate.textContent = 'To date must be the same or after From date.';
    return false;
  }

  return true;
}

// date select garne fxn
function setupDatePickers() {
  const today = new Date().toISOString().split('T')[0]; 
  const fromDateInput = document.getElementById('fromDate');
  const toDateInput = document.getElementById('toDate');

  fromDateInput.setAttribute('min', today);
  toDateInput.setAttribute('min', today);

  fromDateInput.addEventListener('change', () => {
    if (fromDateInput.value) {
      toDateInput.min = fromDateInput.value;
      if (toDateInput.value < fromDateInput.value) {
        toDateInput.value = fromDateInput.value;
      }
    } else {
      
      toDateInput.min = today;
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  loadAssignedUsers();
  setupDatePickers();
});

document.querySelector('.leave-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  
  document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

  const leaveType = document.getElementById('leaveType').value;
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;
  const reason = document.getElementById('reason').value.trim();

  const selectedOptions = document.getElementById('assignedTeachers').selectedOptions;
  const assignedTeachers = Array.from(selectedOptions).map(option => option.value);

  let valid = true;

  
  if (!leaveType) {
    document.getElementById('error-leaveType').textContent = 'Please select a leave type.';
    valid = false;
  }

  
  if (!validateDates(fromDate, toDate)) {
    valid = false;
  }

  
  if (!reason) {
    document.getElementById('error-reason').textContent = 'Please enter a reason.';
    valid = false;
  }


  if (assignedTeachers.length === 0) {
    document.getElementById('error-assignedTeachers').textContent = 'Please select at least one assigned user.';
    valid = false;
  }

  if (!valid) {
    return; 
  }

  const formData = {
    leave_type_id: leaveType,
    start_date: fromDate,
    end_date: toDate,
    reason: reason,
    assigned_teachers: assignedTeachers
  };

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true; 

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
      e.target.reset();
      window.location.href = "my-leaves.html";
    } else {

      if (data.leave_type_id) {
        document.getElementById('error-leaveType').textContent = data.leave_type_id.join(' ');
      }
      if (data.start_date) {
        document.getElementById('error-fromDate').textContent = data.start_date.join(' ');
      }
      if (data.end_date) {
        document.getElementById('error-toDate').textContent = data.end_date.join(' ');
      }
      if (data.reason) {
        document.getElementById('error-reason').textContent = data.reason.join(' ');
      }
      if (data.assigned_teachers) {
        document.getElementById('error-assignedTeachers').textContent = data.assigned_teachers.join(' ');
      }
    }
  } catch (error) {
    console.error('Error submitting leave:', error);
    alert('There was an error submitting your leave. Please try again.');
    console.log('Submitted Data:', formData);
  } finally {
    submitBtn.disabled = false; 
  }
});
