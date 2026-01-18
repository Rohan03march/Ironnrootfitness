import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
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
// onAuthStateChanged(auth, user => {
//   if (!user) window.location.href = "admin.html";
//   else loadData("personal_nutrition_plan", "🥗 Personal Nutrition Plan", "normal");
// });

// onAuthStateChanged(auth, async (user) => {
//   if (!user) {
//     window.location.href = "admin.html";
//     return;
//   }

//   const userRef = doc(db, "users", user.uid);
//   const snap = await getDoc(userRef);

//   if (!snap.exists()) {
//     await signOut(auth);
//     window.location.href = "admin.html";
//     return;
//   }

//   const { isApproved } = snap.data();

//   // 🚫 BLOCK if NOT approved
//   if (isApproved !== true) {
//     await signOut(auth); // optional but recommended
//     window.location.href = "login.html";
//     return;
//   }

//   // ✅ APPROVED → allow dashboard
//   loadData("personal_nutrition_plan", "🥗 Personal Nutrition Plan", "normal");
// });

const loader = document.getElementById("accessloader");
const appRoot = document.getElementById("app");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("admin.html");
    return;
  }

  const snap = await getDoc(doc(db, "users", user.uid));

  // 🚫 NOT APPROVED → BLOCK DASHBOARD ONLY
  if (!snap.exists() || snap.data().isApproved !== true) {
    window.location.replace("login.html"); // or login.html if you want
    return;
  }

  // ✅ APPROVED → SHOW DASHBOARD
  loader.style.display = "none";
  appRoot.style.display = "block";

  loadData("personal_nutrition_plan", "🥗 Personal Nutrition Plan", "normal");
});



/* ================= HELPERS ================= */
function timeAgo(createdAt) {
  let date;
  if (createdAt?.seconds) date = new Date(createdAt.seconds * 1000);
  else date = new Date(createdAt);

  if (isNaN(date.getTime())) return "N/A";

  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60) return "Just now";
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} hrs ago`;
  if (sec < 2592000) return `${Math.floor(sec / 86400)} days ago`;
  return `${Math.floor(sec / 2592000)} months ago`;
}

function updateCount(col, count) {
  if (col === "personal_nutrition_plan") nutritionCount.textContent = `${count}`;
  if (col === "personal_workout_plan") workoutCount.textContent = `${count}`;
  if (col === "ultimate_personal_coaching") coachingCount.textContent = `${count}`;
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
  }
  else if (type === "visited") {
    tableHead.innerHTML = `
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Phone</th>
        <th>Plan</th>
      </tr>
    `;
  }
  else {
    tableHead.innerHTML = `
      <tr>
        <th>Name</th><th>Gender</th><th>Age</th><th>Phone</th>
        <th>Email</th><th>Amount</th><th>Status</th><th>Payment ID</th><th>Time</th>
      </tr>
    `;
  }

  let snapshot;

  /* ---------- FIRESTORE QUERY ---------- */
  if (type === "permissions") {
    const q = query(collection(db, "users"), where("isApproved", "==", false));
    snapshot = await getDocs(q);
  }
  else if (type === "visited") {
    const q = query(collection(db, "users"), where("offerUsed", "==", false));
    snapshot = await getDocs(q);
  }
  else {
    snapshot = await getDocs(collection(db, colName));
    updateCount(colName, snapshot.size);
  }

  dataTable.innerHTML = "";

  if (snapshot.empty) {
    dataTable.innerHTML = `<tr><td colspan="10" style="text-align:center;">No data found</td></tr>`;
    return;
  }

  /* ---------- SORT LATEST FIRST ---------- */
  const docs = snapshot.docs.sort((a, b) => {
    const at = a.data().createdAt ? new Date(a.data().createdAt).getTime() : 0;
    const bt = b.data().createdAt ? new Date(b.data().createdAt).getTime() : 0;
    return bt - at;
  });

  docs.forEach(docSnap => {
    const data = docSnap.data();
    const tr = document.createElement("tr");

    /* ===== PERMISSIONS ===== */
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
    }

    /* ===== VISITED USERS ===== */
    else if (type === "visited") {
      tr.innerHTML = `
        <td>${data.fullName || "N/A"}</td>
        <td>${data.email || "N/A"}</td>
        <td>${data.phone || "N/A"}</td>
        <td>${data.offerPlan || "N/A"}</td>
      `;
      tr.onclick = () => openModal(data);
    }

    /* ===== NORMAL PLANS ===== */
    else {
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
  const rows = Array.from(dataTable.querySelectorAll("tr")).filter(r => !r.classList.contains("no-match"));
  const totalPages = Math.ceil(rows.length / ROWS_PER_PAGE);

  pagination.innerHTML = "";
  if (totalPages <= 1) {
    rows.forEach(r => r.style.display = "");
    return;
  }

  rows.forEach((r, i) => {
    r.style.display = (i >= (currentPage - 1) * ROWS_PER_PAGE && i < currentPage * ROWS_PER_PAGE) ? "" : "none";
  });

  pagination.appendChild(createBtn("Prev", currentPage === 1, () => {
    currentPage--;
    paginateTable();
  }));

  for (let i = 1; i <= totalPages; i++) {
    pagination.appendChild(createPageBtn(i));
  }

  pagination.appendChild(createBtn("Next", currentPage === totalPages, () => {
    currentPage++;
    paginateTable();
  }));
}

function createBtn(text, disabled, fn) {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.disabled = disabled;
  if (!disabled) btn.onclick = fn;
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

/* ================= SEARCH ================= */
searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase().trim();
  dataTable.innerHTML = "";

  const matched = originalRows.filter(tr =>
    tr.textContent.toLowerCase().includes(q)
  );

  if (!matched.length) {
    dataTable.innerHTML = `<tr class="no-match"><td colspan="10" style="text-align:center;">No match found</td></tr>`;
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

