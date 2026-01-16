import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

/* ================= FIREBASE ================= */
const firebaseConfig = {
  apiKey: "AIzaSyC1705Xy74qwXt8aOgvZGBIYs8uMU6u3js",
  authDomain: "ironnrootfitness-5156e.firebaseapp.com",
  projectId: "ironnrootfitness-5156e",
  storageBucket: "ironnrootfitness-5156e.firebasestorage.app",
  messagingSenderId: "508351386284",
  appId: "1:508351386284:web:289185a2ff7a08b8ef0509",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

/* ================= CACHE ================= */
const usersCache = {};

/* ================= DOM ================= */
const collectionTitle = document.getElementById("collectionTitle");
const dataTable = document.getElementById("dataTable");
const tableHead = document.getElementById("tableHead");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const searchInput = document.getElementById("searchInput");
const pagination = document.getElementById("pagination");

const nutritionCount = document.getElementById("nutritionCount");
const workoutCount = document.getElementById("workoutCount");
const coachingCount = document.getElementById("coachingCount");

/* ================= STATE ================= */
const ROWS_PER_PAGE = 10;
let currentPage = 1;
let originalRows = [];
let currentType = "normal";

/* ================= LOAD USERS ================= */
async function loadUsers() {
  const snap = await getDocs(collection(db, "users"));
  snap.forEach(docSnap => {
    usersCache[docSnap.id] = docSnap.data();
  });
}

/* ================= AUTH ================= */
onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = "admin.html";
  } else {
    await loadUsers(); // 🔥 IMPORTANT
    loadData("personal_nutrition_plan", "🥗 Personal Nutrition Plan", "normal");
  }
});

/* ================= HELPERS ================= */
function timeAgo(createdAt) {
  let date;

  if (createdAt?.seconds) {
    date = new Date(createdAt.seconds * 1000);
  } else {
    date = new Date(createdAt);
  }

  if (isNaN(date.getTime())) return "N/A";

  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

function updateCount(col, count) {
  if (col === "personal_nutrition_plan")
    nutritionCount.textContent = `🥗 Personal Nutrition: ${count}`;
  if (col === "personal_workout_plan")
    workoutCount.textContent = `🏋️ Personal Workouts: ${count}`;
  if (col === "ultimate_personal_coaching")
    coachingCount.textContent = `🔥 Ultimate Coaching: ${count}`;
}

/* ================= LOAD DATA ================= */
async function loadData(colName, title, type) {
  currentType = type;
  collectionTitle.textContent = title;
  dataTable.innerHTML = `<tr><td>Loading...</td></tr>`;
  pagination.innerHTML = "";
  currentPage = 1;
  originalRows = [];

  tableHead.innerHTML = `
    <tr>
      <th>Name</th>
      <th>Gender</th>
      <th>Age</th>
      <th>Phone</th>
      <th>Email</th>
      <th>Amount</th>
      <th>Status</th>
      <th>Payment ID</th>
      <th>Time</th>
    </tr>
  `;

  const snapshot = await getDocs(collection(db, colName));
  updateCount(colName, snapshot.size);
  dataTable.innerHTML = "";

  if (snapshot.empty) {
    dataTable.innerHTML = `<tr><td colspan="9" style="text-align:center;">No data found</td></tr>`;
    return;
  }

  const docs = snapshot.docs.sort((a, b) => {
    const aTime = a.data().createdAt ? new Date(a.data().createdAt).getTime() : 0;
    const bTime = b.data().createdAt ? new Date(b.data().createdAt).getTime() : 0;
    return bTime - aTime;
  });

  docs.forEach(docSnap => {
    const data = docSnap.data();
    const user = usersCache[data.userId] || {};

    const fullName = user.fullName || "Unknown User";
    const phone = user.phone || "N/A";
    const email = user.email || "N/A";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${fullName}</td>
      <td>${data.gender || "N/A"}</td>
      <td>${data.age || "N/A"}</td>
      <td>${phone}</td>
      <td>${email}</td>
      <td>${data.amount || 0}</td>
      <td>${data.status || "Pending"}</td>
      <td>${data.paymentId || "N/A"}</td>
      <td>${data.createdAt ? timeAgo(data.createdAt) : "N/A"}</td>
    `;

    tr.onclick = () =>
      openModal({
        ...data,
        user: { fullName, phone, email },
      });

    dataTable.appendChild(tr);
    originalRows.push(tr);
  });

  paginateTable();
}

/* ================= PAGINATION ================= */
function paginateTable() {
  const rows = Array.from(dataTable.querySelectorAll("tr"));
  const totalPages = Math.ceil(rows.length / ROWS_PER_PAGE);
  pagination.innerHTML = "";

  rows.forEach((row, i) => {
    row.style.display =
      i >= (currentPage - 1) * ROWS_PER_PAGE &&
      i < currentPage * ROWS_PER_PAGE
        ? ""
        : "none";
  });

  if (totalPages <= 1) return;

  const btn = (text, disabled, cb) => {
    const b = document.createElement("button");
    b.textContent = text;
    b.disabled = disabled;
    if (!disabled) b.onclick = cb;
    return b;
  };

  pagination.appendChild(btn("Prev", currentPage === 1, () => {
    currentPage--;
    paginateTable();
  }));

  pagination.appendChild(btn("Next", currentPage === totalPages, () => {
    currentPage++;
    paginateTable();
  }));
}

/* ================= SEARCH ================= */
searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  dataTable.innerHTML = "";

  const matched = originalRows.filter(tr =>
    tr.innerText.toLowerCase().includes(q)
  );

  if (!matched.length) {
    dataTable.innerHTML =
      `<tr><td colspan="9" style="text-align:center;">No match found</td></tr>`;
  } else {
    matched.forEach(tr => dataTable.appendChild(tr));
  }

  currentPage = 1;
  paginateTable();
});

/* ================= MODAL ================= */
function openModal(data) {
  modalBody.innerHTML = "";
  Object.entries(data).forEach(([k, v]) => {
    modalBody.innerHTML += `<p><strong>${k}:</strong> ${JSON.stringify(v)}</p>`;
  });
  modal.style.display = "block";
}
window.closeModal = () => (modal.style.display = "none");

/* ================= NAV ================= */
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".nav-btn").forEach(b =>
      b.classList.remove("active")
    );
    btn.classList.add("active");
    loadData(btn.dataset.col, btn.textContent, btn.dataset.type);
  };
});

/* ================= LOGOUT ================= */
window.logout = () =>
  signOut(auth).then(() => (window.location.href = "admin.html"));
