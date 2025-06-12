document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("authToken");

  const logoutBtn = document.getElementById("logoutBtn");
  const userDropdownBtn = document.getElementById("userDropdownBtn");
  const userDropdownMenu = document.getElementById("userDropdownMenu");
  const userFirstNameSpan = document.getElementById("userFirstName");
  const profileImage = document.getElementById("profileImage");
    const profileBtn = document.getElementById("profileBtn");
  if (!token) {
    window.location.href = "login.html";
    return;
  }
  if (profileBtn) {
  profileBtn.addEventListener("click", () => {
    window.location.href = "profile.html";
  });
}
  

  userDropdownBtn.addEventListener("click", (e) => {
    e.stopPropagation(); 
    userDropdownMenu.classList.toggle("show");
    
    const expanded = userDropdownBtn.getAttribute("aria-expanded") === "true";
    userDropdownBtn.setAttribute("aria-expanded", String(!expanded));
  });

  document.addEventListener("click", () => {
    if (userDropdownMenu.classList.contains("show")) {
      userDropdownMenu.classList.remove("show");
      userDropdownBtn.setAttribute("aria-expanded", "false");
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("authToken");
      window.location.href = "login.html";
    });
  }


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
      const displayName = user.first_name || user.name || user.username || "User";

      userFirstNameSpan.textContent = displayName;

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
