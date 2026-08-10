/* =========================================================
   PULSECARE — interactions
   ========================================================= */

/* ---------- data ---------- */
const doctors = [
  { name: "Dr. Meera Anand",   spec: "Cardiology",   status: "online",  next: "Today, 3:40 PM", exp: "12 yrs" },
  { name: "Dr. Arjun Rao",     spec: "Pediatrics",    status: "online",  next: "Today, 4:10 PM", exp: "8 yrs" },
  { name: "Dr. Kavya Nair",    spec: "Orthopedics",   status: "offline", next: "Tomorrow, 9:00 AM", exp: "15 yrs" },
  { name: "Dr. Sanjay Iyer",   spec: "Neurology",     status: "online",  next: "Today, 5:30 PM", exp: "10 yrs" },
  { name: "Dr. Priya Menon",   spec: "Dermatology",   status: "online",  next: "Today, 2:15 PM", exp: "6 yrs" },
  { name: "Dr. Rohan Kapoor",  spec: "Cardiology",    status: "offline", next: "Tomorrow, 11:00 AM", exp: "9 yrs" },
  { name: "Dr. Divya Suresh",  spec: "Pediatrics",    status: "online",  next: "Today, 6:00 PM", exp: "11 yrs" },
  { name: "Dr. Karthik Reddy", spec: "Neurology",     status: "online",  next: "Today, 4:45 PM", exp: "14 yrs" },
  { name: "Dr. Ananya Das",    spec: "Orthopedics",   status: "online",  next: "Today, 3:00 PM", exp: "7 yrs" },
];

const departments = [
  { label: "General ward",  total: 120, occupied: 96 },
  { label: "ICU",           total: 24,  occupied: 21 },
  { label: "Maternity",     total: 30,  occupied: 14 },
  { label: "Emergency bay", total: 18,  occupied: 9  },
];

const admissions = [
  { id: "PC-10231", dept: "Cardiology",  time: "08:12 AM", status: "Stable",     room: "A-204" },
  { id: "PC-10232", dept: "Orthopedics", time: "09:47 AM", status: "In surgery", room: "OT-2" },
  { id: "PC-10233", dept: "Pediatrics",  time: "10:15 AM", status: "Stable",     room: "B-110" },
  { id: "PC-10234", dept: "ICU",         time: "11:03 AM", status: "Critical",   room: "ICU-05" },
  { id: "PC-10235", dept: "Neurology",   time: "12:40 PM", status: "Observation",room: "C-302" },
];

const statusColor = { Stable: "#3FD69B", "In surgery": "#E8B34C", Critical: "#E8583D", Observation: "#8FD9C7" };

/* ---------- helpers ---------- */
const initials = (name) => name.replace("Dr. ", "").split(" ").map(w => w[0]).join("").slice(0, 2);

/* ---------- render doctors ---------- */
function renderDoctors(filter = "all") {
  const grid = document.getElementById("doctorGrid");
  grid.innerHTML = doctors.map(doc => `
    <article class="doctor-card reveal" data-spec="${doc.spec}" ${filter !== "all" && doc.spec !== filter ? "hidden" : ""}>
      <div class="doctor-card__top">
        <div class="doctor-avatar">${initials(doc.name)}</div>
        <div>
          <div class="doctor-card__name">${doc.name}</div>
          <div class="doctor-card__spec">${doc.spec}</div>
        </div>
        <span class="doctor-card__status">
          <span class="dot ${doc.status === "online" ? "dot--live" : ""}"></span>
          ${doc.status === "online" ? "Available" : "Offline"}
        </span>
      </div>
      <div class="doctor-card__meta">
        <span>Next slot<br><strong>${doc.next}</strong></span>
        <span>Experience<br><strong>${doc.exp}</strong></span>
      </div>
      <button class="btn ${doc.status === "online" ? "btn--solid" : "btn--outline"}" ${doc.status === "online" ? "" : "disabled"}>
        ${doc.status === "online" ? "Book this doctor" : "Notify when free"}
      </button>
    </article>
  `).join("");
  observeReveals();
}

document.getElementById("specialtyChips").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  document.querySelectorAll(".chip").forEach(c => c.classList.remove("is-active"));
  chip.classList.add("is-active");
  renderDoctors(chip.dataset.filter);
});

/* ---------- render ops board ---------- */
function renderOpsBoard() {
  const board = document.getElementById("opsBoard");
  board.innerHTML = departments.map(d => {
    const free = d.total - d.occupied;
    const pct = Math.round((d.occupied / d.total) * 100);
    return `
      <div class="ops-card reveal">
        <div class="ops-card__label">${d.label}</div>
        <div class="ops-card__value" data-count="${free}">0</div>
        <div class="ops-card__sub">beds free of ${d.total}</div>
        <div class="ops-card__bar"><span style="width:0%" data-target="${pct}"></span></div>
      </div>
    `;
  }).join("");
  observeReveals();
}

/* ---------- render admissions table ---------- */
function renderAdmissions() {
  const body = document.getElementById("patientTableBody");
  body.innerHTML = admissions.map(a => `
    <tr>
      <td>${a.id}</td>
      <td>${a.dept}</td>
      <td>${a.time}</td>
      <td><span class="status-chip"><span class="dot" style="background:${statusColor[a.status]}"></span>${a.status}</span></td>
      <td>${a.room}</td>
    </tr>
  `).join("");
}

