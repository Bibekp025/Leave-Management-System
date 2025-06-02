document.addEventListener("DOMContentLoaded", function () {
    const leaveTypeSelect = document.getElementById("leaveType");

    const token = localStorage.getItem("token"); // Replace "token" with your actual key

    fetch("http://127.0.0.1:8000/leave/leave-types/", {
      headers: {
        "Authorization": `Token ${token}`, // or `Token ${token}` for DRF TokenAuth
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
          option.value = item.id; // assuming API returns "id"
          option.textContent = item.name; // assuming API returns "name"
          leaveTypeSelect.appendChild(option);
        });
      })
      .catch(error => {
        console.error("Error fetching leave types:", error);
      });
  });