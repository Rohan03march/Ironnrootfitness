// ultimate.js

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Elements
const form = document.getElementById('trainingForm');
const submitPopup = document.getElementById('submitPopup');
const thankYouMessage = document.getElementById('thankYouMessage');

let currentUser = null;
onAuthStateChanged(auth, user => currentUser = user);

// Form submission
form.addEventListener('submit', async function(e){
  e.preventDefault();
  if(!form.checkValidity()) return alert('Please fill all required fields correctly.');

  submitPopup.style.display = 'flex';

  // Collect form data
  const formData = {};
  Array.from(form.elements).forEach(el => { if(el.name) formData[el.name] = el.value || null; });

  // Add user info and amount
  formData.userId = currentUser ? currentUser.uid : "guest_" + Date.now();
  formData.createdAt = new Date().toISOString();
  formData.status = "pending";
  formData.plan = "Ultimate Personal Coaching";
  formData.amount = 4999; // Fixed plan amount in INR

  const docRef = doc(db, "ultimate_personal_coaching", formData.userId + "_" + Date.now());

  try {
    await setDoc(docRef, formData); // Save initial pending record
  } catch(err){
    console.error(err);
    submitPopup.style.display = 'none';
    return alert("❌ Error saving form. Try again.");
  }

  try {
    // 1️⃣ Fetch live Razorpay key from Netlify function
    const keyResponse = await fetch("/.netlify/functions/razorpay-key");
    const { key } = await keyResponse.json();

    // 2️⃣ Create order from backend
    const orderResponse = await fetch("/.netlify/functions/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: formData.amount * 100, currency: "INR" })
    });
    const orderData = await orderResponse.json();

    if(!orderData.id) throw new Error("Failed to create Razorpay order");

    // 3️⃣ Razorpay Checkout
    const options = {
      key: key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "IronnRoot Fitness",
      order_id: orderData.id, // Required for live payments
      description: "Ultimate Personal Coaching Payment",
      prefill: {
        name: formData.firstName + " " + formData.lastName,
        email: formData.email || "",
        contact: formData.phone || ""
      },
      notes: { userId: formData.userId },
      theme: { color: "#ff4d4d" },
      handler: async function(response){
        try {
          await setDoc(docRef, {
            ...formData,
            status: "success",
            paymentId: response.razorpay_payment_id,
            amount: formData.amount
          });
          submitPopup.style.display = 'none';
          alert("✅ Your form is submitted. We will contact you within 24 hours.");
          form.reset();
        } catch(err){
          console.error(err);
          submitPopup.style.display = 'none';
          alert("❌ Payment succeeded but saving form failed!");
        }
      },
      modal: {
        ondismiss: async function(){
          try {
            await setDoc(docRef, { ...formData, status: "failed", amount: formData.amount });
          } catch(err){ console.error(err); }
          submitPopup.style.display = 'none';
          alert("❌ Payment was cancelled.");
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();

  } catch(err){
    console.error(err);
    submitPopup.style.display = 'none';
    alert("❌ Payment initialization failed. Try again.");
  }
});
