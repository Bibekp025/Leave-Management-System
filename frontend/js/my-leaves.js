document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("authToken");
  const tableBody = document.getElementById("leaveTableBody");

  if (!token) {
    tableBody.innerHTML = '<tr><td colspan="6">Please log in to view your leaves.</td></tr>';
    return;
  }

  fetch("http://127.0.0.1:8000/leave/leaves/", {
    headers: {
      "Authorization": `Token ${token}`,
      "Content-Type": "application/json"
    }
  })
    .then(response => {
      if (!response.ok) throw new Error("Failed to fetch leave data");
      return response.json();
    })
    .then(leaves => {
      if (leaves.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">You have not applied for any leaves yet.</td></tr>';
        return;
      }
      
      tableBody.innerHTML = ""; // clear existing rows

      leaves.forEach(leave => {
        const row = document.createElement("tr");

        let actionButtons = "";

        
          if (leave.status === "pending") {
          actionButtons = `
            <button onclick="updateLeaveStatus(${leave.id}, 'approved')">Approve</button>
            <button onclick="updateLeaveStatus(${leave.id}, 'rejected')">Reject</button>
          `;
        }
        
        if (leave.approved_by) {
          const actionLabel = leave.status === "approved" ? "Approved" : "Rejected";
          actionButtons = `<small>✔ ${actionLabel} by: ${leave.approved_by}</small>`;
        }
      

        row.innerHTML = `
          <td>${leave.leave_type.name}</td>
          <td>${leave.start_date}</td>
          <td>${leave.end_date}</td>
          <td>${leave.reason}</td>
          <td class="status ${leave.status}">${capitalize(leave.status)}</td>

          <td>${actionButtons}</td>
        `;

        tableBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error("Error fetching leaves:", error);
      tableBody.innerHTML = '<tr><td colspan="6">Unable to load leaves. Please try again later.</td></tr>';
    });

  window.updateLeaveStatus = function (leaveId, status) {
    fetch(`http://127.0.0.1:8000/leave/leaves/${leaveId}/`, {
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
        return res.json();  // ensure backend sends a response body
      })
      .then(data => {
        alert(`Leave ${status}`);
        location.reload();
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
