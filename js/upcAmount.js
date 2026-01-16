import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC1705Xy74qwXt8aOgvZGBIYs8uMU6u3js",
  authDomain: "ironnrootfitness-5156e.firebaseapp.com",
  projectId: "ironnrootfitness-5156e",
};

// ✅ Safe init
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const priceDiv = document.getElementById("planPrice");
const PLAN_ID = "ultimate_personal_coaching";

async function loadPrice(user) {
  const planRef = doc(db, "plans", PLAN_ID);
  const planSnap = await getDoc(planRef);

  if (!planSnap.exists()) {
    priceDiv.innerText = "Price not available";
    return;
  }

  let baseAmount = planSnap.data().amount;
  let finalAmount = baseAmount;
  let hasOffer = false;

  if (user) {
    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (userSnap.exists()) {
      const u = userSnap.data();

      if (
        u.offerEligible &&
        !u.offerUsed &&
        u.offerPlan === PLAN_ID
      ) {
        finalAmount = Math.round(baseAmount * 0.9);
        hasOffer = true;
      }
    }
  }

  // 🎨 UI rendering
  if (hasOffer) {
    priceDiv.innerHTML = `
      <div style="font-size:18px;color:#bbb;text-decoration:line-through;">
        ₹${baseAmount}
      </div>
      <div style="font-size:42px;color:#ff4d4d;">
        ₹${finalAmount}
      </div>
      <div style="margin-top:8px;color:#00ff99;font-weight:600;">
        🎉 Welcome Bonus – 10% OFF
      </div>
    `;
  } else {
    priceDiv.innerHTML = `<div style="font-size:42px;color:#ff4d4d;">₹${baseAmount}</div>`;
  }
}

onAuthStateChanged(auth, (user) => {
  loadPrice(user);
});
