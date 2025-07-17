document.addEventListener("DOMContentLoaded", function () {
  const token = sessionStorage.getItem("authToken");
  const tableBody = document.getElementById("leaveTableBody");
  
  // Pagination variables
  let allLeaves = [];
  let currentPage = 1;
  const recordsPerPage = 7;
  let totalPages = 0;
  let currentUser = null;

  // Mappings for leave types and users
  let leaveTypeMap = {};
  let userMap = {};

  if (!token) {
    tableBody.innerHTML = '<tr><td colspan="8">Please log in to view your leaves.</td></tr>';
    updatePaginationInfo(0, 0, 0);
    return;
  }

  // Fetch leave types and users before loading leaves
  async function fetchMappings() {
    // Fetch leave types
    const leaveTypeRes = await fetch("http://127.0.0.1:8000/leave/leave-types/", {
      headers: { "Authorization": `Token ${token}` }
    });
    if (leaveTypeRes.ok) {
      const leaveTypes = await leaveTypeRes.json();
      leaveTypes.forEach(type => { leaveTypeMap[type.id] = type.name; });
    }
    // Fetch all users (for mapping assigned IDs to names)
    const userRes = await fetch("http://127.0.0.1:8000/user/", {
      headers: { "Authorization": `Token ${token}` }
    });
    if (userRes.ok) {
      const users = await userRes.json();
      users.forEach(user => { userMap[user.id] = user.username || user.first_name || user.email || user.id; });
    }
  }

  // Initialize user data and load leaves
  (async function init() {
    await fetchMappings();
  initializeUserData();
  loadLeaves();
  })();

  // User Data Management
  async function initializeUserData() {
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
      
      currentUser = await response.json();
      updateUserInterface(currentUser);
      
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

  // Initialize user dropdown functionality
  function initializeUserDropdown() {
    window.toggleUserDropdown = function() {
      const dropdown = document.getElementById("userDropdown");
      dropdown.classList.toggle("show");
    };

    window.handleProfile = function() {
      window.location.href = "profile.html";
    };

    window.handleLogout = function() {
      sessionStorage.removeItem("authToken");
      window.location.href = "login.html";
    };

    // Close dropdown when clicking outside
    document.addEventListener("click", function(event) {
      const userMenu = document.querySelector(".user-menu");
      const dropdown = document.getElementById("userDropdown");
      
      if (!userMenu.contains(event.target)) {
        dropdown.classList.remove("show");
      }
    });
  }

  // Initialize user dropdown
  initializeUserDropdown();

  function loadLeaves() {
    fetch("http://127.0.0.1:8000/user/self/", {
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(user => {
        const userCategory = user.category;

        return fetch("http://127.0.0.1:8000/leave/", {
          headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json"
          }
        }).then(res => res.json().then(leaves => ({ leaves, userCategory })));
      })
      .then(({ leaves, userCategory }) => {
        // Sort leaves by created_at descending (newest first)
        allLeaves = leaves.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        totalPages = Math.ceil(allLeaves.length / recordsPerPage);
        currentPage = 1;
        
        if (leaves.length === 0) {
          tableBody.innerHTML = '<tr><td colspan="8">You have not applied for any leaves yet.</td></tr>';
          updatePaginationInfo(0, 0, 0);
          updatePaginationControls();
          return;
        }

        displayCurrentPage(userCategory);
        updatePaginationInfo(leaves.length, 1, Math.min(recordsPerPage, leaves.length));
        updatePaginationControls();
      })
      .catch(error => {
        console.error("Error:", error);
        tableBody.innerHTML = '<tr><td colspan="8">Unable to load leaves. Please try again later.</td></tr>';
        updatePaginationInfo(0, 0, 0);
        updatePaginationControls();
      });
  }

  function displayCurrentPage(userCategory) {
    tableBody.innerHTML = "";
    // Debug: log all leaves to ensure all statuses are present
    
    // Always sort by created_at descending before paginating
    const sortedLeaves = allLeaves.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    // Temporary frontend fix: show all leaves, no filtering by user
    let filteredLeaves = sortedLeaves;
    const currentLeaves = filteredLeaves.slice(startIndex, endIndex);

    // Hide or show the Assigned To, Status, and Actions columns in the table header
    const table = document.querySelector('.leaves-table');
    const ths = table.querySelectorAll('th');
    // 0:User, 1:Leave Type, 2:From, 3:To, 4:Reason, 5:Assigned To, 6:Status, 7:Actions
    if (userCategory === 'teacher' || userCategory === 'hr') {
      if (ths[5]) ths[5].style.display = 'none'; // Assigned To
      if (ths[6]) ths[6].style.display = 'none'; // Status
      if (ths[7]) ths[7].style.display = ''; // Actions (show)
    } else {
      if (ths[5]) ths[5].style.display = '';
      if (ths[6]) ths[6].style.display = '';
      if (ths[7]) ths[7].style.display = 'none'; // Actions (hide for student)
    }

    currentLeaves.forEach(leave => {
      const row = document.createElement("tr");
      let leaveTypeDisplay = leaveTypeMap[leave.leave_type] || leave.leave_type;
      let assignedDisplay = "-";
      if (userCategory === "student" && leave.assigned_teachers.length > 0) {
        assignedDisplay = leave.assigned_teachers.map(id => userMap[id] || id).join(", ");
      } else if (userCategory === "teacher" && leave.assigned_hrs.length > 0) {
        assignedDisplay = leave.assigned_hrs.map(id => userMap[id] || id).join(", ");
      }
      let actionButtons = "";
      if ((userCategory === "teacher" || userCategory === "hr") && leave.status === "pending") {
        actionButtons = `
          <button class="btn-approve action-icon-btn" title="Approve">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="approveGradient" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#1a3a8f"/>
                  <stop offset="1" stop-color="#3A5FBE"/>
                </linearGradient>
                <filter id="tickShadow" x="-2" y="-2" width="28" height="28" filterUnits="userSpaceOnUse">
                  <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#3A5FBE" flood-opacity="0.25"/>
                </filter>
              </defs>
              <circle cx="12" cy="12" r="12" fill="url(#approveGradient)"/>
              <path d="M7 13.5L11 17L17 9.5" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" filter="url(#tickShadow)"/>
            </svg>
          </button>
          <button class="btn-reject action-icon-btn" title="Reject">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="rejectGradient" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#1a3a8f"/>
                  <stop offset="1" stop-color="#3A5FBE"/>
                </linearGradient>
                <filter id="crossShadow" x="-2" y="-2" width="28" height="28" filterUnits="userSpaceOnUse">
                  <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#1a3a8f" flood-opacity="0.25"/>
                </filter>
              </defs>
              <circle cx="12" cy="12" r="12" fill="url(#rejectGradient)"/>
              <path d="M8 8L16 16" stroke="#fff" stroke-width="2.8" stroke-linecap="round" filter="url(#crossShadow)"/>
              <path d="M16 8L8 16" stroke="#fff" stroke-width="2.8" stroke-linecap="round" filter="url(#crossShadow)"/>
            </svg>
          </button>
        `;
      } else {
        actionButtons =
          leave.status === "approved"
            ? `<span class="status-icon" title="Approved">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="statusBlueGradient" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#1a3a8f"/>
                      <stop offset="1" stop-color="#3A5FBE"/>
                    </linearGradient>
                  </defs>
                  <circle cx="12" cy="12" r="12" fill="url(#statusBlueGradient)"/>
                  <path d="M7 13.5L11 17L17 9.5" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="status-label">Approved</span>
              </span>`
            : leave.status === "rejected"
            ? `<span class="status-icon" title="Rejected">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="statusBlueGradient" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#1a3a8f"/>
                      <stop offset="1" stop-color="#3A5FBE"/>
                    </linearGradient>
                  </defs>
                  <circle cx="12" cy="12" r="12" fill="url(#statusBlueGradient)"/>
                  <path d="M8 8L16 16" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
                  <path d="M16 8L8 16" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
                </svg>
                <span class="status-label">Rejected</span>
              </span>`
            : `<span class="status-icon" title="Pending">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="statusBlueGradient" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#1a3a8f"/>
                      <stop offset="1" stop-color="#3A5FBE"/>
                    </linearGradient>
                  </defs>
                  <circle cx="12" cy="12" r="12" fill="url(#statusBlueGradient)"/>
                  <path d="M12 7V12L15 14" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="status-label">Pending</span>
              </span>`;
      }
      if (userCategory === 'student') {
        row.innerHTML = `
          <td>${leave.user}</td>
          <td>${leaveTypeDisplay}</td>
          <td>${leave.from_date}</td>
          <td>${leave.to_date}</td>
          <td>${leave.reason}</td>
          <td>${assignedDisplay}</td>
          <td class="status ${leave.status}">${actionButtons}</td>
        `;
      } else {
        row.innerHTML = `
          <td>${leave.user}</td>
          <td>${leaveTypeDisplay}</td>
          <td>${leave.from_date}</td>
          <td>${leave.to_date}</td>
          <td>${leave.reason}</td>
          <td style="display:none"></td>
          <td style="display:none"></td>
          <td>${actionButtons}</td>
        `;
      }
      tableBody.appendChild(row);

      // Add event listeners for approve/reject after row is added
      setTimeout(() => {
        const approveBtn = row.querySelector('.btn-approve');
        const rejectBtn = row.querySelector('.btn-reject');
        if (approveBtn) approveBtn.onclick = () => updateLeaveStatus(leave.id, 'approved');
        if (rejectBtn) rejectBtn.onclick = () => updateLeaveStatus(leave.id, 'rejected');
      }, 0);
    });
  }

  function updatePaginationInfo(totalRecords, startRecord, endRecord) {
    const paginationInfo = document.getElementById("paginationInfo");
    if (totalRecords === 0) {
      paginationInfo.textContent = "No records found";
    } else {
      paginationInfo.textContent = `Showing ${startRecord}-${endRecord} of ${totalRecords} records`;
    }
  }

  function updatePaginationControls() {
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const pageNumbers = document.getElementById("pageNumbers");

    // Update button states
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;

    // Generate page numbers
    pageNumbers.innerHTML = "";
    
    if (totalPages <= 1) {
      return;
    }

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      addPageNumber(1);
      if (startPage > 2) {
        const ellipsis = document.createElement("span");
        ellipsis.textContent = "...";
        ellipsis.style.padding = "0 8px";
        ellipsis.style.color = "#6c757d";
        pageNumbers.appendChild(ellipsis);
      }
    }

    // Add visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      addPageNumber(i);
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const ellipsis = document.createElement("span");
        ellipsis.textContent = "...";
        ellipsis.style.padding = "0 8px";
        ellipsis.style.color = "#6c757d";
        pageNumbers.appendChild(ellipsis);
      }
      addPageNumber(totalPages);
    }
  }

  function addPageNumber(pageNum) {
    const pageNumber = document.createElement("button");
    pageNumber.className = `page-number ${pageNum === currentPage ? 'active' : ''}`;
    pageNumber.textContent = pageNum;
    pageNumber.onclick = () => goToPage(pageNum);
    document.getElementById("pageNumbers").appendChild(pageNumber);
  }

  function goToPage(pageNum) {
    if (pageNum < 1 || pageNum > totalPages || pageNum === currentPage) {
      return;
    }
    
    currentPage = pageNum;
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = Math.min(startIndex + recordsPerPage, allLeaves.length);
    
    displayCurrentPage(getUserCategory());
    updatePaginationInfo(allLeaves.length, startIndex + 1, endIndex);
    updatePaginationControls();
  }

  function getUserCategory() {
    // Use the currentUser data if available
    if (currentUser && currentUser.category) {
      return currentUser.category;
    }
    
    // Fallback to determining from leave records
    if (allLeaves.length > 0) {
      return allLeaves[0].assigned_teachers ? "student" : "teacher";
    }
    return "student";
  }

  // Global functions for pagination
  window.previousPage = function() {
    goToPage(currentPage - 1);
  };

  window.nextPage = function() {
    goToPage(currentPage + 1);
  };

  window.updateLeaveStatus = function (leaveId, status) {
    fetch(`http://127.0.0.1:8000/leave/${leaveId}/`, {
      method: "PATCH",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: status })
    })
      .then(async res => {
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Error response:", errorText);
          throw new Error("Failed to update status");
        }
        return res.json();
      })
      .then(data => {
        alert(`Leave ${status}`);
        // Reload the current page data instead of full page reload
        loadLeaves();
      })
      .catch(error => {
        console.error("Error updating leave status:", error);
        alert("Error updating leave status.");
      });
  };

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
});

