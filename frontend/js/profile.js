document.addEventListener("DOMContentLoaded", () => {
  const token = sessionStorage.getItem("authToken");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  // Show loading state
  document.getElementById("profileForm").innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner"></div>
    </div>
  `;

  // Fetch user data from backend
  fetch("http://127.0.0.1:8000/user/self/", {
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch user data");
      return res.json();
    })
    .then(user => {
      // Store user data globally for editing
      window.currentUserData = user;
      window.originalUserData = { ...user };
      
      // Update profile header
      updateProfileHeader(user);
      
      // Update profile form
      updateProfileForm(user);
      
      // Update user menu in header
      updateUserMenu(user);
    })
    .catch(err => {
      console.error(err);
      document.getElementById("profileForm").innerHTML = `
        <div class="error-container">
          <div class="error-icon">⚠️</div>
          <h3>Error loading profile</h3>
          <p>Unable to load your profile information. Please try again later.</p>
        </div>
      `;
    });

  // Add event listeners
  setupEventListeners();
});

function updateProfileHeader(user) {
  // Update avatar with user's first name initial
  const avatar = document.getElementById("profileAvatar");
  const firstName = user.first_name || user.username;
  avatar.textContent = firstName.charAt(0).toUpperCase();
  
  // Update name
  const nameElement = document.getElementById("profileName");
  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
  nameElement.textContent = fullName;
  
  // Update role/category
  const roleElement = document.getElementById("profileRole");
  const category = user.category || 'User';
  roleElement.textContent = category.charAt(0).toUpperCase() + category.slice(1);
}

function updateProfileForm(user) {
  const profileForm = document.getElementById("profileForm");
  
  // Use only first name for the 'Full Name' field
  const fullName = user.first_name || '';
  
  profileForm.innerHTML = `
    <div class="form-group">
      <label class="form-label" for="fullName">Full Name</label>
      <input type="text" id="fullName" class="form-input" value="${fullName}" placeholder="Enter your full name">
    </div>
    <div class="form-group">
      <label class="form-label" for="username">Username</label>
      <input type="text" id="username" class="form-input" value="${user.username || ''}" placeholder="Enter username">
    </div>
    <div class="form-group">
      <label class="form-label" for="email">Email</label>
      <input type="email" id="email" class="form-input" value="${user.email || ''}" placeholder="Enter your email">
    </div>
  `;
}

function updateUserMenu(user) {
  // Update user avatar in header
  const userAvatar = document.querySelector(".user-avatar");
  const firstName = user.first_name || user.username;
  userAvatar.textContent = firstName.charAt(0).toUpperCase();
  
  // Update user name in header
  const userName = document.querySelector(".user-name");
  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
  userName.textContent = fullName;
}

function setupEventListeners() {
  // Confirm button event listener
  const confirmBtn = document.getElementById('confirmBtn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', saveChanges);
  }

  // Sidebar logout
  window.handleSidebarLogout = function() {
    sessionStorage.removeItem("authToken");
    window.location.href = "login.html";
  };

  // User dropdown toggle
  window.toggleUserDropdown = function() {
    const dropdown = document.getElementById("userDropdown");
    dropdown.classList.toggle("show");
  };

  // Profile navigation
  window.handleProfile = function() {
    window.location.href = "profile.html";
  };

  // Logout
  window.handleLogout = function() {
    sessionStorage.removeItem("authToken");
    window.location.href = "login.html";
  };

  // Close dropdown when clicking outside
  document.addEventListener("click", function(event) {
    const userMenu = document.querySelector(".user-menu");
    const dropdown = document.getElementById("userDropdown");
    
    if (userMenu && dropdown && !userMenu.contains(event.target)) {
      dropdown.classList.remove("show");
    }
  });
}

async function saveChanges() {
  const fullNameInput = document.getElementById('fullName');
  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');
  
  if (!fullNameInput || !usernameInput || !emailInput) {
    alert('Form elements not found. Please refresh the page.');
    return;
  }
  
  // Split full name into first and last name
  const fullName = fullNameInput.value.trim();
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  const updatedData = {
    ...window.currentUserData,
    first_name: firstName,
    last_name: lastName,
    username: usernameInput.value.trim(),
    email: emailInput.value.trim()
  };
  
  try {
    // Disable confirm button during save
    const confirmBtn = document.getElementById('confirmBtn');
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = `
      <div class="loading-spinner" style="width: 16px; height: 16px; border-width: 2px;"></div>
      Saving...
    `;
    
    // Send updated data to backend
    await saveChangesToBackend(updatedData);
    
    // Update local data
    window.currentUserData = updatedData;
    window.originalUserData = { ...updatedData };
    
    // Update profile header with new data
    updateProfileHeader(updatedData);
    updateUserMenu(updatedData);
    
    // Show in-page success message
    showProfileMessage('Profile updated successfully!', 'success');
    
  } catch (error) {
    console.error('Error saving changes:', error);
    alert('Failed to update profile. Please try again.');
    
    // Restore original values
    restoreOriginalValues();
  } finally {
    // Re-enable confirm button
    const confirmBtn = document.getElementById('confirmBtn');
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
      Confirm Edit
    `;
  }
}

function restoreOriginalValues() {
  if (window.originalUserData) {
    const fullNameInput = document.getElementById('fullName');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    
    if (fullNameInput && usernameInput && emailInput) {
      const fullName = `${window.originalUserData.first_name || ''} ${window.originalUserData.last_name || ''}`.trim();
      fullNameInput.value = fullName;
      usernameInput.value = window.originalUserData.username || '';
      emailInput.value = window.originalUserData.email || '';
    }
  }
}

// Function to save changes to backend
async function saveChangesToBackend(updatedData) {
  const token = sessionStorage.getItem("authToken");
  
  try {
    const response = await fetch("http://127.0.0.1:8000/user/update/", {
      method: "PATCH",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to update profile");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}

// Show in-page message (success or error)
function showProfileMessage(message, type = 'success') {
  let msgElem = document.getElementById('profileMsg');
  if (!msgElem) {
    msgElem = document.createElement('div');
    msgElem.id = 'profileMsg';
    msgElem.style.marginBottom = '16px';
    const form = document.getElementById('profileForm');
    if (form && form.parentNode) {
      form.parentNode.insertBefore(msgElem, form.nextSibling);
    }
  }
  msgElem.textContent = message;
  msgElem.className = type === 'success' ? 'profile-msg-success' : 'profile-msg-error';
  msgElem.style.display = 'block';
  setTimeout(() => {
    msgElem.style.display = 'none';
  }, 3000);
}
