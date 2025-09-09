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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Elements
const form = document.getElementById('trainingForm');
const submitPopup = document.getElementById('submitPopup');

// Track current user
let currentUser = null;
onAuthStateChanged(auth, user => currentUser = user);

// Form submission
form.addEventListener('submit', async function(e) {
  e.preventDefault();

  if (!form.checkValidity()) {
    alert('Please fill all required fields correctly.');
    return;
  }

  // Show submit popup
  submitPopup.style.display = 'flex';

  // Collect form data
  const formData = {};
  Array.from(form.elements).forEach(el => {
    if(el.name) formData[el.name] = el.value || null;
  });

  formData.userId = currentUser ? currentUser.uid : "guest_" + Date.now();
  formData.createdAt = new Date().toISOString();
  formData.amount = 2499; // Example price in INR
  formData.status = "pending";

  // Firestore doc reference
  const docRef = doc(db, "personal_workout_plan", formData.userId + "_" + Date.now());

  // Razorpay options
  const options = {
    key: key, // Replace with your Razorpay test/live key
    amount: formData.amount * 100, // Amount in paise
    currency: "INR",
    name: "Ironnroot Fitness",
    description: "Personal Workout Plan Payment",
    prefill: {
      name: formData.firstName + " " + formData.lastName,
      email: formData.email,
      contact: formData.phone
    },
    theme: { color: "#ff4d4d" },
    handler: async function(response){
      // Payment success
      try {
        await setDoc(docRef, {...formData, status: "success", paymentId: response.razorpay_payment_id});
        submitPopup.style.display = 'none';
        alert("✅ Your workout plan request has been submitted successfully. We will contact you within 24 hours !");
        form.reset();
      } catch(err) {
        console.error(err);
        submitPopup.style.display = 'none';
        alert("❌ Payment succeeded but saving form failed!");
      }
    },
    modal: {
      ondismiss: async function(){
        // Payment cancelled
        try { await setDoc(docRef, {...formData, status: "failed"}); } 
        catch(err){ console.error(err); }
        submitPopup.style.display = 'none';
        alert("❌ Payment was cancelled.");
      }
    }
  };

  // Open Razorpay payment popup
  const rzp = new Razorpay(options);
  rzp.open();
});