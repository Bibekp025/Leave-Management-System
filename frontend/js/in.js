   // Calendar and Holiday Management
   document.addEventListener("DOMContentLoaded", function () {
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

    const monthsData = [
      {
        nepaliMonth: "Baisakh",
        nepaliYear: 2082,
        englishMonth: "April",
        englishYear: 2025,
        startDay: 0,
        days: 32,
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
        startDay: 4,
        days: 31,
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
        startDay: 0,
        days: 32,
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
        startDay: 3,
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

    const today = new Date();
    const currentADYear = today.getFullYear();
    const currentADMonth = today.getMonth();
    const currentADDay = today.getDate();

    // For July 1, 2025 (Asar 17, 2082), we need to show Asar month
    // Since today is July 1, 2025, but Asar 17 falls in Asar month, show Asar
    // For July 2025, we want to show Asar month since Asar 17 falls in Asar
    let currentMonthIndex;
    if (currentADYear === 2025 && currentADMonth === 6) {
      // July 2025 - show Asar month (index 2)
      currentMonthIndex = 2;
    } else {
      currentMonthIndex = monthsData.findIndex(month =>
        month.englishYear === currentADYear &&
        month.englishMonth === englishMonths[currentADMonth]
      );
    }

    if (currentMonthIndex === -1) {
      // If not found, default to Asar
      currentMonthIndex = 2;
    }

    const calendarDays = document.getElementById('calendar-days');
    const nepaliMonthDisplay = document.getElementById('nepali-month');
    const englishMonthDisplay = document.getElementById('english-month');
    const nepaliTodayDisplay = document.getElementById('current-nepali');
    const englishTodayDisplay = document.getElementById('current-english');

    function renderCalendar() {
      const monthData = monthsData[currentMonthIndex];
      nepaliMonthDisplay.textContent = `${monthData.nepaliMonth} ${monthData.nepaliYear}`;
      englishMonthDisplay.textContent = `${monthData.englishMonth} ${monthData.englishYear}`;

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

        // Check if this is today's date with proper Nepali-English mapping
        let isToday = false;
        
        // Special mapping for July 1, 2025 = Asar 17, 2082
        if (currentADYear === 2025 && currentADMonth === 6 && currentADDay === 1) {
          if (monthData.nepaliMonth === "Asar" && monthData.nepaliYear === 2082 && day === 17) {
            isToday = true;
          }
        } else {
          // For other dates, use the standard logic
          isToday = (
            monthData.englishYear === currentADYear &&
            monthData.englishMonth === englishMonths[currentADMonth] &&
            day === currentADDay
          );
        }
        
        if (isToday) {
          dayEl.classList.add('today');
          if (currentADYear === 2025 && currentADMonth === 6 && currentADDay === 1) {
            nepaliTodayDisplay.textContent = `Today: Asar 17, 2082`;
            englishTodayDisplay.textContent = `July 1, 2025`;
          } else {
            nepaliTodayDisplay.textContent = `Today: ${monthData.nepaliMonth} ${day}, ${monthData.nepaliYear}`;
            englishTodayDisplay.textContent = `${monthData.englishMonth} ${currentADDay}, ${monthData.englishYear}`;
          }
        }

        calendarDays.appendChild(dayEl);
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

    // Function to find the next holiday
    function findNextHoliday() {
      const today = new Date();
      const currentADYear = today.getFullYear();
      const currentADMonth = today.getMonth();
      const currentADDay = today.getDate();
      
      // For July 1, 2025, we're on Asar 17, 2082
      let currentNepaliDay = 17;
      let currentNepaliMonth = "Asar";
      let currentNepaliYear = 2082;
      
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

    renderCalendar();
    findNextHoliday();
  });
  let lastCheckedDate = new Date().getDate();

setInterval(() => {
  const now = new Date();
  const currentDate = now.getDate();

  if (currentDate !== lastCheckedDate) {
  
      lastCheckedDate = currentDate;

      location.reload(); 
  }
}, 60000); 
      // Events Management
      class EventsManager {
          constructor() {
              this.events = [
                  { title: "Fresher's Party", date: "15 DEC 2025", location: "May 3 CMT Resort", category: "party" },
                  { title: "Leadership Workshop", date: "22 DEC 2025", location: "Conference Hall", category: "training" },
                  { title: "Annual Meeting", date: "28 DEC 2025", location: "Main Auditorium", category: "meeting" },
                  { title: "Tech Innovation Summit", date: "5 JAN 2026", location: "Tech Center", category: "meeting" },
                  { title: "Team Building Retreat", date: "12 JAN 2026", location: "Mountain Resort", category: "training" },
                  { title: "New Year Celebration", date: "31 DEC 2025", location: "Rooftop Venue", category: "party" }
              ];
              this.currentIndex = 0;
              this.eventsPerPage = 3;
              this.filteredEvents = [...this.events];
              this.displayEvents();
              this.setupEventListeners();
          }

          displayEvents() {
              const start = this.currentIndex;
              const end = Math.min(start + this.eventsPerPage, this.filteredEvents.length);
              const eventsToShow = this.filteredEvents.slice(start, end);
              
              let eventsHTML = '';
              eventsToShow.forEach(event => {
                  eventsHTML += `
                      <div class="event-card">
                          <div class="event-title">${event.title}</div>
                          <div class="event-date">${event.date}</div>
                          <div class="event-location">${event.location}</div>
                      </div>
                  `;
              });
              
              // Fill empty slots to maintain grid layout
              while (eventsToShow.length < 3) {
                  eventsHTML += '<div class="event-card" style="opacity: 0; pointer-events: none;"></div>';
                  eventsToShow.push({});
              }
              
              document.getElementById('eventsGrid').innerHTML = eventsHTML;
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
              const searchTerm = document.getElementById('searchEvents').value.toLowerCase();
              const category = document.getElementById('eventCategory').value;
              
              this.filteredEvents = this.events.filter(event => {
                  const matchesSearch = event.title.toLowerCase().includes(searchTerm) ||
                                      event.location.toLowerCase().includes(searchTerm);
                  const matchesCategory = !category || event.category === category;
                  return matchesSearch && matchesCategory;
              });
              
              this.currentIndex = 0;
              this.displayEvents();
          }

          setupEventListeners() {
              document.getElementById('searchEvents').addEventListener('input', () => this.filterEvents());
              document.getElementById('eventCategory').addEventListener('change', () => this.filterEvents());
          }
      }

      // User Dropdown Functions
      function toggleUserDropdown() {
          const dropdown = document.getElementById('userDropdown');
          dropdown.classList.toggle('show');
      }

      function handleProfile() {
          alert('Profile functionality would go here');
          closeUserDropdown();
      }

      function handleSettings() {
          alert('Settings functionality would go here');
          closeUserDropdown();
      }

      function handleSidebarLogout() {
          if (confirm('Are you sure you want to logout?')) {
              // Clear any stored authentication data
              localStorage.removeItem('authToken');
              localStorage.removeItem('userData');
              
              // Redirect to login page
              window.location.href = 'login.html';
          }
      }

      function handleLogout() {
          if (confirm('Are you sure you want to logout?')) {
              // Clear any stored authentication data
              localStorage.removeItem('authToken');
              localStorage.removeItem('userData');
              
              // Redirect to login page
              window.location.href = 'login.html';
          }
          closeUserDropdown();
      }

      function closeUserDropdown() {
          const dropdown = document.getElementById('userDropdown');
          dropdown.classList.remove('show');
      }

      // Close dropdown when clicking outside
      document.addEventListener('click', function(event) {
          const userMenu = document.querySelector('.user-menu');
          const dropdown = document.getElementById('userDropdown');
          
          if (!userMenu.contains(event.target) && dropdown.classList.contains('show')) {
              closeUserDropdown();
          }
      });

      // Initialize the dashboard
      document.addEventListener('DOMContentLoaded', () => {
          const calendarManager = new CalendarManager();
          const eventsManager = new EventsManager();
          
          // Expose functions to global scope for button onclick handlers
          window.changeMonth = (direction) => calendarManager.changeMonth(direction);
          window.previousEvents = () => eventsManager.previousEvents();
          window.nextEvents = () => eventsManager.nextEvents();
          window.toggleUserDropdown = toggleUserDropdown;
          window.handleProfile = handleProfile;
          window.handleSettings = handleSettings;
          window.handleLogout = handleLogout;
          window.handleSidebarLogout = handleSidebarLogout;
      });