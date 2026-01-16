import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

// Firebase config (same as everywhere)
const firebaseConfig = {
  apiKey: "AIzaSyC1705Xy74qwXt8aOgvZGBIYs8uMU6u3js",
  authDomain: "ironnrootfitness-5156e.firebaseapp.com",
  projectId: "ironnrootfitness-5156e",
};

// ✅ SAFE INIT (no duplicate app error)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const btn = document.getElementById("actionBtn");
const PLAN_ID = "personal_workout_plan";

onAuthStateChanged(auth, (user) => {
  if (!btn) return;

  if (!user) {
    btn.innerText = "Sign up to continue";
    btn.onclick = () => {
      sessionStorage.setItem("selectedPlan", PLAN_ID);
      window.location.href = "login.html";
    };
  } else {
    btn.innerText = "Start Now";
    btn.onclick = () => {
      window.location.href = "personal-workout-plan-order-now.html";
    };
  }
});

