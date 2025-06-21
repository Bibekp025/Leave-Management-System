document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("authToken");
  const tableBody = document.getElementById("leaveTableBody");

  if (!token) {
    tableBody.innerHTML = '<tr><td colspan="6">Please log in to view your leaves.</td></tr>';
    return;
  }

  
  fetch("http://127.0.0.1:8000//user/self/", {
    headers: {
      "Authorization": `Token ${token}`,
      "Content-Type": "application/json"
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch user info");
      return res.json();
    })
    .then(user => {
      const userCategory = user.category; 
      console.log(userCategory)
      
      return fetch("http://127.0.0.1:8000/leave/leaves/", {
        headers: {
          "Authorization": `Token ${token}`,
          "Content-Type": "application/json"
        }
      }).then(res => {
        if (!res.ok) throw new Error("Failed to fetch leave data");
        return res.json().then(leaves => ({ leaves, userCategory }));
      });
    })
    .then(({ leaves, userCategory }) => {
      if (leaves.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">You have not applied for any leaves yet.</td></tr>';
        return;
      }

      tableBody.innerHTML = ""; 
document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("authToken");
  const tableBody = document.getElementById("leaveTableBody");

  if (!token) {
    tableBody.innerHTML = '<tr><td colspan="6">Please log in to view your leaves.</td></tr>';
    return;
  }

  
  fetch("http://127.0.0.1:8000//user/", {
    headers: {
      "Authorization": `Token ${token}`,
      "Content-Type": "application/json"
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch user info");
      return res.json();
    })
    .then(user => {
      const userCategory = user.category; 
      console.log(userCategory)
      return fetch("http://127.0.0.1:8000/leave/", {
        headers: {
          "Authorization": `Token ${token}`,
          "Content-Type": "application/json"
        }
      }).then(res => {
        if (!res.ok) throw new Error("Failed to fetch leave data");
        return res.json().then(leaves => ({ leaves, userCategory }));
      });
    })
    .then(({ leaves, userCategory }) => {
      if (leaves.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">You have not applied for any leaves yet.</td></tr>';
        return;
      }

      tableBody.innerHTML = ""; 

      leaves.forEach(leave => {
        const row = document.createElement("tr");

        let actionButtons = "";

        if (userCategory === "teacher") {
          if (leave.status === "pending") {
            actionButtons = `
              <button onclick="updateLeaveStatus(${leave.id}, 'approved')">Approve</button>
              <button onclick="updateLeaveStatus(${leave.id}, 'rejected')">Reject</button>
            `;
          } else if (leave.approved_by) {
            const actionLabel = leave.status === "approved" ? "Approved" : "Rejected";
            actionButtons = `<small>✔ ${actionLabel} by: ${leave.approved_by}</small>`;
          }
        } else {
          actionButtons = leave.status === "approved"
            ? "<small>✔ Approved</small>"
            : leave.status === "rejected"
              ? "<small>❌ Rejected</small>"
              : "<small>⌛ Pending</small>";
        }
        console.log(leave.user)
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
      console.error("Error:", error);
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
 
      leaves.forEach(leave => {
        const row = document.createElement("tr");

        let actionButtons = "";

        if (userCategory === "teacher" && leave.status === "pending") {
  actionButtons = `
    <button class="btn-approve" onclick="updateLeaveStatus(${leave.id}, 'approved')">Approve</button>
    <button class="btn-reject" onclick="updateLeaveStatus(${leave.id}, 'rejected')">Reject</button>
  `;
} else {
  if (leave.status === "approved" && leave.approved_by) {
    actionButtons = `<small>✔ Approved by: ${leave.approved_by.username}</small>`;
  } else if (leave.status === "rejected" && leave.approved_by) {
    actionButtons = `<small>❌ Rejected by: ${leave.approved_by.username}</small>`;
  } else {
    actionButtons = "<small>⌛ Pending</small>";
  }
}


        row.innerHTML = `
        <td>${leave.user.username}</td>
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
      console.error("Error:", error);
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
