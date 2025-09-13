import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

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

let currentUser = null;
onAuthStateChanged(auth, user => currentUser = user);

form.addEventListener('submit', async function(e) {
  e.preventDefault();
  if (!form.checkValidity()) {
    alert('⚠️ Please fill all required fields correctly.');
    return;
  }

  submitPopup.style.display = 'flex';

  try {
    // 1️⃣ Collect form data
    const formData = {};
    Array.from(form.elements).forEach(el => { if(el.name) formData[el.name] = el.value || null; });

    // safer guest ID
    formData.userId = currentUser ? currentUser.uid : "guest_" + crypto.randomUUID();
    formData.createdAt = new Date().toISOString();
    formData.plan = "Personal Workout Plan";

    const docRef = doc(db, "personal_workout_plan", formData.userId + "_" + Date.now());

    // 2️⃣ Save initial record with "created"
    await setDoc(docRef, { ...formData, status: "created" });

    // 3️⃣ Fetch plan amount
    const planRef = doc(db, "plans", "personal_workout_plan");
    const planSnap = await getDoc(planRef);
    if (!planSnap.exists()) throw new Error("Plan not found in Firestore");
    const planData = planSnap.data();
    const amount = planData.amount;

    // 4️⃣ Get Razorpay key
    const keyResponse = await fetch("/.netlify/functions/razorpay-key");
    const { key } = await keyResponse.json();

    // 5️⃣ Create Razorpay order
    const orderResponse = await fetch("/.netlify/functions/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amount * 100, currency: "INR" })
    });
    const orderData = await orderResponse.json();
    if (!orderData.id) throw new Error("Failed to create Razorpay order");

    // 6️⃣ Mark as "pending"
    await setDoc(docRef, { status: "pending", orderId: orderData.id }, { merge: true });

    // 7️⃣ Razorpay Checkout
    const options = {
      key: key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "IronnRoot Fitness",
      order_id: orderData.id,
      description: "Personal Workout Plan Payment",
      prefill: {
        name: formData.firstName + " " + formData.lastName,
        email: formData.email || "",
        contact: formData.phone || ""
      },
      notes: { userId: formData.userId },
      theme: { color: "#ff4d4d" },
      handler: async function(response) {
        try {
          // 8️⃣ Verify payment
          const verifyRes = await fetch("/.netlify/functions/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });
          const verifyData = await verifyRes.json();
          if (!verifyData.verified) throw new Error("Payment verification failed");

          // 9️⃣ Update success
          await setDoc(docRef, {
            status: "success",
            paymentId: response.razorpay_payment_id,
            amount: amount,
            successAt: new Date().toISOString()
          }, { merge: true });

          submitPopup.style.display = 'none';
          alert('✅ Your workout plan request has been submitted successfully. We will contact you within 24 hours.');
          form.reset();

        } catch(err) {
          console.error(err);
          await setDoc(docRef, {
            status: "failed",
            error: err.message,
            failedAt: new Date().toISOString()
          }, { merge: true });

          submitPopup.style.display = 'none';
          alert("❌ Payment verification failed. Please contact support.");
        }
      },
      modal: {
        ondismiss: async function() {
          try {
            await setDoc(docRef, {
              status: "failed",
              error: "User dismissed checkout",
              failedAt: new Date().toISOString()
            }, { merge: true });
          } catch(err) { console.error(err); }
          submitPopup.style.display = 'none';
          alert("❌ Payment was cancelled.");
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();

  } catch(err) {
    console.error(err);
    await setDoc(doc(db, "errors", "workout_" + Date.now()), {
      error: err.message,
      at: new Date().toISOString()
    });

    submitPopup.style.display = 'none';
    alert("❌ Payment initialization failed: " + err.message);
  }
});

