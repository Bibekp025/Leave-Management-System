// 🔐 Fetch current user info with token
async function getCurrentUser() {
  try {
    const response = await fetch('http://127.0.0.1:8000/user/self/', {
      headers: {
        'Authorization': `Token ${sessionStorage.getItem('authToken')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch current user');
    return await response.json();
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

// 📥 Load dropdown options for assigned users based on current user category
async function loadAssignedUsers() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return;

    let url = '';
    if (currentUser.category === 'student') {
      url = 'http://127.0.0.1:8000/user/?category=teacher';
      document.getElementById('assignedLabel').textContent = "Select Teacher";
    } else if (currentUser.category === 'teacher') {
      url = 'http://127.0.0.1:8000/user/?category=hr';
      document.getElementById('assignedLabel').textContent = "Select HR";
    } else {
      console.warn('Unknown category:', currentUser.category);
      return;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${sessionStorage.getItem('authToken')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch users');

    const users = await response.json();

    const select = document.getElementById('assignedTeachers');
    if (currentUser.category === 'student') {
      select.innerHTML = '<option value="">Select Teacher</option>';
    } else if (currentUser.category === 'teacher') {
      select.innerHTML = '<option value="">Select HR</option>';
    }

    users.forEach(user => {
      const option = document.createElement('option');
      option.value = user.id;
      option.textContent = user.first_name || user.username;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading assigned users:', error);
  }
}

// 📅 Validate from/to dates
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

// 📅 Setup date pickers with min date
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

// 🚀 Load everything on page ready
window.addEventListener('DOMContentLoaded', () => {
  loadAssignedUsers();
  setupDatePickers();
});

// 📤 Submit leave form
document.querySelector('.leave-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  // Clear errors and success messages
  document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
  const successMessage = document.getElementById('success-message');
  if (successMessage) {
    successMessage.remove();
  }

  const leaveType = document.getElementById('leaveType').value;
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;
  const reason = document.getElementById('reason').value.trim();
  const assignedUser = document.getElementById('assignedTeachers').value;

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

  if (!assignedUser) {
    document.getElementById('error-assignedTeachers').textContent = 'Please select an assigned user.';
    valid = false;
  }

  if (!valid) return;

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    alert("Unable to fetch current user.");
    return;
  }

  // 📦 Prepare payload dynamically
  const formData = {
    leave_type: parseInt(leaveType),
    from_date: fromDate,
    to_date: toDate,
    reason: reason
  };

  if (currentUser.category === 'student') {
    formData.assigned_teachers = [parseInt(assignedUser)];
  } else if (currentUser.category === 'teacher') {
    formData.assigned_hrs = [parseInt(assignedUser)];
  }

  console.log('Submitting leave with data:', formData);

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;

  try {
    const response = await fetch('http://127.0.0.1:8000/leave/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${sessionStorage.getItem('authToken')}`
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (response.ok) {
      // Show success message below the form
      showSuccessMessage('Leave applied successfully!');
      
      // Reset form
      e.target.reset();
      
      // Redirect after 5 seconds
      setTimeout(() => {
        window.location.href = "my-leaves.html";
      }, 5000);
    } else {
      console.error('Server response:', data);
      // 🧾 Show validation errors from backend
      if (data.leave_type) {
        document.getElementById('error-leaveType').textContent = Array.isArray(data.leave_type) ? data.leave_type.join(' ') : data.leave_type;
      }
      if (data.from_date) {
        document.getElementById('error-fromDate').textContent = Array.isArray(data.from_date) ? data.from_date.join(' ') : data.from_date;
      }
      if (data.to_date) {
        document.getElementById('error-toDate').textContent = Array.isArray(data.to_date) ? data.to_date.join(' ') : data.to_date;
      }
      if (data.reason) {
        document.getElementById('error-reason').textContent = Array.isArray(data.reason) ? data.reason.join(' ') : data.reason;
      }
      if (data.assigned_teachers) {
        document.getElementById('error-assignedTeachers').textContent = Array.isArray(data.assigned_teachers) ? data.assigned_teachers.join(' ') : data.assigned_teachers;
      }
      if (data.assigned_hrs) {
        document.getElementById('error-assignedTeachers').textContent = Array.isArray(data.assigned_hrs) ? data.assigned_hrs.join(' ') : data.assigned_hrs;
      }
      if (data.non_field_errors) {
        alert('Error: ' + (Array.isArray(data.non_field_errors) ? data.non_field_errors.join(' ') : data.non_field_errors));
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

// Function to show success message
function showSuccessMessage(message) {
  // Remove any existing success message
  const existingSuccess = document.getElementById('success-message');
  if (existingSuccess) {
    existingSuccess.remove();
  }

  // Create success message element
  const successDiv = document.createElement('div');
  successDiv.id = 'success-message';
  successDiv.className = 'success-message';
  successDiv.innerHTML = `
    <div class="success-content">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
      <span>${message}</span>
    </div>
  `;

  // Insert after the form submit button row
  const submitRow = document.querySelector('.form-row-submit');
  if (submitRow) {
    submitRow.parentNode.insertBefore(successDiv, submitRow.nextSibling);
  } else {
    // Fallback: insert after the form
    const form = document.querySelector('.leave-form');
    form.parentNode.insertBefore(successDiv, form.nextSibling);
  }
}

// User Data Management
async function initializeUserData() {
  const token = sessionStorage.getItem("authToken");
  
  try {
    const response = await fetch("http://127.0.0.1:8000/user/self/", {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch user info");
    }
    
    const user = await response.json();
    updateUserInterface(user);
    
  } catch (error) {
    console.error("Error fetching user info:", error);
    // Handle authentication error
    if (error.message.includes("401") || error.message.includes("403")) {
      sessionStorage.removeItem("authToken");
      window.location.href = "login.html";
    }
  }
}

function updateUserInterface(user) {
  const userAvatar = document.querySelector(".user-avatar");
  const userName = document.querySelector(".user-name");
  
  if (userAvatar) {
    const displayName = user.first_name || user.username || "User";
    userAvatar.textContent = displayName.charAt(0).toUpperCase();
  }
  
  if (userName) {
    const displayName = user.first_name || user.username || "User";
    userName.textContent = displayName;
  }
}

// User Dropdown Functions
function initializeUserDropdown() {
  // User Dropdown Functions
  function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
      dropdown.classList.toggle('show');
    }
  }

  function handleProfile() {
    window.location.href = 'profile.html';
    closeUserDropdown();
  }

  function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userData');
      window.location.href = 'login.html';
    }
    closeUserDropdown();
  }

  function closeUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
      dropdown.classList.remove('show');
    }
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', function(event) {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('userDropdown');
    
    if (userMenu && dropdown && !userMenu.contains(event.target) && dropdown.classList.contains('show')) {
      closeUserDropdown();
    }
  });

  // Expose functions to global scope for button onclick handlers
  window.toggleUserDropdown = toggleUserDropdown;
  window.handleProfile = handleProfile;
  window.handleLogout = handleLogout;
}

// Initialize user data and dropdown when page loads
document.addEventListener("DOMContentLoaded", function() {
  initializeUserData();
  initializeUserDropdown();
});
