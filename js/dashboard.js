import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, query, where } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

// Firebase config
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
const db = getFirestore(app);
const auth = getAuth();

// DOM elements
const collectionTitle = document.getElementById("collectionTitle");
const dataTable = document.getElementById("dataTable");
const tableHead = document.getElementById("tableHead");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");

const nutritionCount = document.getElementById("nutritionCount");
const workoutCount = document.getElementById("workoutCount");
const coachingCount = document.getElementById("coachingCount");
const contactsCount = document.getElementById("contactsCount");

// Initialize counts immediately
function initializeCounts() {
  nutritionCount.textContent = `🥗 Personal Nutrition: 0`;
  workoutCount.textContent = `🏋️ Personal Workouts: 0`;
  coachingCount.textContent = `🔥 Ultimate Coaching: 0`;
  contactsCount.textContent = `📩 Messages: 0`;
}
initializeCounts();

// Auth check
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "admin.html";
  } else {
    // Load all collections
    loadData("personal_nutrition_plan","🥗 Personal Nutrition Plan","normal");
    loadData("personal_workout_plan","🏋️ Personal Workout Plan","normal");
    loadData("ultimate_personal_coaching","🔥 Ultimate Personal Coaching","normal");
    loadData("contacts","📩 Messages","contact");
  }
});

// Helper: "time ago"
function timeAgo(dateString){
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date)/1000);
  const intervals = { year:31536000, month:2592000, day:86400, hour:3600, minute:60 };
  for(const [unit,value] of Object.entries(intervals)){
    const amount = Math.floor(seconds/value);
    if(amount>=1) return amount + " " + unit + (amount>1 ? "s" : "") + " ago";
  }
  return "Just now";
}

// Update counts
function updateCount(colName, count){
  switch(colName){
    case "personal_nutrition_plan": nutritionCount.textContent=`🥗 Personal Nutrition: ${count}`; break;
    case "personal_workout_plan": workoutCount.textContent=`🏋️ Personal Workouts: ${count}`; break;
    case "ultimate_personal_coaching": coachingCount.textContent=`🔥 Ultimate Coaching: ${count}`; break;
    case "contacts": contactsCount.textContent=`📩 Messages: ${count}`; break;
  }
}

// Load data
async function loadData(colName, title, type){
  collectionTitle.textContent = title;
  dataTable.innerHTML = `<tr><td>Loading...</td></tr>`;

  // Table headers
  if(type==="contact"){
    tableHead.innerHTML = `<tr><th>Name</th><th>Phone</th><th>Email</th><th>Time</th></tr>`;
  } else if(type==="permissions"){
    tableHead.innerHTML = `<tr><th>Name</th><th>Email</th><th>Status</th><th>Action</th></tr>`;
  } else {
    tableHead.innerHTML = `<tr><th>Name</th><th>Gender</th><th>Age</th><th>Phone</th><th>Email</th><th>Amount Paid</th><th>Status</th><th>Time</th></tr>`;
  }

  let snapshot;
  if(type==="permissions"){
    const usersRef = collection(db,"users");
    const q = query(usersRef, where("isApproved","==",false));
    snapshot = await getDocs(q);
  } else {
    snapshot = await getDocs(collection(db,colName));
  }

  dataTable.innerHTML = "";
  updateCount(colName, snapshot.size);

  if(snapshot.empty){
    dataTable.innerHTML = `<tr><td colspan="8">No data found</td></tr>`;
    return;
  }

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const row = document.createElement("tr");

    if(type==="permissions"){
      row.innerHTML = `
        <td>${data.fullName||""}</td>
        <td>${data.email||""}</td>
        <td>${data.isApproved?"Approved":"Pending"}</td>
        <td>${!data.isApproved?`<button class="approve-btn">Approve</button> <button class="deny-btn">Deny</button>`:""}</td>
      `;
      if(!data.isApproved){
        const approveBtn = row.querySelector(".approve-btn");
        const denyBtn = row.querySelector(".deny-btn");
        approveBtn?.addEventListener("click", async ()=> {
          await setDoc(doc(db,"users",docSnap.id), {...data,isApproved:true});
          loadData("permissions","🛠️ Permissions","permissions");
        });
        denyBtn?.addEventListener("click", async ()=> {
          await setDoc(doc(db,"users",docSnap.id), {...data,isApproved:false});
          loadData("permissions","🛠️ Permissions","permissions");
        });
      }
    } else if(type==="contact"){
      row.innerHTML = `
        <td>${data.name||""}</td>
        <td>${data.phone||"N/A"}</td>
        <td>${data.email||"N/A"}</td>
        <td>${data.createdAt ? timeAgo(data.createdAt) : "N/A"}</td>
      `;
    } else {
      row.innerHTML = `
        <td>${data.firstName||""} ${data.lastName||""}</td>
        <td>${data.gender||"N/A"}</td>
        <td>${data.age||"N/A"}</td>
        <td>${data.phone||"N/A"}</td>
        <td>${data.email||"N/A"}</td>
        <td>${data.amount||0}</td>
        <td>${data.status||"Pending"}</td>
        <td>${data.createdAt ? timeAgo(data.createdAt) : "N/A"}</td>
      `;
    }

    row.addEventListener("click", ()=> { if(type!=="permissions") openModal(data); });
    dataTable.appendChild(row);
  });
}

// Modal
function openModal(data){
  modalBody.innerHTML="";
  const hidden=["userId","user","createdAt"];
  const prettify = key=>key.replace(/([A-Z])/g," $1").replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase());
  for(const [key,value] of Object.entries(data)){
    if(hidden.includes(key)) continue;
    const val = (typeof value==="object" && value!==null)? JSON.stringify(value,null,2) : value;
    modalBody.innerHTML += `<p><strong>${prettify(key)}:</strong> ${val}</p>`;
  }
  modal.style.display="block";
}

window.closeModal = () => { modal.style.display="none"; }

// Navigation buttons
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    loadData(btn.dataset.col, btn.textContent, btn.dataset.type);
  });
});

// Logout
window.logout = () => {
  signOut(auth).then(()=> { window.location.href="admin.html"; })
  .catch(err=> { console.error(err); });
};
