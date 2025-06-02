
  document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const tableBody = document.getElementById("leaveTableBody");

    if (!token) {
      console.error("No token found in localStorage. User might not be logged in.");
      tableBody.innerHTML = `<tr><td colspan="5">Please log in to view your leaves.</td></tr>`;
      return;
    }

    fetch("http://127.0.0.1:8000/leave/leaves/", {
      headers: {
        "Authorization": `Token ${token}`, // Or `Token ${token}` if using DRF TokenAuth
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      console.log("Leave API response:", response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(leaves => {
      console.log("Fetched leaves:", leaves);
      if (!Array.isArray(leaves) || leaves.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5">You have not applied for any leaves yet.</td></tr>`;
        return;
      }

      tableBody.innerHTML = ""; // Clear any placeholders

      leaves.forEach(leave => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${leave.leave_type?.name || "N/A"}</td>
          <td>${leave.start_date}</td>
          <td>${leave.end_date}</td>
          <td>${leave.reason}</td>
          <td class="status ${leave.status}">${capitalize(leave.status)}</td>
        `;

        tableBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error("Error fetching leaves:", error);
      tableBody.innerHTML = `<tr><td colspan="5">Error loading leave data. Check console for details.</td></tr>`;
    });

    function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  });

