import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// Firebase config (matches project credentials)
const firebaseConfig = {
  apiKey: "AIzaSyC1705Xy74qwXt8aOgvZGBIYs8uMU6u3js",
  authDomain: "ironnrootfitness-5156e.firebaseapp.com",
  projectId: "ironnrootfitness-5156e",
  storageBucket: "ironnrootfitness-5156e.firebasestorage.app",
  messagingSenderId: "508351386284",
  appId: "1:508351386284:web:289185a2ff7a08b8ef0509",
  measurementId: "G-S6235MZEPC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Inject Stylesheet for Scheduling Modal
const styles = `
/* ==================== SCHEDULER MODAL STYLE ==================== */
.header-cta-btn {
  display: inline-flex;
  align-items: center;
  padding: 9px 20px;
  background: transparent;
  color: #ff4d4d;
  border: 2px solid #ff4d4d;
  border-radius: 30px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  transition: all 0.25s ease;
  white-space: nowrap;
  cursor: pointer;
  font-family: 'Oswald', sans-serif;
}
.header-cta-btn:hover {
  background: #ff4d4d;
  color: #fff;
  box-shadow: 0 0 20px rgba(255, 77, 77, 0.4);
  transform: translateY(-1px);
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* ==================== FLOATING ACTION BUTTON (FAB) ==================== */
.fab-cta {
  display: flex;
  align-items: center;
  gap: 8px;
  position: fixed;
  bottom: 24px;
  right: 20px;
  z-index: 9999;
  background: linear-gradient(135deg, #ff4d4d, #cc0000);
  color: #fff;
  text-decoration: none !important;
  border-radius: 50px;
  padding: 13px 20px 13px 16px;
  box-shadow: 0 6px 24px rgba(255, 77, 77, 0.55), 0 2px 8px rgba(0, 0, 0, 0.3);
  font-family: 'Nunito Sans', sans-serif;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.4px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  animation: fabEntrance 0.5s ease 1s both;
}

.fab-cta::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50px;
  border: 2px solid rgba(255, 77, 77, 0.5);
  animation: fabPulse 2s ease-out infinite;
  pointer-events: none;
}

.fab-cta:hover {
  transform: scale(1.06) translateY(-2px);
  box-shadow: 0 10px 32px rgba(255, 77, 77, 0.7), 0 4px 12px rgba(0, 0, 0, 0.3);
  color: #fff !important;
}

.fab-cta:active {
  transform: scale(0.97);
}

.fab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  font-size: 14px;
  flex-shrink: 0;
}

.fab-label {
  white-space: nowrap;
}

@keyframes fabPulse {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  70% {
    transform: scale(1.18);
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}

@keyframes fabEntrance {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}


/* ==================== WELCOME SECTION BUTTONS ==================== */
.about-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 25px;
}
.about-btns .primary-btn {
  margin: 0 !important;
}
.welcome-cta-btn {
  background: #ff4d4d !important;
  border-color: #ff4d4d !important;
  width: auto !important;
  padding: 0 24px !important;
  transition: all 0.3s ease !important;
}
.welcome-cta-btn:hover {
  background: #e60000 !important;
  border-color: #e60000 !important;
  box-shadow: 0 0 15px rgba(255, 77, 77, 0.4) !important;
}
.welcome-cta-btn::after {
  display: none !important;
}
@media (max-width: 768px) {
  .about-btns {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .about-btns .primary-btn {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box;
  }
}

.sched-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.sched-modal-overlay.active {
  opacity: 1;
  pointer-events: all;
}

.sched-modal-container {
  background: #141414;
  border: 1px solid #ff4d4d33;
  width: 900px;
  max-width: 95%;
  max-height: 90vh;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 77, 77, 0.15);
  overflow-y: auto;
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
  position: relative;
  transform: scale(0.9);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  color: #fff;
  font-family: 'Nunito Sans', sans-serif;
  display: grid;
  grid-template-columns: 1fr 1.2fr;
}

.sched-modal-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.sched-modal-overlay.active .sched-modal-container {
  transform: scale(1);
}

/* Close Button */
.sched-modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}

.sched-modal-close:hover {
  background: #ff4d4d;
  color: #fff;
  transform: rotate(90deg);
}

/* Left Column: Form & Message */
.sched-left-panel {
  padding: 40px;
  border-right: 1px solid #222;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.sched-header h2 {
  font-family: 'Oswald', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #ff4d4d;
  text-transform: uppercase;
  margin-bottom: 10px;
  letter-spacing: 1px;
}

.sched-header p {
  color: #bbb;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 25px;
}

.sched-form-group {
  margin-bottom: 15px;
}

.sched-form-group label {
  display: block;
  font-size: 12px;
  color: #ff4d4d;
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 6px;
  letter-spacing: 0.5px;
}

.sched-form-group input,
.sched-form-group textarea {
  width: 100%;
  background: #1c1c1c;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 10px 14px;
  color: #fff;
  font-family: inherit;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.sched-form-group input:focus,
.sched-form-group textarea:focus {
  outline: none;
  border-color: #ff4d4d;
}

/* Right Column: Calendar & Time Picker */
.sched-right-panel {
  padding: 40px;
  display: flex;
  flex-direction: column;
}

.sched-panel-title {
  font-family: 'Oswald', sans-serif;
  font-size: 20px;
  font-weight: 600;
  text-transform: uppercase;
  color: #fff;
  margin-bottom: 20px;
  border-bottom: 2px solid #ff4d4d;
  padding-bottom: 8px;
  display: inline-block;
  align-self: flex-start;
}

/* Calendar styling */
.sched-calendar-widget {
  margin-bottom: 20px;
}

.sched-calendar-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.sched-calendar-title {
  font-weight: 700;
  font-size: 16px;
  color: #fff;
}

.sched-nav-btn {
  background: #222;
  border: 1px solid #333;
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.sched-nav-btn:hover {
  background: #ff4d4d;
  border-color: #ff4d4d;
}

.sched-calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  text-align: center;
}

.sched-weekday-label {
  font-size: 11px;
  color: #ff4d4d;
  font-weight: 700;
  text-transform: uppercase;
  padding-bottom: 6px;
}

.sched-calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  background: #1a1a1a;
  border: 1px solid transparent;
  transition: all 0.15s ease;
  user-select: none;
}

.sched-calendar-day:hover:not(.disabled):not(.active) {
  background: #262626;
  border-color: #ff4d4d66;
}

.sched-calendar-day.disabled {
  color: #444;
  background: #111;
  cursor: not-allowed;
}

.sched-calendar-day.active {
  background: #ff4d4d;
  color: #fff;
  box-shadow: 0 0 10px rgba(255, 77, 77, 0.4);
}

/* Time Picker styling */
.sched-slots-title {
  font-size: 12px;
  color: #ff4d4d;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.sched-time-slots {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 25px;
}

.sched-time-slot {
  background: #1c1c1c;
  border: 1px solid #333;
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sched-time-slot:hover:not(.disabled):not(.active) {
  border-color: #ff4d4d;
  background: #252525;
}

.sched-time-slot.disabled {
  color: #444;
  background: #111;
  border-color: transparent;
  cursor: not-allowed;
}

.sched-time-slot.active {
  background: #ff4d4d;
  border-color: #ff4d4d;
  color: #fff;
  box-shadow: 0 0 10px rgba(255, 77, 77, 0.3);
}

/* Submit Button */
.sched-submit-btn {
  background: #ff4d4d;
  border: none;
  color: #fff;
  padding: 14px 20px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  font-family: 'Oswald', sans-serif;
  letter-spacing: 1px;
}

.sched-submit-btn:hover {
  background: #e60000;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(255, 77, 77, 0.35);
}

.sched-submit-btn:active {
  transform: translateY(0);
}

/* Success View */
.sched-success-view {
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  text-align: center;
  grid-column: span 2;
  min-height: 400px;
}

.sched-success-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(46, 204, 113, 0.15);
  border: 3px solid #2ecc71;
  color: #2ecc71;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  margin-bottom: 25px;
  animation: pulseSuccess 1.5s infinite alternate;
}

@keyframes pulseSuccess {
  from { transform: scale(1); box-shadow: 0 0 10px rgba(46, 204, 113, 0.2); }
  to { transform: scale(1.08); box-shadow: 0 0 20px rgba(46, 204, 113, 0.5); }
}

.sched-success-view h3 {
  font-family: 'Oswald', sans-serif;
  font-size: 28px;
  color: #2ecc71;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.sched-success-view p {
  color: #bbb;
  font-size: 15px;
  line-height: 1.6;
  max-width: 450px;
  margin-bottom: 30px;
}

/* Mobile responsive layout */
@media (max-width: 768px) {
  .sched-modal-container {
    grid-template-columns: 1fr;
    max-height: 95vh;
  }
  
  .sched-left-panel {
    border-right: none;
    border-bottom: 1px solid #222;
    padding: 30px 20px;
  }
  
  .sched-right-panel {
    padding: 30px 20px;
  }
  
  .sched-success-view {
    grid-column: span 1;
  }
}
`;

// Inject styles to Document Head
const styleEl = document.createElement("style");
styleEl.textContent = styles;
document.head.appendChild(styleEl);

// HTML Template for Booking Modal
const modalHtml = `
<div class="sched-modal-overlay" id="schedModalOverlay">
  <div class="sched-modal-container">
    <button class="sched-modal-close" id="schedModalClose">&times;</button>
    
    <!-- Left Panel: Info & Contact Details -->
    <div class="sched-left-panel" id="schedLeftPanel">
      <div class="sched-header">
        <h2>Book a Free<br>Body Transformation<br>Strategy Call</h2>
        <p>Get a personalized roadmap to achieve your fitness goals faster and smarter.</p>
      </div>
      
      <div class="sched-form">
        <div class="sched-form-group">
          <label for="schedName">Name</label>
          <input type="text" id="schedName" placeholder="Enter your full name" required>
        </div>
        
        <div class="sched-form-group">
          <label for="schedEmail">Email Address</label>
          <input type="email" id="schedEmail" placeholder="Enter your email" required>
        </div>
        
        <div class="sched-form-group">
          <label for="schedPhone">Phone Number</label>
          <input type="tel" id="schedPhone" placeholder="Enter your phone number" required>
        </div>
        
        <div class="sched-form-group" style="margin-bottom: 0;">
          <label for="schedReason">Reason for Call</label>
          <textarea id="schedReason" rows="3" placeholder="Tell us briefly what you'd like to discuss (e.g. Weight loss, strength training, diet plans)" required></textarea>
        </div>
      </div>
    </div>
    
    <!-- Right Panel: Calendar & Time Picker -->
    <div class="sched-right-panel" id="schedRightPanel">
      <div class="sched-panel-title">Select Date & Time</div>
      
      <!-- Interactive Calendar -->
      <div class="sched-calendar-widget">
        <div class="sched-calendar-nav">
          <button class="sched-nav-btn" id="schedPrevMonth">&lt;</button>
          <div class="sched-calendar-title" id="schedMonthTitle">June 2026</div>
          <button class="sched-nav-btn" id="schedNextMonth">&gt;</button>
        </div>
        
        <div class="sched-calendar-grid" id="schedCalendarGrid">
          <!-- Labels and Days will be generated by JS -->
        </div>
      </div>
      
      <!-- Time Slots -->
      <div class="sched-slots-container">
        <div class="sched-slots-title" id="schedSlotsTitle">Available Time Slots</div>
        <div class="sched-time-slots" id="schedTimeSlotsGrid">
          <!-- Time slots generated by JS -->
        </div>
      </div>
      
      <!-- Submit Button -->
      <button class="sched-submit-btn" id="schedSubmitBtn">🗓️ Book My Free Strategy Call</button>
    </div>
    
    <!-- Success Page (Hidden by default) -->
    <div class="sched-success-view" id="schedSuccessView">
      <div class="sched-success-icon">✓</div>
      <h3>Call Scheduled!</h3>
      <p id="schedSuccessMessage">Your free fitness consultation call has been successfully scheduled. We will reach out to you via your email or phone number at the selected date and time.</p>
      <button class="sched-submit-btn" id="schedSuccessCloseBtn" style="max-width: 200px;">Close Window</button>
    </div>
  </div>
</div>
`;

// Inject Modal HTML into Body
const modalContainerEl = document.createElement("div");
modalContainerEl.innerHTML = modalHtml;
document.body.appendChild(modalContainerEl);

// Helper for page-specific session storage key to track modal views per page
const getPageStorageKey = () => {
  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
  return `hasSeenScheduleModal_${page}`;
};

// State Variables
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth(); // 0-11
let selectedDateString = ""; // YYYY-MM-DD
let selectedTime = "";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
  "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM"
];