/* ---------- count-up + bar fill when visible ---------- */
function animateOpsCard(card) {
  const valueEl = card.querySelector("[data-count]");
  const barEl = card.querySelector("[data-target]");
  if (valueEl && !valueEl.dataset.done) {
    valueEl.dataset.done = "1";
    const target = Number(valueEl.dataset.count);
    let current = 0;
    const step = Math.max(1, Math.round(target / 30));
    const tick = () => {
      current = Math.min(target, current + step);
      valueEl.textContent = current;
      if (current < target) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  if (barEl) barEl.style.width = barEl.dataset.target + "%";
}

/* ---------- generic scroll reveal ---------- */
function observeReveals() {
  const els = document.querySelectorAll(".reveal:not(.is-visible)");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        if (entry.target.classList.contains("ops-card")) animateOpsCard(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  els.forEach(el => io.observe(el));
}

/* ---------- hero section-pulse draw on load ---------- */
function initHeroPulse() {
  const poly = document.querySelector("#heroPulse polyline");
  const length = poly.getTotalLength();
  poly.style.strokeDasharray = length;
  poly.style.strokeDashoffset = length;
  poly.style.transition = "stroke-dashoffset 1.6s ease-out";
  requestAnimationFrame(() => {
    setTimeout(() => { poly.style.strokeDashoffset = 0; }, 300);
  });
}

/* ---------- live ticker ---------- */
function initTicker() {
  const messages = [
    "24 doctors online right now across 5 specialties",
    "Average wait time today: 9 minutes",
    "ICU beds available: 3 of 24",
    "142 patients checked in so far today",
  ];
  let i = 0;
  const el = document.getElementById("tickerText");
  const set = () => { el.textContent = messages[i % messages.length]; i++; };
  set();
  setInterval(set, 3800);
}

/* ---------- nav ---------- */
function initNav() {
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
  document.querySelectorAll(".nav__links a").forEach(link => {
    link.addEventListener("click", () => nav.classList.remove("is-open"));
  });
}

/* ---------- payment form (demo only — no real processing) ---------- */
function initPayForm() {
  const form = document.getElementById("payForm");
  const cardNumber = document.getElementById("cardNumber");
  const cardExpiry = document.getElementById("cardExpiry");
  const cardCvv = document.getElementById("cardCvv");
  const cardName = document.getElementById("cardName");
  const payBtn = document.getElementById("payBtn");
  const payBtnText = document.getElementById("payBtnText");

  cardNumber.addEventListener("input", () => {
    let digits = cardNumber.value.replace(/\D/g, "").slice(0, 16);
    cardNumber.value = digits.replace(/(.{4})/g, "$1 ").trim();
  });

  cardExpiry.addEventListener("input", () => {
    let digits = cardExpiry.value.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) digits = digits.slice(0, 2) + "/" + digits.slice(2);
    cardExpiry.value = digits;
  });

  cardCvv.addEventListener("input", () => {
    cardCvv.value = cardCvv.value.replace(/\D/g, "").slice(0, 3);
  });

  function setError(input, errorEl, message) {
    if (message) {
      input.classList.add("is-invalid");
      errorEl.textContent = message;
    } else {
      input.classList.remove("is-invalid");
      errorEl.textContent = "";
    }
    return !message;
  }

  function validate() {
    const digits = cardNumber.value.replace(/\D/g, "");
    const validNumber = setError(
      cardNumber, document.getElementById("cardNumberError"),
      digits.length === 16 ? "" : "Enter a 16-digit card number"
    );

    let validExpiry = true;
    const match = cardExpiry.value.match(/^(\d{2})\/(\d{2})$/);
    if (!match) {
      validExpiry = setError(cardExpiry, document.getElementById("cardExpiryError"), "Use MM/YY format");
    } else {
      const month = Number(match[1]);
      validExpiry = setError(
        cardExpiry, document.getElementById("cardExpiryError"),
        (month >= 1 && month <= 12) ? "" : "Enter a valid month"
      );
    }

    const validCvv = setError(
      cardCvv, document.getElementById("cardCvvError"),
      cardCvv.value.length === 3 ? "" : "3 digits required"
    );

    const validName = setError(
      cardName, document.getElementById("cardNameError"),
      cardName.value.trim().length > 1 ? "" : "Enter the name on the card"
    );

    return validNumber && validExpiry && validCvv && validName;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) return;

    payBtn.disabled = true;
    payBtnText.textContent = "Processing…";

    setTimeout(() => {
      payBtnText.textContent = "Payment successful";
      showToast("✓ ₹7,330.00 paid — receipt sent to your email");
      const pill = document.querySelector(".status-pill--due");
      if (pill) {
        pill.textContent = "Paid";
        pill.classList.remove("status-pill--due");
        pill.classList.add("status-pill--paid");
      }
      setTimeout(() => {
        payBtn.disabled = false;
        payBtnText.textContent = "Pay ₹7,330.00";
        form.reset();
      }, 2200);
    }, 1100);
  });
}

/* ---------- toast ---------- */
let toastTimer;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

/* ---------- init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderDoctors();
  renderOpsBoard();
  renderAdmissions();
  initHeroPulse();
  initTicker();
  initNav();
  initPayForm();
  observeReveals();
  document.querySelectorAll(".invoice-card, .pay-card, .patient-table-wrap").forEach(el => el.classList.add("reveal"));
  observeReveals();
});