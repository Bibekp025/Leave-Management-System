
document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("authToken");
  const tableBody = document.getElementById("leaveTableBody");

  if (!token) {
    tableBody.innerHTML = '<tr><td colspan="7">Please log in to view your leaves.</td></tr>';
    return;
  }

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
      if (leaves.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7">You have not applied for any leaves yet.</td></tr>';
        return;
      }

      tableBody.innerHTML = "";

      leaves.forEach(leave => {
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
        if (userCategory === "teacher" && leave.status === "pending") {
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

        tableBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error("Error:", error);
      tableBody.innerHTML = '<tr><td colspan="7">Unable to load leaves. Please try again later.</td></tr>';
    });

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