// Elements References
const modalOverlay = document.getElementById("schedModalOverlay");
const closeBtn = document.getElementById("schedModalClose");
const prevMonthBtn = document.getElementById("schedPrevMonth");
const nextMonthBtn = document.getElementById("schedNextMonth");
const monthTitle = document.getElementById("schedMonthTitle");
const calendarGrid = document.getElementById("schedCalendarGrid");
const timeSlotsGrid = document.getElementById("schedTimeSlotsGrid");
const submitBtn = document.getElementById("schedSubmitBtn");
const successView = document.getElementById("schedSuccessView");
const successMessage = document.getElementById("schedSuccessMessage");
const leftPanel = document.getElementById("schedLeftPanel");
const rightPanel = document.getElementById("schedRightPanel");
const successCloseBtn = document.getElementById("schedSuccessCloseBtn");

// Input Fields
const inputName = document.getElementById("schedName");
const inputEmail = document.getElementById("schedEmail");
const inputPhone = document.getElementById("schedPhone");
const inputReason = document.getElementById("schedReason");

// Event Listeners
closeBtn.addEventListener("click", closeModal);
successCloseBtn.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

prevMonthBtn.addEventListener("click", () => {
  const minDate = new Date();
  if (currentYear > minDate.getFullYear() || (currentYear === minDate.getFullYear() && currentMonth > minDate.getMonth())) {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar();
  }
});

