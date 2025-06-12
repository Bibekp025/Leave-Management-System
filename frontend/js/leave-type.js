document.addEventListener("DOMContentLoaded", function () {
    const leaveTypeSelect = document.getElementById("leaveType");

    const token = localStorage.getItem("authToken"); 
    fetch("http://127.0.0.1:8000/leave/leave-types/", {
      headers: {
        "Authorization": `Token ${token}`, 
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to fetch leave types");
        }
        return response.json();
      })
      .then(data => {
        data.forEach(item => {
          const option = document.createElement("option");
          option.value = item.id; 
          option.textContent = item.name; 
          leaveTypeSelect.appendChild(option);
        });
      })
      .catch(error => {
        console.error("Error fetching leave types:", error);
      });
  });