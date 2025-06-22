document.querySelector('.leave-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

  const leaveType = document.getElementById('leaveType').value;
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;
  const reason = document.getElementById('reason').value.trim();

  const selectedOptions = document.getElementById('assignedTeachers').selectedOptions;
  const assignedUsers = Array.from(selectedOptions).map(option => option.value);

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

  if (assignedUsers.length === 0) {
    document.getElementById('error-assignedTeachers').textContent = 'Please select at least one assigned user.';
    valid = false;
  }

  if (!valid) return;

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;

  try {
    const currentUser = await getCurrentUser(); // Reuse your existing getCurrentUser()

    if (!currentUser) throw new Error("Unable to determine user category.");

    // Dynamically assign the correct key based on category
    const formData = {
      leave_type_id: leaveType,
      start_date: fromDate,
      end_date: toDate,
      reason: reason,
      ...(currentUser.category === "teacher"
        ? { assigned_hr: assignedUsers }
        : { assigned_teachers: assignedUsers })
    };

    console.log('Submitting leave with data:', formData);

    const response = await fetch('http://127.0.0.1:8000/leave/', {
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
      if (data.assigned_hr) {
        document.getElementById('error-assignedTeachers').textContent = data.assigned_hr.join(' ');
      }
    }
  } catch (error) {
    console.error('Error submitting leave:', error);
    alert('There was an error submitting your leave. Please try again.');
  } finally {
    submitBtn.disabled = false;
  }
});