nextMonthBtn.addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
});

submitBtn.addEventListener("click", handleBookingSubmit);

// Prefill form if user is logged in
onAuthStateChanged(auth, async (user) => {
  if (user) {
    inputEmail.value = user.email || "";
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        inputName.value = data.fullName || "";
        inputPhone.value = data.phone || "";
      }
    } catch (err) {
      console.error("Error prefilling booking form:", err);
    }
  }
});

// Function to open Modal
export function openModal() {
  // Mark as seen in this session so they are not prompted again
  sessionStorage.setItem(getPageStorageKey(), "true");

  // Reset states
  selectedDateString = "";
  selectedTime = "";
  successView.style.display = "none";
  leftPanel.style.display = "flex";
  rightPanel.style.display = "flex";
  
  // Reset fields if not authenticated (if authenticated, auth state prefill handles it)
  if (!auth.currentUser) {
    inputName.value = "";
    inputEmail.value = "";
    inputPhone.value = "";
    inputReason.value = "";
  }
  
  // Set current month/year view to today
  const today = new Date();
  currentYear = today.getFullYear();
  currentMonth = today.getMonth();
  
  renderCalendar();
  renderTimeSlots();
  
  modalOverlay.classList.add("active");
  document.body.style.overflow = "hidden"; // disable background scroll
}

