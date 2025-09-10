// Fetch Razorpay key from Netlify function
const keyResponse = await fetch("/.netlify/functions/razorpay-key");
const { key } = await keyResponse.json();

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

// Elements
const form = document.getElementById('clientForm');
const submitPopup = document.getElementById('submitPopup');

let currentUser = null;
onAuthStateChanged(auth, user => currentUser = user);

form.addEventListener('submit', async function(e) {
  e.preventDefault();
  if (!form.checkValidity()) return alert('Please fill all required fields correctly.');
  submitPopup.style.display = 'flex';

  const formData = {};
  Array.from(form.elements).forEach(el => { if(el.name) formData[el.name] = el.value || null; });

  formData.userId = currentUser ? currentUser.uid : "guest_" + Date.now();
  formData.createdAt = new Date().toISOString();
  formData.status = "pending";
  formData.plan = "Personal Nutrition Plan";
  formData.amount = 1499;

  const docRef = doc(db, "personal_nutrition_plan", formData.userId + "_" + Date.now());
  try { await setDoc(docRef, formData); } 
  catch(err){ console.error(err); submitPopup.style.display = 'none'; return alert("❌ Error saving form."); }

  const options = {
    key: key,
    amount: formData.amount * 100,
    currency: "INR",
    name: "IronnRoot Fitness",
    description: "Personal Nutrition Plan Payment",
    prefill: { name: formData.firstName + " " + formData.lastName, email: formData.email || "", contact: formData.phone || "" },
    notes: { userId: formData.userId },
    theme: { color: "#ff4d4d" },
    handler: async function(response) {
      // Optional: verify payment server-side
      const verifyRes = await fetch("/.netlify/functions/verify-payment", {
        method: "POST",
        body: JSON.stringify(response),
      });
      const verifyData = await verifyRes.json();

      if (verifyData.valid) {
        await setDoc(docRef, { ...formData, status: "success", paymentId: response.razorpay_payment_id, amount: formData.amount });
        alert("✅ Payment confirmed. Form submitted!");
        form.reset();
      } else {
        alert("❌ Payment verification failed!");
      }
      submitPopup.style.display = 'none';
    },
    modal: {
      ondismiss: async function() {
        await setDoc(docRef, { ...formData, status: "failed", amount: formData.amount });
        submitPopup.style.display = 'none';
        alert("❌ Payment was cancelled.");
      }
    }
  };

  const rzp = new Razorpay(options);
  rzp.open();
});
