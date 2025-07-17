document.addEventListener("DOMContentLoaded", function () {
  const token = sessionStorage.getItem("authToken");
  const tableBody = document.getElementById("approvedLeaveTableBody");

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
    tableBody.innerHTML = '<tr><td colspan="6">Please log in to view approved leaves.</td></tr>';
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
    await initializeUserData();
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

  function loadLeaves() {
    fetch("http://127.0.0.1:8000/leave/", {
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(leaves => {
        // Only show leaves assigned to this teacher and approved
        if (!currentUser || currentUser.category !== "teacher") {
          tableBody.innerHTML = '<tr><td colspan="6">Only teachers can view approved student leaves here.</td></tr>';
          updatePaginationInfo(0, 0, 0);
          updatePaginationControls();
          return;
        }
        allLeaves = leaves.filter(leave =>
          leave.status === "approved" &&
          Array.isArray(leave.assigned_teachers) &&
          leave.assigned_teachers.includes(currentUser.id)
        ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        totalPages = Math.ceil(allLeaves.length / recordsPerPage);
        currentPage = 1;
        if (allLeaves.length === 0) {
          tableBody.innerHTML = '<tr><td colspan="6">No approved student leaves assigned to you.</td></tr>';
          updatePaginationInfo(0, 0, 0);
          updatePaginationControls();
          return;
        }
        displayCurrentPage();
        updatePaginationInfo(allLeaves.length, 1, Math.min(recordsPerPage, allLeaves.length));
        updatePaginationControls();
      })
      .catch(error => {
        console.error("Error:", error);
        tableBody.innerHTML = '<tr><td colspan="6">Unable to load leaves. Please try again later.</td></tr>';
        updatePaginationInfo(0, 0, 0);
        updatePaginationControls();
      });
  }

  function displayCurrentPage() {
    tableBody.innerHTML = "";
    const sortedLeaves = allLeaves.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const currentLeaves = sortedLeaves.slice(startIndex, endIndex);
    currentLeaves.forEach(leave => {
      const row = document.createElement("tr");
      let leaveTypeDisplay = leaveTypeMap[leave.leave_type] || leave.leave_type;
      let userDisplay = userMap[leave.user] || leave.user;
      row.innerHTML = `
        <td>${userDisplay}</td>
        <td>${leaveTypeDisplay}</td>
        <td>${leave.from_date}</td>
        <td>${leave.to_date}</td>
        <td>${leave.reason}</td>
        <td class="status approved">Approved</td>
      `;
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
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    pageNumbers.innerHTML = "";
    if (totalPages <= 1) return;
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
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
    for (let i = startPage; i <= endPage; i++) {
      addPageNumber(i);
    }
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
    displayCurrentPage();
    updatePaginationInfo(allLeaves.length, startIndex + 1, endIndex);
    updatePaginationControls();
  }

  // Global functions for pagination
  window.previousPage = function() {
    goToPage(currentPage - 1);
  };
  window.nextPage = function() {
    goToPage(currentPage + 1);
  };
}); 