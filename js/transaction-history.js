import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC1705Xy74qwXt8aOgvZGBIYs8uMU6u3js",
  authDomain: "ironnrootfitness-5156e.firebaseapp.com",
  projectId: "ironnrootfitness-5156e",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const transactionsEl = document.getElementById("transactions");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    transactionsEl.innerHTML = `<p class="empty">⚠️ Please <a href="login.html" style="color:#ff4d4d;">login</a> to view your transactions.</p>`;
    return;
  }

  const collections = [
    { name: "personal_nutrition_plan", label: "Personal Nutrition Plan" },
    { name: "personal_workout_plan", label: "Personal Workout Plan" },
    { name: "ultimate_personal_coaching", label: "Ultimate Personal Coaching" },
  ];

  let allResults = [];

  // Loop through each plan collection and query by userId
  for (const col of collections) {
    try {
      const q = query(
        collection(db, col.name),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      snapshot.forEach((docSnap) => {
        allResults.push({ ...docSnap.data(), plan: col.label });
      });
    } catch (err) {
      console.error("Error fetching from", col.name, err);
    }
  }

  if (allResults.length === 0) {
    transactionsEl.innerHTML = `<p class="empty">No transactions found for your account.</p>`;
    return;
  }

  // Sort by createdAt descending
  allResults.sort((a, b) => {
    const aDate = a.createdAt?.toDate
      ? a.createdAt.toDate()
      : new Date(a.createdAt);
    const bDate = b.createdAt?.toDate
      ? b.createdAt.toDate()
      : new Date(b.createdAt);
    return bDate - aDate;
  });

  // Render transactions
  transactionsEl.innerHTML = allResults
    .map((tx) => {
      const date = tx.createdAt?.toDate
        ? tx.createdAt.toDate()
        : new Date(tx.createdAt);
      // Base amount
      const baseAmount = tx.amount || 0;

      // Convenience charges 2%
      const convenience = baseAmount * 0.02;

      // GST 18% on convenience
      const gst = convenience * 0.18;

      // Total amount
      const total = baseAmount + convenience + gst;
      return `
      <div class="card">
        <div class="plan">${tx.plan}</div>
        <div class="info">
          <p><strong>Payment ID:</strong> ${tx.paymentId || "N/A"}</p>
          <p><strong>Amount:</strong> ₹${total.toFixed(2)}</p>
          <p><strong>Date:</strong> 
                ${date.toLocaleString("en-GB", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
          </p>

          <p><strong>Status:</strong> <span class="status ${tx.status}">${
        tx.status
      }</span></p>
        </div>
      </div>
    `;
    })
    .join("");
});
