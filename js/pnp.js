import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const form = document.getElementById("clientForm");
const submitPopup = document.getElementById("submitPopup");

let currentUser = null;
onAuthStateChanged(auth, (user) => currentUser = user);

// ✅ Get Stripe publishable key from Netlify
const keyResponse = await fetch("/.netlify/functions/stripe-publishable-key");
const { key } = await keyResponse.json();
const stripe = Stripe(key);

form.addEventListener("submit", async function(e) {
  e.preventDefault();
  if (!form.checkValidity()) return alert("Please fill all required fields correctly.");

  submitPopup.style.display = "flex";

  // Collect form data
  const formData = {};
  Array.from(form.elements).forEach(el => { if (el.name) formData[el.name] = el.value || null; });

  formData.userId = currentUser ? currentUser.uid : "guest_" + Date.now();
  formData.createdAt = new Date().toISOString();
  formData.status = "pending";
  formData.plan = "Personal Nutrition Plan";
  formData.amount = 1499; // INR

  const docId = formData.userId + "_" + Date.now();
  await setDoc(doc(db, "personal_nutrition_plan", docId), formData);

  // ✅ Call Netlify backend to create Checkout session
  try {
    const res = await fetch("/.netlify/functions/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData, docId }), // pass Firestore ID too
    });

    const data = await res.json();
    if (!data.id) throw new Error(data.error || "No session ID returned");

    // ✅ Redirect to Stripe Checkout (NOT popup)
    const result = await stripe.redirectToCheckout({ sessionId: data.id });

    if (result.error) {
      alert(result.error.message);
      submitPopup.style.display = "none";
    }
  } catch (err) {
    console.error(err);
    alert("❌ Payment initiation failed.");
    submitPopup.style.display = "none";
  }
});