// Function to close Modal
export function closeModal() {
  modalOverlay.classList.remove("active");
  document.body.style.overflow = ""; // restore scroll
  // Mark as seen in this session so they are not prompted again
  sessionStorage.setItem(getPageStorageKey(), "true");
}

// Render Calendar Logic
function renderCalendar() {
  calendarGrid.innerHTML = "";
  monthTitle.textContent = `${MONTH_NAMES[currentMonth]} ${currentYear}`;
  
  // Weekday Headers
  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  weekdays.forEach(day => {
    const el = document.createElement("div");
    el.className = "sched-weekday-label";
    el.textContent = day;
    calendarGrid.appendChild(el);
  });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize for comparison
  
  // First day of current view month
  const firstDay = new Date(currentYear, currentMonth, 1);
  const startDayIndex = firstDay.getDay(); // 0 (Sun) - 6 (Sat)
  
  // Total days in month
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Padding cells before the first day
  for (let i = 0; i < startDayIndex; i++) {
    const emptyCell = document.createElement("div");
    calendarGrid.appendChild(emptyCell);
  }
  
  // Generate Days
  for (let day = 1; day <= totalDays; day++) {
    const dayEl = document.createElement("div");
    dayEl.className = "sched-calendar-day";
    dayEl.textContent = day;
    
    const cellDate = new Date(currentYear, currentMonth, day);
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Disable past dates and present date (today)
    const isPastOrToday = cellDate <= today;
    if (isPastOrToday) {
      dayEl.classList.add("disabled");
    } else {
      if (dateStr === selectedDateString) {
        dayEl.classList.add("active");
      }
      
      dayEl.addEventListener("click", () => {
        // Remove active state from other days
        document.querySelectorAll(".sched-calendar-day").forEach(el => el.classList.remove("active"));
        dayEl.classList.add("active");
        selectedDateString = dateStr;
        selectedTime = ""; // reset time slot selection
        renderTimeSlots();
      });
    }
    
    calendarGrid.appendChild(dayEl);
  }
}

