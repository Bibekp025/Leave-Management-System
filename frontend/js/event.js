document.addEventListener("DOMContentLoaded", function () {
  fetchEvents();
});

function fetchEvents() {
  fetch("http://127.0.0.1:8000/events/events/")
    .then((response) => response.json())
    .then((data) => {
      const eventsContainer = document.getElementById("eventsContainer");
      eventsContainer.innerHTML = "";

      data.forEach((event) => {
        const eventCard = document.createElement("div");
        eventCard.className = "event-card";

        const description = event.description;
        const truncated = description.length > 100 ? description.slice(0, 100) + "..." : description;

        eventCard.innerHTML = `
          <img src="${event.image || './img/placeholder.jpg'}" alt="${event.title}" class="event-image" />
          <h3>${event.title}</h3>
          <p><strong>Location:</strong> ${event.location}</p>
          <p><strong>Time:</strong> ${formatDateTime(event.start_time)} - ${formatDateTime(event.end_time)}</p>
          <p class="event-description">${truncated}</p>
          ${description.length > 100 ? '<button class="read-more-btn">Read more</button>' : ''}
        `;

        eventsContainer.appendChild(eventCard);

        const readMoreBtn = eventCard.querySelector(".read-more-btn");
        if (readMoreBtn) {
          readMoreBtn.addEventListener("click", () => {
            const descEl = eventCard.querySelector(".event-description");
            const expanded = descEl.textContent !== truncated;
            descEl.textContent = expanded ? truncated : description;
            readMoreBtn.textContent = expanded ? "Read more" : "Show less";
          });
        }

        // Image modal
        const img = eventCard.querySelector(".event-image");
        img.addEventListener("click", () => openModal(event.image || './img/placeholder.jpg'));
      });
    })
    .catch((error) => {
      console.error("Error fetching events:", error);
    });
}

function formatDateTime(dateTimeStr) {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateTimeStr).toLocaleString(undefined, options);
}

function openModal(imageUrl) {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImg");
  modal.style.display = "block";
  modalImg.src = imageUrl;
}

function closeModal() {
  document.getElementById("imageModal").style.display = "none";
}




function scrollToEvents() {
  document.getElementById("eventsContainer").scrollIntoView({ behavior: "smooth", block: "start" });
}
