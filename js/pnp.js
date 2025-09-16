// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
// import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
// import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// // Firebase config
// const firebaseConfig = {
//   apiKey: "AIzaSyC1705Xy74qwXt8aOgvZGBIYs8uMU6u3js",
//   authDomain: "ironnrootfitness-5156e.firebaseapp.com",
//   projectId: "ironnrootfitness-5156e",
//   storageBucket: "ironnrootfitness-5156e.firebasestorage.app",
//   messagingSenderId: "508351386284",
//   appId: "1:508351386284:web:289185a2ff7a08b8ef0509",
//   measurementId: "G-S6235MZEPC"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);

// // Elements
// const form = document.getElementById('clientForm');
// const submitPopup = document.getElementById('submitPopup');

// let currentUser = null;

// // Track logged-in user
// onAuthStateChanged(auth, user => currentUser = user);

// // ❌ Redirect guests immediately (optional for extra security)
// // if (!currentUser) {
// //   alert("Please login to access this page.");
// //   window.location.href = "login.html";
// // }

// form.addEventListener('submit', async function(e) {
//   e.preventDefault();

//   // ❌ Block guests
//   if (!currentUser) {
//     const proceed = confirm("Please login before making a payment. Click OK to login.");
//     if (proceed) {
//       window.location.href = "login.html";
//     }
//     return; // stop execution
//   }

//   if (!form.checkValidity()) {
//     return alert('Please fill all required fields correctly.');
//   }

//   submitPopup.style.display = 'flex';

//   try {
//     // 1️⃣ Collect form data
//     const formData = {};
//     Array.from(form.elements).forEach(el => {
//       if (el.name) formData[el.name] = el.value || null;
//     });
//     formData.userId = currentUser.uid; // only logged-in users
//     formData.createdAt = new Date().toISOString();
//     formData.plan = "Personal Nutrition Plan";

//     const docRef = doc(db, "personal_nutrition_plan", formData.userId + "_" + Date.now());

//     // 2️⃣ Save initial record as "created"
//     await setDoc(docRef, { ...formData, status: "created" });

//     // 3️⃣ Fetch plan amount from Firestore
//     const planRef = doc(db, "plans", "personal_nutrition_plan");
//     const planSnap = await getDoc(planRef);
//     if (!planSnap.exists()) throw new Error("Plan not found");
//     const planData = planSnap.data();
//     const amount = planData.amount; // Amount in INR

//     // 4️⃣ Fetch live Razorpay key
//     const keyResponse = await fetch("/.netlify/functions/razorpay-key");
//     const { key } = await keyResponse.json();

//     // 5️⃣ Create Razorpay order
//     const orderResponse = await fetch("/.netlify/functions/create-order", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ amount: amount * 100, currency: "INR" })
//     });
//     const orderData = await orderResponse.json();
//     if (!orderData.id) throw new Error("Failed to create Razorpay order");

//     // 6️⃣ Update status to "pending"
//     await setDoc(docRef, { ...formData, status: "pending", orderId: orderData.id });

//     // 7️⃣ Razorpay Checkout options
//     const options = {
//       key: key,
//       amount: orderData.amount,
//       currency: orderData.currency,
//       name: "IronnRoot Fitness",
//       order_id: orderData.id,
//       description: "Personal Nutrition Plan Payment",
//       prefill: {
//         name: formData.firstName + " " + formData.lastName,
//         email: formData.email || "",
//         contact: formData.phone || ""
//       },
//       notes: { userId: formData.userId },
//       theme: { color: "#ff4d4d" },
//       handler: async function(response) {
//         try {
//           // 8️⃣ Verify payment signature on server
//           const verifyRes = await fetch("/.netlify/functions/verify-payment", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               razorpay_order_id: response.razorpay_order_id,
//               razorpay_payment_id: response.razorpay_payment_id,
//               razorpay_signature: response.razorpay_signature
//             })
//           });
//           const verifyData = await verifyRes.json();
//           if (!verifyData.verified) throw new Error("Payment verification failed");

//           // 9️⃣ Update Firestore to "success"
//           await setDoc(docRef, {
//             ...formData,
//             status: "success",
//             paymentId: response.razorpay_payment_id,
//             amount: amount
//           });

//           submitPopup.style.display = 'none';
//           form.reset();
//           window.location.href = `/success.html?paymentId=${response.razorpay_payment_id}&plan=${formData.plan}`;

//         } catch (err) {
//           console.error(err);
//           submitPopup.style.display = 'none';
//           await setDoc(docRef, { ...formData, status: "failed", amount: amount });
//           window.location.href = "failure.html";
//         }
//       },
//       modal: {
//         ondismiss: async function() {
//           await setDoc(docRef, { ...formData, status: "failed", amount: amount });
//           submitPopup.style.display = 'none';
//           window.location.href = "failure.html";
//         }
//       }
//     };

//     const rzp = new Razorpay(options);
//     rzp.open();

//   } catch (err) {
//     console.error(err);
//     submitPopup.style.display = 'none';
//     alert("❌ Payment initialization failed: " + err.message);
//   }
// });



// Test mode ....

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

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const form = document.getElementById('clientForm');
let currentUser = null;
onAuthStateChanged(auth, user => currentUser = user);

form.addEventListener('submit', async function(e) {
  e.preventDefault();
  if (!form.checkValidity()) {
    return alert('Please fill all required fields correctly.');
  }

  // ✅ Require login before checkout
  if (!currentUser) {
    if (confirm("⚠️ You need to login before purchasing. Click OK to go to Login page.")) {
      window.location.href = "login.html"; // redirect to login
    }
    return; // stop further code if not logged in
  }

  try {
    // Collect form data
    const formData = {};
    Array.from(form.elements).forEach(el => {
      if (el.name) formData[el.name] = el.value || null;
    });
    formData.userId = currentUser.uid; // only logged-in users allowed
    formData.createdAt = new Date().toISOString();
    formData.plan = "Personal Nutrition Plan";

    // Save created status
    const docId = formData.userId + "_" + Date.now();
    const docRef = doc(db, "personal_nutrition_plan", docId);
    await setDoc(docRef, { ...formData, status: "created" });

    // Fetch plan price
    const planRef = doc(db, "plans", "personal_nutrition_plan");
    const planSnap = await getDoc(planRef);
    if (!planSnap.exists()) throw new Error("Plan not found");
    const planData = planSnap.data();
    const amount = planData.amount;

    // Razorpay Checkout
    const options = {
      key: "rzp_test_RFU2NSOugfWUne", // test key
      amount: amount * 100,
      currency: "INR",
      name: "IronnRoot Fitness",
      description: "Test Mode - Personal Nutrition Plan",
      offer_id: "offer_RIC0zk7e73bDns",
      handler: async function (response) {
        await setDoc(docRef, {
          ...formData,
          status: "success",
          paymentId: response.razorpay_payment_id || "test_" + Date.now(),
          amount: amount
        });
        window.location.href = `/success.html?paymentId=${response.razorpay_payment_id}&plan=${formData.plan}`;
      },
      modal: {
        ondismiss: async function () {
          await setDoc(docRef, { ...formData, status: "failed", amount: amount });
          window.location.href = `/failure.html?plan=${formData.plan}`;
        }
      },
      prefill: {
        name: formData.firstName + " " + formData.lastName,
        email: formData.email || "",
        contact: formData.phone || ""
      },
      theme: { color: "#ff4d4d" }
    };

    const rzp = new Razorpay(options);
    rzp.open();

  } catch (err) {
    console.error(err);
    alert("❌ Payment initialization failed: " + err.message);
  }
});