// Render Time Slots Logic
function renderTimeSlots() {
  timeSlotsGrid.innerHTML = "";
  
  if (!selectedDateString) {
    const messageEl = document.createElement("div");
    messageEl.style.gridColumn = "span 3";
    messageEl.style.color = "#777";
    messageEl.style.fontSize = "13px";
    messageEl.style.padding = "10px 0";
    messageEl.textContent = "Please select a date on the calendar first.";
    timeSlotsGrid.appendChild(messageEl);
    return;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  // Format tomorrow in YYYY-MM-DD locally to compare with selectedDateString
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
  const isTomorrow = selectedDateString === tomorrowStr;
  
  TIME_SLOTS.forEach(slot => {
    const slotEl = document.createElement("div");
    slotEl.className = "sched-time-slot";
    slotEl.textContent = slot;
    
    // If it's tomorrow (the next date), only allow slots starting around 3:00 PM (15:00 onwards)
    if (isTomorrow) {
      // Parse slot hour (e.g. "09:00 AM" -> hour: 9, min: 0)
      const parts = slot.split(" ");
      const timeParts = parts[0].split(":");
      let hour = parseInt(timeParts[0]);
      const isPm = parts[1] === "PM";
      
      if (isPm && hour !== 12) hour += 12;
      if (!isPm && hour === 12) hour = 0;
      
      if (hour < 15) { // 15 represents 3:00 PM
        return;
      }
    }
    
    if (slot === selectedTime) {
      slotEl.classList.add("active");
    }
    
    slotEl.addEventListener("click", () => {
      document.querySelectorAll(".sched-time-slot").forEach(el => el.classList.remove("active"));
      slotEl.classList.add("active");
      selectedTime = slot;
    });
    
    timeSlotsGrid.appendChild(slotEl);
  });
}

// Handle Form Submission
async function handleBookingSubmit() {
  const name = inputName.value.trim();
  const email = inputEmail.value.trim();
  const phone = inputPhone.value.trim();
  const reason = inputReason.value.trim();
  
  // Validation
  if (!name || !email || !phone || !reason) {
    alert("Please fill in all contact information fields.");
    return;
  }
  
  if (!selectedDateString) {
    alert("Please select a date on the calendar.");
    return;
  }
  
  if (!selectedTime) {
    alert("Please select a time slot.");
    return;
  }
  
  // Submit loading state
  submitBtn.disabled = true;
  submitBtn.textContent = "Scheduling...";
  
  try {
    // Add document to Firestore
    await addDoc(collection(db, "scheduled_calls"), {
      name,
      email,
      phone,
      reason,
      date: selectedDateString,
      time: selectedTime,
      createdAt: new Date().toISOString()
    });
    
    // Show success view
    successMessage.textContent = `Your free fitness call is scheduled for ${selectedDateString} at ${selectedTime}. We will contact you at ${email} / ${phone}.`;
    leftPanel.style.display = "none";
    rightPanel.style.display = "none";
    successView.style.display = "flex";
  } catch (error) {
    console.error("Error scheduling call: ", error);
    alert("There was an error scheduling your call. Please try again.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "🗓️ Book My Free Strategy Call";
  }
}

// Auto-Trigger Logic (Exit Intent, Time Delay, & Scroll Depth)
function initAutoTrigger() {
  // Check if user has already seen the modal on this page
  if (sessionStorage.getItem(getPageStorageKey())) {
    return;
  }

  // Helper to trigger the modal safely and clean up
  const triggerModal = () => {
    if (!sessionStorage.getItem(getPageStorageKey())) {
      openModal();
      cleanup();
    }
  };

  // Cleanup listeners and timers
  const cleanup = () => {
    clearTimeout(timeDelayTimeout);
    document.removeEventListener("mouseleave", handleMouseLeave);
    window.removeEventListener("scroll", handleScroll);
  };

  // 1. Time-on-page delay: Auto-trigger after 20 seconds (Mobile Only)
  let timeDelayTimeout;
  if (window.innerWidth <= 768) {
    timeDelayTimeout = setTimeout(triggerModal, 20000); // 20 seconds
  }

  // 2. Exit-intent trigger (Desktop Only): Trigger when mouse moves out of viewport top
  const handleMouseLeave = (e) => {
    if (window.innerWidth > 768 && e.clientY < 20) {
      triggerModal();
    }
  };
  document.addEventListener("mouseleave", handleMouseLeave);

  // 3. Scroll-depth trigger (Mobile Only): Trigger when scrolled 50% down
  const handleScroll = () => {
    if (window.innerWidth <= 768) {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollHeight > 0) {
        const scrollPercentage = (scrollTop / scrollHeight) * 100;
        if (scrollPercentage >= 50) {
          triggerModal();
        }
      }
    }
  };
  window.addEventListener("scroll", handleScroll);
}

// Bind button clicks and auto-triggers
function init() {
  // Find all elements with class .btn-schedule-call and bind openModal to them
  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-schedule-call");
    if (btn) {
      e.preventDefault();
      openModal();
    }
  });

  // Initialize auto-trigger logic
  initAutoTrigger();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
