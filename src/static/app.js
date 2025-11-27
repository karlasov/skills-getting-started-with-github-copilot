document.addEventListener("DOMContentLoaded", () => {
  // Simple in-memory activities data (replace with API calls as needed)
  const activities = [
    {
      id: "chess",
      name: "Chess Club",
      description: "Weekly strategy sessions and friendly matches.",
      schedule: "Tuesdays • 4:00–5:30 PM",
      capacity: 8,
      participants: ["alice@mergington.edu", "ben@mergington.edu"]
    },
    {
      id: "robotics",
      name: "Robotics Team",
      description: "Build and program robots for competitions.",
      schedule: "Wednesdays • 3:30–5:30 PM",
      capacity: 12,
      participants: ["carmen@mergington.edu"]
    },
    {
      id: "drama",
      name: "Drama Society",
      description: "Rehearsals, workshops, and seasonal plays.",
      schedule: "Fridays • 4:00–6:00 PM",
      capacity: 10,
      participants: []
    }
  ];

  // Utility selectors
  const $ = (s) => document.querySelector(s);

  function init() {
    if (!document.body) {
      console.error("DOM not ready");
      return;
    }

    const listEl = $("#activities-list");
    const selectEl = $("#activity");
    const form = $("#signup-form");
    const msgEl = $("#message");

    if (!listEl || !selectEl || !form || !msgEl) {
      console.error("Required DOM elements missing:", {
        listEl: !!listEl,
        selectEl: !!selectEl,
        form: !!form,
        msgEl: !!msgEl
      });
      return;
    }

    renderActivities();
    populateActivitySelect();

    form.addEventListener("submit", handleSignup);
  }

  function renderActivities() {
    const container = $("#activities-list");
    if (!container) return;
    container.innerHTML = "";
    activities.forEach(act => {
      const card = document.createElement("div");
      card.className = "activity-card";
      card.dataset.activityId = act.id;
      const spotsLeft = Math.max(0, act.capacity - (act.participants || []).length);
      const isFull = spotsLeft === 0;

      card.innerHTML = `
        <h4>${esc(act.name)}</h4>
        <p>${esc(act.description)}</p>

        <div class="activity-meta">
          <div class="activity-schedule">${esc(act.schedule)}</div>
          <div class="availability-badge ${isFull ? "availability-full" : "availability-open"}">
            ${isFull ? "Full" : spotsLeft + " spot" + (spotsLeft > 1 ? "s" : "") + " left"}
          </div>
        </div>

        <div class="participants-section">
          <div class="participants-header">
            <span>Participants</span>
            <span class="participants-count">${(act.participants || []).length}</span>
          </div>
          ${renderParticipantsHtml(act.participants)}
        </div>
      `;
      container.appendChild(card);
    });
  }

  function renderParticipantsHtml(list) {
    if (!list || list.length === 0) {
      return `<div class="participants-empty">No participants yet — be the first to sign up!</div>`;
    }
    const items = list.map(p => `<li><span class="participant-chip">${esc(p)}</span></li>`).join("");
    return `<ul class="participants-list">${items}</ul>`;
  }

  function populateActivitySelect() {
    const select = $("#activity");
    if (!select) return;
    // Remove previously generated options
    Array.from(select.querySelectorAll("option[data-generated]")).forEach(o => o.remove());
    activities.forEach(a => {
      const opt = document.createElement("option");
      opt.value = a.id;
      opt.textContent = a.name;
      opt.setAttribute("data-generated", "1");
      select.appendChild(opt);
    });
  }

  function handleSignup(e) {
    e.preventDefault();
    const email = ($("#email").value || "").trim().toLowerCase();
    const activityId = $("#activity").value;

    if (!validateEmail(email)) {
      showMessage("Please enter a valid email.", "error");
      return;
    }
    if (!activityId) {
      showMessage("Please select an activity.", "error");
      return;
    }

    const act = activities.find(a => a.id === activityId);
    if (!act) {
      showMessage("Activity not found.", "error");
      return;
    }

    const spotsLeft = act.capacity - (act.participants || []).length;
    if (spotsLeft <= 0) {
      showMessage("Sorry, this activity is full.", "error");
      return;
    }

    if ((act.participants || []).includes(email)) {
      showMessage("Email already signed up for this activity.", "error");
      return;
    }

    act.participants = act.participants || [];
    act.participants.push(email);
    updateActivityCard(act);
    $("#signup-form").reset();
    showMessage("Successfully signed up!", "success");
  }

  function updateActivityCard(act) {
    const card = document.querySelector(`.activity-card[data-activity-id="${act.id}"]`);
    if (!card) return;
    const spotsLeft = Math.max(0, act.capacity - act.participants.length);
    const badge = card.querySelector(".availability-badge");
    if (badge) {
      badge.className = "availability-badge " + (spotsLeft === 0 ? "availability-full" : "availability-open");
      badge.textContent = spotsLeft === 0 ? "Full" : `${spotsLeft} spot${spotsLeft > 1 ? "s" : ""} left`;
    }
    const count = card.querySelector(".participants-count");
    if (count) count.textContent = act.participants.length;
    const section = card.querySelector(".participants-section");
    if (section) {
      section.innerHTML = `
        <div class="participants-header">
          <span>Participants</span>
          <span class="participants-count">${act.participants.length}</span>
        </div>
        ${renderParticipantsHtml(act.participants)}
      `;
    }
  }

  function showMessage(text, type = "info") {
    const el = $("#message");
    if (!el) return;
    el.className = `message ${type}`;
    el.textContent = text;
    el.classList.remove("hidden");
    clearTimeout(el._hideTimer);
    el._hideTimer = setTimeout(() => el.classList.add("hidden"), 3500);
  }

  function validateEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  function esc(s) {
    if (!s) return "";
    return String(s).replace(/[&<>"']/g, ch =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])
    );
  }

  init();
});
