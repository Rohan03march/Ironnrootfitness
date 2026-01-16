import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

const auth = getAuth();
const priceEl = document.getElementById("planPrice");
const hintEl = document.getElementById("priceHint");
const btn = document.getElementById("actionBtn");

onAuthStateChanged(auth, (user) => {
  if (user) {
    // 🔓 Reveal price
    priceEl.classList.remove("blurred");
    priceEl.classList.add("revealed");
    hintEl.classList.add("hide");

    btn.innerText = "Start Now";
    btn.onclick = () => {
      window.location.href = "personal-workout-plan-order-now.html";
    };
  } else {
    // 🔒 Keep price blurred
    priceEl.classList.add("blurred");
    priceEl.classList.remove("revealed");

    btn.innerText = "Sign up to continue";
    btn.onclick = () => {
      sessionStorage.setItem("selectedPlan", "personal_workout_plan");
      window.location.href = "login.html";
    };
  }
});
