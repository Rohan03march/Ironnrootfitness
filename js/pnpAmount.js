import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

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

const priceDiv = document.getElementById("planPrice");

async function fetchPlanPrice() {
  try {
    const planRef = doc(db, "plans", "personal_nutrition_plan");
    const planSnap = await getDoc(planRef);

    if(planSnap.exists()) {
      const planData = planSnap.data();
      priceDiv.textContent = `₹${planData.amount} ($${planData.amountUSD} USD)`;
    } else {
      priceDiv.textContent = "Price not available";
    }
  } catch(err) {
    console.error(err);
    priceDiv.textContent = "Error fetching price";
  }
}

fetchPlanPrice();
