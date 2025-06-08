
document.querySelector('.leave-form').addEventListener('submit', async function (e) {
  e.preventDefault(); // Prevent default form submission

  // Clear previous error messages
  document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

  // Collect form values
  const leaveType = document.getElementById('leaveType').value;

  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;
  const reason = document.getElementById('reason').value;

  // Prepare data payload
  const formData = {
    leave_type_id: leaveType,
    start_date: fromDate,
    end_date: toDate,
    reason: reason
  };

  try {
    const response = await fetch('http://127.0.0.1:8000/leave/leaves/ ', {
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
      // Display validation errors from API
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
    }

  } catch (error) {
    console.error('Error submitting leave:', error);
    
    console.log(formData);
  }
});

