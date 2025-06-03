document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("authToken");

  const logoutBtn = document.getElementById("logoutBtn");
  const userDropdownBtn = document.getElementById("userDropdownBtn");
  const userDropdownMenu = document.getElementById("userDropdownMenu");
  const userFirstNameSpan = document.getElementById("userFirstName");
  const profileImage = document.getElementById("profileImage");
    const profileBtn = document.getElementById("profileBtn");
  // Redirect to login if token is not present
  if (!token) {
    window.location.href = "login.html";
    return;
  }
  if (profileBtn) {
  profileBtn.addEventListener("click", () => {
    window.location.href = "profile.html";
  });
}
  

  // Toggle dropdown visibility by toggling 'show' class
  userDropdownBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent document click from immediately closing dropdown
    userDropdownMenu.classList.toggle("show");
    
    // Update aria-expanded for accessibility
    const expanded = userDropdownBtn.getAttribute("aria-expanded") === "true";
    userDropdownBtn.setAttribute("aria-expanded", String(!expanded));
  });

  // Close dropdown if click happens outside
  document.addEventListener("click", () => {
    if (userDropdownMenu.classList.contains("show")) {
      userDropdownMenu.classList.remove("show");
      userDropdownBtn.setAttribute("aria-expanded", "false");
    }
  });

  // Handle logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("authToken");
      window.location.href = "login.html";
    });
  }

  // Fetch user info
  fetch("http://127.0.0.1:8000/user/self/", {
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch user info");
      return res.json();
    })
    .then((user) => {
      // Use user.first_name or user.name or user.username as per your API response
      const displayName = user.first_name || user.name || user.username || "User";

      // Update username text content
      userFirstNameSpan.textContent = displayName;

      // Update profile image src or use default image
      profileImage.src = user.photo || "./img/Default_pfp.jpg";
      profileImage.alt = `${displayName}'s Profile Picture`;
    })
    .catch((error) => {
      console.error("Error fetching user info:", error);
      userFirstNameSpan.textContent = "Unknown";
      profileImage.src = "./img/Default_pfp.jpg";
      profileImage.alt = "Default Profile Picture";
    });
});
