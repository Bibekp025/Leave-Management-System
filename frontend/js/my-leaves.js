document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("authToken");
  const tableBody = document.getElementById("leaveTableBody");
  
  // Pagination variables
  let allLeaves = [];
  let currentPage = 1;
  const recordsPerPage = 10;
  let totalPages = 0;
  let currentUser = null;

  if (!token) {
    tableBody.innerHTML = '<tr><td colspan="8">Please log in to view your leaves.</td></tr>';
    updatePaginationInfo(0, 0, 0);
    return;
  }

  // Initialize user data and load leaves
  initializeUserData();
  loadLeaves();

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
        localStorage.removeItem("authToken");
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
      localStorage.removeItem("authToken");
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
        allLeaves = leaves;
        totalPages = Math.ceil(leaves.length / recordsPerPage);
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
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const currentLeaves = allLeaves.slice(startIndex, endIndex);

    tableBody.innerHTML = "";

    // Hide or show the Actions column in the table header
    const actionsTh = document.querySelector('.leaves-table th:last-child');
    if (userCategory === 'student') {
      if (actionsTh) actionsTh.style.display = 'none';
    } else {
      if (actionsTh) actionsTh.style.display = '';
    }

    currentLeaves.forEach(leave => {
      const row = document.createElement("tr");

      // Format assigned user list
      let assignedDisplay = "-";
      if (userCategory === "student" && leave.assigned_teachers.length > 0) {
        assignedDisplay = leave.assigned_teachers.join(", ");
      } else if (userCategory === "teacher" && leave.assigned_hrs.length > 0) {
        assignedDisplay = leave.assigned_hrs.join(", ");
      }

      // Status or approval action buttons
      let actionButtons = "";
      if ((userCategory === "teacher" || userCategory === "hr") && leave.status === "pending") {
        actionButtons = `
          <button class="btn-approve" onclick="updateLeaveStatus(${leave.id}, 'approved')">Approve</button>
          <button class="btn-reject" onclick="updateLeaveStatus(${leave.id}, 'rejected')">Reject</button>
        `;
      } else {
        actionButtons =
          leave.status === "approved"
            ? "<small>✔ Approved</small>"
            : leave.status === "rejected"
            ? "<small>❌ Rejected</small>"
            : "<small>⌛ Pending</small>";
      }

      // Hide the Actions column cell for students
      if (userCategory === 'student') {
        row.innerHTML = `
          <td>${leave.user}</td>
          <td>${leave.leave_type}</td>
          <td>${leave.from_date}</td>
          <td>${leave.to_date}</td>
          <td>${leave.reason}</td>
          <td>${assignedDisplay}</td>
          <td class="status ${leave.status}">${capitalize(leave.status)}</td>
        `;
      } else {
        row.innerHTML = `
          <td>${leave.user}</td>
          <td>${leave.leave_type}</td>
          <td>${leave.from_date}</td>
          <td>${leave.to_date}</td>
          <td>${leave.reason}</td>
          <td>${assignedDisplay}</td>
          <td class="status ${leave.status}">${capitalize(leave.status)}</td>
          <td>${actionButtons}</td>
        `;
      }

      tableBody.appendChild(row);
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

