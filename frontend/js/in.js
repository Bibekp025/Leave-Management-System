// Authentication and Security Check
document.addEventListener("DOMContentLoaded", function () {
    const token = sessionStorage.getItem("authToken");
    
    if (!token) {
      window.location.href = "login.html";
      return;
    }
  
    // Initialize user data
    initializeUserData();
    
    // Initialize calendar and events
    initializeCalendar();
    initializeEvents();
    
    // Initialize user dropdown functionality
    initializeUserDropdown();
    
    fetchAndRenderCategories();
  });
  
  // User Data Management
  async function initializeUserData() {
    const token = sessionStorage.getItem("authToken");
    
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
      
      const user = await response.json();
      updateUserInterface(user);
      
    } catch (error) {
      console.error("Error fetching user info:", error);
      // Handle authentication error
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
  
  // Calendar and Holiday Management
  function initializeCalendar() {
    const nepaliMonths = [
      "Baisakh", "Jestha", "Asar", "Shrawan",
      "Bhadra", "Aswin", "Kartik", "Mangsir",
      "Poush", "Magh", "Falgun", "Chaitra"
    ];
  
    const englishMonths = [
      "January", "February", "March", "April",
      "May", "June", "July", "August",
      "September", "October", "November", "December"
    ];

    // Dynamic Nepali calendar conversion function
    function convertToNepaliDate(englishDate) {
      // Use UTC to avoid timezone issues
      function toUTCDate(date) {
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      }
      const nepaliNewYear = new Date(Date.UTC(2025, 3, 14)); // April 14, 2025 UTC
      const inputDate = toUTCDate(englishDate);
      const monthsData2082 = monthsData.filter(m => m.nepaliYear === 2082);
      const monthsData2083 = monthsData.filter(m => m.nepaliYear === 2083);
      let monthsList = monthsData2082;
      let nepaliYear = 2082;
      // If date is after the last month of 2082, switch to 2083
      if (inputDate >= new Date(Date.UTC(2026, 3, 13))) { // After Chaitra 30, 2082
        monthsList = monthsData2083;
        nepaliYear = 2083;
      }
      // Calculate days since Nepali New Year
      const daysSinceNewYear = Math.floor((inputDate - nepaliNewYear) / (1000 * 60 * 60 * 24));
      if (daysSinceNewYear < 0) {
        // Before supported range
        return {
          nepaliMonth: "Baisakh",
          nepaliYear: 2082,
          nepaliDay: 1,
          startDay: 0,
          days: 32
        };
      }
      // Walk through months to find the current Nepali month and day
      let dayCount = daysSinceNewYear;
      let monthIdx = 0;
      let monthData = monthsList[monthIdx];
      while (monthData && dayCount >= monthData.days) {
        dayCount -= monthData.days;
        monthIdx++;
        monthData = monthsList[monthIdx];
      }
      if (!monthData) {
        // After last month, roll over to next year
        return {
          nepaliMonth: monthsList[monthsList.length - 1].nepaliMonth,
          nepaliYear: nepaliYear,
          nepaliDay: monthsList[monthsList.length - 1].days,
          startDay: monthsList[monthsList.length - 1].startDay,
          days: monthsList[monthsList.length - 1].days
        };
      }
      return {
        nepaliMonth: monthData.nepaliMonth,
        nepaliYear: monthData.nepaliYear,
        nepaliDay: dayCount + 1,
        startDay: monthData.startDay,
        days: monthData.days
      };
    }
  
    const monthsData = [
      {
        nepaliMonth: "Baisakh",
        nepaliYear: 2082,
        englishMonth: "April",
        englishYear: 2025,
        startDay: 0,
        days: 31, // corrected
        holidays: {
          1: "Nepali New Year",
          8: "Loktantra Diwas",
          14: "Nawabarsha",
          22: "Ram Nawami",
          29: "Ghode Jatra"
        }
      },
      {
        nepaliMonth: "Jestha",
        nepaliYear: 2082,
        englishMonth: "May",
        englishYear: 2025,
        startDay: 3, // Baisakh 31 mod 7 = 3
        days: 31, // corrected
        holidays: {
          15: "Buddha Jayanti",
          29: "Ganatantra Diwas"
        }
      },
      {
        nepaliMonth: "Asar",
        nepaliYear: 2082,
        englishMonth: "June-July",
        englishYear: 2025,
        startDay: 6, // (Jestha 31 + startDay 3) mod 7 = 6
        days: 32, // correct
        holidays: {
          15: "Ropain Day",
          29: "Dahin"
        }
      },
      {
        nepaliMonth: "Shrawan",
        nepaliYear: 2082,
        englishMonth: "July",
        englishYear: 2025,
        startDay: 3, // (Asar 32 + startDay 6) mod 7 = 3
        days: 31,
        holidays: {
          5: "Nag Panchami",
          26: "Janai Purnima"
        }
      },
      {
        nepaliMonth: "Bhadra",
        nepaliYear: 2082,
        englishMonth: "August",
        englishYear: 2025,
        startDay: 0,
        days: 31,
        holidays: {
          1: "Gai Jatra",
          15: "Krishna Janmashtami",
          30: "Haritalika Teej"
        }
      },
      {
        nepaliMonth: "Aswin",
        nepaliYear: 2082,
        englishMonth: "September",
        englishYear: 2025,
        startDay: 3,
        days: 31,
        holidays: {
          1: "Ghatasthapana",
          7: "Fulpati",
          8: "Maha Asthami",
          9: "Maha Navami",
          10: "Vijaya Dashami",
          15: "Kojagrat Purnima"
        }
      },
      {
        nepaliMonth: "Kartik",
        nepaliYear: 2082,
        englishMonth: "October",
        englishYear: 2025,
        startDay: 6,
        days: 30,
        holidays: {
          1: "Kag Tihar",
          2: "Kukur Tihar",
          3: "Laxmi Puja",
          4: "Gobardhan Puja",
          5: "Bhai Tika"
        }
      },
      {
        nepaliMonth: "Mangsir",
        nepaliYear: 2082,
        englishMonth: "November",
        englishYear: 2025,
        startDay: 1,
        days: 30,
        holidays: {
          15: "Udhauli Parva",
          23: "Chhath Parva"
        }
      },
      {
        nepaliMonth: "Poush",
        nepaliYear: 2082,
        englishMonth: "December",
        englishYear: 2025,
        startDay: 3,
        days: 29,
        holidays: {
          1: "Poush Sankranti",
          15: "Yomari Punhi"
        }
      },
      {
        nepaliMonth: "Magh",
        nepaliYear: 2082,
        englishMonth: "January",
        englishYear: 2026,
        startDay: 4,
        days: 29,
        holidays: {
          15: "Maghe Sankranti",
          30: "Shree Panchami"
        }
      },
      {
        nepaliMonth: "Falgun",
        nepaliYear: 2082,
        englishMonth: "February",
        englishYear: 2026,
        startDay: 5,
        days: 30,
        holidays: {
          15: "Fagu Purnima",
          22: "Maha Shivaratri"
        }
      },
      {
        nepaliMonth: "Chaitra",
        nepaliYear: 2082,
        englishMonth: "March",
        englishYear: 2026,
        startDay: 0,
        days: 30,
        holidays: {
          8: "Ghode Jatra",
          25: "Ram Navami",
          30: "Chaite Dashain"
        }
      }
    ];
  
    let today = new Date();
    let currentADYear = today.getFullYear();
    let currentADMonth = today.getMonth();
    let currentADDay = today.getDate();
  
    // Get current Nepali date dynamically
    const currentNepaliDate = convertToNepaliDate(today);
    
    // Find the appropriate month in monthsData or create dynamic month
    let currentMonthIndex = monthsData.findIndex(month =>
      month.nepaliMonth === currentNepaliDate.nepaliMonth &&
      month.nepaliYear === currentNepaliDate.nepaliYear
    );
  
    if (currentMonthIndex === -1) {
      // If not found, default to current month index based on English month
      currentMonthIndex = currentADMonth;
      if (currentMonthIndex >= monthsData.length) {
        currentMonthIndex = 0; // Default to first month
      }
    }
  
    const calendarDays = document.getElementById('calendar-days');
    const nepaliMonthDisplay = document.getElementById('nepali-month');
    const englishMonthDisplay = document.getElementById('english-month');
    const nepaliTodayDisplay = document.getElementById('current-nepali');
    const englishTodayDisplay = document.getElementById('current-english');
  
    function renderCalendar() {
      // Recalculate today every render
      today = new Date();
      currentADYear = today.getFullYear();
      currentADMonth = today.getMonth();
      currentADDay = today.getDate();
  
      let monthData = monthsData[currentMonthIndex];
      nepaliMonthDisplay.textContent = `${monthData.nepaliMonth} ${monthData.nepaliYear}`;
      englishMonthDisplay.textContent = `${monthData.englishMonth} ${monthData.englishYear}`;
      
      // Update today's date display using dynamic conversion
      const currentNepaliDate = convertToNepaliDate(today);
      nepaliTodayDisplay.textContent = `Today: ${currentNepaliDate.nepaliMonth} ${currentNepaliDate.nepaliDay}, ${currentNepaliDate.nepaliYear}`;
      englishTodayDisplay.textContent = `${englishMonths[currentADMonth]} ${currentADDay}, ${currentADYear}`;
  
      calendarDays.innerHTML = '';
  
      for (let i = 0; i < monthData.startDay; i++) {
        const empty = document.createElement('div');
        empty.classList.add('calendar-day', 'empty');
        calendarDays.appendChild(empty);
      }
  
      for (let day = 1; day <= monthData.days; day++) {
        const dayEl = document.createElement('div');
        dayEl.classList.add('calendar-day');
        dayEl.textContent = day;
  
        const dayOfWeek = (monthData.startDay + day - 1) % 7;
  
        if (dayOfWeek === 6) dayEl.classList.add('saturday');
        if (monthData.holidays[day]) {
          dayEl.classList.add('holiday');
          dayEl.title = monthData.holidays[day];
        }
  
        // Check if this is today's date using dynamic conversion
        let isToday = false;
        const currentNepaliDate = convertToNepaliDate(today);
        
        // Check if this day matches today's Nepali date
        if (monthData.nepaliMonth === currentNepaliDate.nepaliMonth && 
            monthData.nepaliYear === currentNepaliDate.nepaliYear && 
            day === currentNepaliDate.nepaliDay) {
          isToday = true;
        }
        
        if (isToday) {
          dayEl.classList.add('today');
        }
  
        calendarDays.appendChild(dayEl);
      }
    }
  
    function findNextHoliday() {
      const today = new Date();
      const currentNepaliDate = convertToNepaliDate(today);
      const currentNepaliDay = currentNepaliDate.nepaliDay;
      const currentNepaliMonth = currentNepaliDate.nepaliMonth;
      const currentNepaliYear = currentNepaliDate.nepaliYear;
      
      // Find the next holiday from current date
      let nextHoliday = null;
      let nextHolidayDate = null;
      
      // Check current month first
      const currentMonthData = monthsData[currentMonthIndex];
      if (currentMonthData.holidays) {
        for (let day = currentNepaliDay + 1; day <= currentMonthData.days; day++) {
          if (currentMonthData.holidays[day]) {
            nextHoliday = currentMonthData.holidays[day];
            nextHolidayDate = `${currentMonthData.nepaliMonth} ${day}, ${currentMonthData.nepaliYear}`;
            break;
          }
        }
      }
      
      // If no holiday in current month, check next months
      if (!nextHoliday) {
        for (let i = currentMonthIndex + 1; i < monthsData.length; i++) {
          const monthData = monthsData[i];
          if (monthData.holidays) {
            const firstHolidayDay = Math.min(...Object.keys(monthData.holidays).map(Number));
            nextHoliday = monthData.holidays[firstHolidayDay];
            nextHolidayDate = `${monthData.nepaliMonth} ${firstHolidayDay}, ${monthData.nepaliYear}`;
            break;
          }
        }
      }
      
      // Update the holiday widget
      const nextHolidayContent = document.getElementById('nextHolidayContent');
      if (nextHoliday && nextHolidayDate) {
        nextHolidayContent.innerHTML = `
          <div class="holiday-item">${nextHoliday}</div>
          <div class="holiday-date">${nextHolidayDate}</div>
        `;
      } else {
        nextHolidayContent.innerHTML = `
          <div class="holiday-item">No upcoming holidays</div>
          <div class="holiday-date">Check back later</div>
        `;
      }
    }
  
    document.getElementById('prev-month').addEventListener('click', function () {
      if (currentMonthIndex > 0) {
        currentMonthIndex--;
        renderCalendar();
        findNextHoliday();
      }
    });
  
    document.getElementById('next-month').addEventListener('click', function () {
      if (currentMonthIndex < monthsData.length - 1) {
        currentMonthIndex++;
        renderCalendar();
        findNextHoliday();
      }
    });
  
    renderCalendar();
    findNextHoliday();
    // Add interval to update calendar every minute
    setInterval(() => {
      renderCalendar();
      findNextHoliday();
    }, 60000);
  }
  
  // Events Management with API Integration
  async function initializeEvents() {
    window.eventsManager = new EventsManager();
  }
  
  // Add a date formatting function near the top or before EventsManager
  function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    // Format: e.g., Jul 5, 2025 14:00
    return date.toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false
    });
  }
  
  class EventsManager {
    constructor() {
      this.events = [];
      this.currentIndex = 0;
      this.eventsPerPage = 3;
      this.filteredEvents = [];
      this.loadEvents();
      this.setupEventListeners();
    }
  
    async loadEvents() {
      const token = sessionStorage.getItem("authToken");
      try {
        const response = await fetch("http://127.0.0.1:8000/events/", {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const eventsData = await response.json();
        // Reverse the events so the latest is first
        this.events = (eventsData.results || eventsData || []).slice().reverse();
        this.filteredEvents = [...this.events];
        this.displayEvents();
      } catch (error) {
        console.error("Error loading events:", error);
        // Fallback to static events if API fails
        this.events = [
          { title: "Fresher's Party", date: "15 DEC 2025", location: "May 3 CMT Resort", category: "party", image: "./img/freshers.jpg" },
          { title: "Leadership Workshop", date: "22 DEC 2025", location: "Conference Hall", category: "training", image: "./img/freshers.jpg" },
          { title: "Annual Meeting", date: "28 DEC 2025", location: "Main Auditorium", category: "meeting", image: "./img/freshers.jpg" },
          { title: "Tech Innovation Summit", date: "5 JAN 2026", location: "Tech Center", category: "meeting", image: "./img/freshers.jpg" },
          { title: "Team Building Retreat", date: "12 JAN 2026", location: "Mountain Resort", category: "training", image: "./img/freshers.jpg" },
          { title: "New Year Celebration", date: "31 DEC 2025", location: "Rooftop Venue", category: "party", image: "./img/freshers.jpg" }
        ];
        // Reverse fallback events as well
        this.events.reverse();
        this.filteredEvents = [...this.events];
        this.displayEvents();
      }
    }
  
    displayEvents() {
      const start = this.currentIndex;
      const end = Math.min(start + this.eventsPerPage, this.filteredEvents.length);
      const eventsToShow = this.filteredEvents.slice(start, end);
      
      let eventsHTML = '';
      eventsToShow.forEach(event => {
        // Robust image URL logic
        let imageUrl = './img/freshers.jpg';
        if (event.image) {
          if (event.image.startsWith('http')) {
            imageUrl = event.image;
          } else {
            // Remove any leading slash to avoid double slashes
            const cleanPath = event.image.startsWith('/') ? event.image : '/' + event.image;
            imageUrl = `http://127.0.0.1:8000${cleanPath}`;
          }
        }
        // Format event date using start_time and end_time
        let eventDate = 'TBD';
        if (event.start_time) {
          eventDate = formatDateTime(event.start_time);
          if (event.end_time) {
            eventDate += ' - ' + formatDateTime(event.end_time);
          }
        }
        eventsHTML += `
          <div class="event-card">
            <div class="event-image">
              <img src="${imageUrl}" alt="${event.title}" onerror="this.src='./img/freshers.jpg'">
            </div>
            <div class="event-content">
              <div class="event-title">${event.title}</div>
              <div class="event-date">${eventDate}</div>
              <div class="event-location">${event.location || event.venue || 'Location TBD'}</div>
            </div>
          </div>
        `;
      });
      
      // Fill empty slots to maintain grid layout
      while (eventsToShow.length < 3) {
        eventsHTML += '<div class="event-card" style="opacity: 0; pointer-events: none;"></div>';
        eventsToShow.push({});
      }
      
      const eventsGrid = document.getElementById('eventsGrid');
      if (eventsGrid) {
        eventsGrid.innerHTML = eventsHTML;
      }
    }
  
    nextEvents() {
      if (this.currentIndex + this.eventsPerPage < this.filteredEvents.length) {
        this.currentIndex += this.eventsPerPage;
        this.displayEvents();
      }
    }
  
    previousEvents() {
      if (this.currentIndex > 0) {
        this.currentIndex = Math.max(0, this.currentIndex - this.eventsPerPage);
        this.displayEvents();
      }
    }
  
    filterEvents() {
      const searchTerm = document.getElementById('searchEvents')?.value.toLowerCase() || '';
      const categoryId = document.getElementById('eventCategory')?.value || '';
      this.filteredEvents = this.events.filter(event => {
        const matchesSearch = event.title?.toLowerCase().includes(searchTerm) ||
          event.location?.toLowerCase().includes(searchTerm) ||
          event.venue?.toLowerCase().includes(searchTerm) ||
          event.description?.toLowerCase().includes(searchTerm);
        // Match by category id if present, fallback to name for static events
        const matchesCategory = !categoryId ||
          (event.category && (event.category.id == categoryId || event.category === categoryId || event.category.name == categoryId));
        return matchesSearch && matchesCategory;
      });
      this.currentIndex = 0;
      this.displayEvents();
    }
  
    setupEventListeners() {
      const searchInput = document.getElementById('searchEvents');
      const categorySelect = document.getElementById('eventCategory');
      
      if (searchInput) {
        searchInput.addEventListener('input', () => this.filterEvents());
      }
      
      if (categorySelect) {
        categorySelect.addEventListener('change', () => this.filterEvents());
      }
    }
  
    // Add a method to add a new event at the beginning
    addEvent(newEvent) {
      this.events.unshift(newEvent);
      this.filteredEvents = [...this.events];
      this.currentIndex = 0;
      this.displayEvents();
    }
  }
  
  // User Dropdown Functions with Security
  function initializeUserDropdown() {
    // User Dropdown Functions
    function toggleUserDropdown() {
      const dropdown = document.getElementById('userDropdown');
      if (dropdown) {
        dropdown.classList.toggle('show');
      }
    }
  
    function handleProfile() {
      window.location.href = 'profile.html';
      closeUserDropdown();
    }
  
    function handleSettings() {
      alert('Settings functionality would go here');
      closeUserDropdown();
    }
  
    function handleSidebarLogout() {
      if (confirm('Are you sure you want to logout?')) {
        // Clear any stored authentication data
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('userData');
        
        // Redirect to login page
        window.location.href = 'login.html';
      }
    }
  
    function handleLogout() {
      if (confirm('Are you sure you want to logout?')) {
        // Clear any stored authentication data
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('userData');
        
        // Redirect to login page
        window.location.href = 'login.html';
      }
      closeUserDropdown();
    }
  
    function closeUserDropdown() {
      const dropdown = document.getElementById('userDropdown');
      if (dropdown) {
        dropdown.classList.remove('show');
      }
    }
  
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
      const userMenu = document.querySelector('.user-menu');
      const dropdown = document.getElementById('userDropdown');
      
      if (userMenu && dropdown && !userMenu.contains(event.target) && dropdown.classList.contains('show')) {
        closeUserDropdown();
      }
    });
  
    // Expose functions to global scope for button onclick handlers
    window.toggleUserDropdown = toggleUserDropdown;
    window.handleProfile = handleProfile;
    window.handleSettings = handleSettings;
    window.handleLogout = handleLogout;
    window.handleSidebarLogout = handleSidebarLogout;
    window.previousEvents = () => {
      const eventsManager = window.eventsManager;
      if (eventsManager) {
        eventsManager.previousEvents();
      }
    };
    window.nextEvents = () => {
      const eventsManager = window.eventsManager;
      if (eventsManager) {
        eventsManager.nextEvents();
      }
    };
  }
  
  // Apply Leave Button Handler
  function handleApplyLeave() {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      window.location.href = "login.html";
      return;
    }
    window.location.href = "apply-leave.html";
  }
  
  // Expose apply leave function globally
  window.handleApplyLeave = handleApplyLeave;

  // Add this function to fetch categories and populate the dropdown
  async function fetchAndRenderCategories() {
    const token = sessionStorage.getItem("authToken");
    try {
      const response = await fetch("http://127.0.0.1:8000/events/categories/", {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch categories");
      const categories = await response.json();
      const categorySelect = document.getElementById("eventCategory");
      if (categorySelect) {
        categorySelect.innerHTML = '<option value="">Event Category</option>';
        categories.forEach(cat => {
          categorySelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
        });
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }
