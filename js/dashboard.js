import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, query, where } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

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

/* ================= AUTH ================= */
onAuthStateChanged(auth, user => {
  if (!user) window.location.href = "admin.html";
  else loadData("personal_nutrition_plan", "🥗 Personal Nutrition Plan", "normal");
});

/* ================= HELPERS ================= */
// function timeAgo(dateString) {
//   const diff = Math.floor((new Date() - new Date(dateString)) / 1000);
//   if (diff < 60) return "Just now";
//   if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
//   if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
//   return `${Math.floor(diff / 86400)} days ago`;
// }

function timeAgo(createdAt) {
  let date;

  // Firestore Timestamp support
  if (createdAt?.seconds) {
    date = new Date(createdAt.seconds * 1000);
  } else {
    date = new Date(createdAt);
  }

  if (isNaN(date.getTime())) return "N/A";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  const minute = 60;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  if (seconds < minute) return "Just now";
  if (seconds < hour) return `${Math.floor(seconds / minute)} min ago`;
  if (seconds < day) return `${Math.floor(seconds / hour)} hrs ago`;
  if (seconds < month) return `${Math.floor(seconds / day)} days ago`;
  if (seconds < year) return `${Math.floor(seconds / month)} months ago`;
  return `${Math.floor(seconds / year)} years ago`;
}


function updateCount(col, count) {
  if (col === "personal_nutrition_plan") nutritionCount.textContent = `🥗 Personal Nutrition: ${count}`;
  if (col === "personal_workout_plan") workoutCount.textContent = `🏋️ Personal Workouts: ${count}`;
  if (col === "ultimate_personal_coaching") coachingCount.textContent = `🔥 Ultimate Coaching: ${count}`;
}

/* ================= LOAD DATA ================= */
async function loadData(colName, title, type) {
  currentType = type;
  collectionTitle.textContent = title;
  dataTable.innerHTML = `<tr><td>Loading...</td></tr>`;
  pagination.innerHTML = "";
  currentPage = 1;
  originalRows = [];

  /* ---------- TABLE HEADERS ---------- */
  if (type === "permissions") {
    tableHead.innerHTML = `
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    `;
  } else {
    tableHead.innerHTML = `
      <tr>
        <th>Name</th><th>Gender</th><th>Age</th><th>Phone</th>
        <th>Email</th><th>Amount</th><th>Status</th><th>Payment ID</th><th>Time</th>
      </tr>
    `;
  }

  let snapshot;

  if (type === "permissions") {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("isApproved", "==", false));
    snapshot = await getDocs(q);
  } else {
    snapshot = await getDocs(collection(db, colName));
    updateCount(colName, snapshot.size);
  }

  dataTable.innerHTML = "";

  if (snapshot.empty) {
    dataTable.innerHTML = `<tr><td colspan="10" style="text-align:center;">No data found</td></tr>`;
    return;
  }

  /* ===== SORT: LATEST → EARLIEST ===== */
  const docs = snapshot.docs.sort((a, b) => {
    const aTime = a.data().createdAt ? new Date(a.data().createdAt).getTime() : 0;
    const bTime = b.data().createdAt ? new Date(b.data().createdAt).getTime() : 0;
    return bTime - aTime;
  });

  docs.forEach(docSnap => {
    const data = docSnap.data();
    const tr = document.createElement("tr");

    if (type === "permissions") {
      tr.innerHTML = `
        <td>${data.fullName || ""}</td>
        <td>${data.email || ""}</td>
        <td>${data.isApproved ? "Approved" : "Pending"}</td>
        <td>
          <button class="approve-btn">Approve</button>
          <button class="deny-btn">Deny</button>
        </td>
      `;

      tr.querySelector(".approve-btn").onclick = async () => {
        await setDoc(doc(db, "users", docSnap.id), { ...data, isApproved: true });
        loadData("permissions", "🛠️ Permissions", "permissions");
      };

      tr.querySelector(".deny-btn").onclick = async () => {
        await setDoc(doc(db, "users", docSnap.id), { ...data, isApproved: false });
        loadData("permissions", "🛠️ Permissions", "permissions");
      };
    } else {
      tr.innerHTML = `
        <td>${data.firstName || ""} ${data.lastName || ""}</td>
        <td>${data.gender || "N/A"}</td>
        <td>${data.age || "N/A"}</td>
        <td>${data.phone || "N/A"}</td>
        <td>${data.email || "N/A"}</td>
        <td>${data.amount || 0}</td>
        <td>${data.status || "Pending"}</td>
        <td>${data.paymentId || "N/A"}</td>
        <td>${data.createdAt ? timeAgo(data.createdAt) : "N/A"}</td>
      `;
      tr.onclick = () => openModal(data);
    }

    dataTable.appendChild(tr);
    originalRows.push(tr);
  });

  paginateTable();
}

/* ================= PAGINATION ================= */
function paginateTable() {
  if (!pagination) return;

  const rows = Array.from(dataTable.querySelectorAll("tr"))
    .filter(r => !r.classList.contains("no-match"));

  const totalPages = Math.ceil(rows.length / ROWS_PER_PAGE);
  pagination.innerHTML = "";
  pagination.style.display = "flex";

  if (rows.length === 0 || totalPages <= 1) {
    rows.forEach(r => (r.style.display = ""));
    return;
  }

  rows.forEach((row, i) => {
    row.style.display =
      i >= (currentPage - 1) * ROWS_PER_PAGE &&
      i < currentPage * ROWS_PER_PAGE
        ? ""
        : "none";
  });

  pagination.appendChild(createBtn("Prev", currentPage === 1, () => {
    currentPage--;
    paginateTable();
  }));

  const range = 2;
  let start = Math.max(1, currentPage - range);
  let end = Math.min(totalPages, currentPage + range);

  if (start > 1) {
    pagination.appendChild(createPageBtn(1));
    if (start > 2) pagination.appendChild(dots());
  }

  for (let i = start; i <= end; i++) {
    pagination.appendChild(createPageBtn(i));
  }

  if (end < totalPages) {
    if (end < totalPages - 1) pagination.appendChild(dots());
    pagination.appendChild(createPageBtn(totalPages));
  }

  pagination.appendChild(createBtn("Next", currentPage === totalPages, () => {
    currentPage++;
    paginateTable();
  }));
}

function createBtn(text, disabled, onClick) {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.disabled = disabled;
  btn.className = disabled ? "disabled" : "";
  if (!disabled) btn.onclick = onClick;
  return btn;
}

function createPageBtn(page) {
  const btn = document.createElement("button");
  btn.textContent = page;
  btn.classList.toggle("active", page === currentPage);
  btn.onclick = () => {
    currentPage = page;
    paginateTable();
  };
  return btn;
}

function dots() {
  const s = document.createElement("span");
  s.textContent = "...";
  s.className = "dots";
  return s;
}

/* ================= SEARCH ================= */
searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase().trim();
  dataTable.innerHTML = "";

  const matched = originalRows.filter(tr => {
    const text = Array.from(tr.querySelectorAll("td"))
      .map(td => td.textContent.toLowerCase())
      .join(" ");
    return text.includes(q);
  });

  if (matched.length === 0) {
    const tr = document.createElement("tr");
    tr.className = "no-match";
    tr.innerHTML = `<td colspan="10" style="text-align:center;">No match found</td>`;
    dataTable.appendChild(tr);
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
    modalBody.innerHTML += `<p><strong>${k}:</strong> ${v}</p>`;
  });
  modal.style.display = "block";
}
window.closeModal = () => modal.style.display = "none";

/* ================= NAV ================= */
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    loadData(btn.dataset.col, btn.textContent, btn.dataset.type);
  };
});

/* ================= LOGOUT ================= */
window.logout = () => signOut(auth).then(() => location.href = "admin.html");
