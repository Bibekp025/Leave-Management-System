// 1. Load teachers from API and populate the select box
async function loadTeachers() {
  try {
    const response = await fetch('http://127.0.0.1:8000/user/?category=teacher'); // API endpoint
    if (!response.ok) throw new Error('Failed to fetch teachers');

    const teachers = await response.json();

    const select = document.getElementById('assignedTeachers');
    select.innerHTML = ''; // Clear old options

    teachers.forEach(teacher => {
      const option = document.createElement('option');
      option.value = teacher.id;
      option.textContent = teacher.username;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading teachers:', error);
  }
}

window.addEventListener('DOMContentLoaded', loadTeachers);

// 2. Handle leave form submission with multiple teachers
document.querySelector('.leave-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  // Clear old error messages
  document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

  // Collect form values
  const leaveType = document.getElementById('leaveType').value;
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;
  const reason = document.getElementById('reason').value;

  // Get multiple selected teachers
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
        alert('Teacher selection error: ' + data.assigned_teachers.join(', '));
      }
    }

  } catch (error) {
    console.error('Error submitting leave:', error);
    console.log('Submitted Data:', formData);
  }
});
