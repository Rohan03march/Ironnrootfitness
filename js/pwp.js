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
// const form = document.getElementById('trainingForm');
// const submitPopup = document.getElementById('submitPopup');

// let currentUser = null;
// onAuthStateChanged(auth, user => currentUser = user);

// form.addEventListener('submit', async function(e) {
//   e.preventDefault();

//   // ❌ Block guests
//   if (!currentUser) {
//     const proceed = confirm("Please login before making a payment. Click OK to login.");
//     if (proceed) {
//       window.location.href = "login.html";
//     }
//     return;
//   }

//   if (!form.checkValidity()) {
//     alert('⚠️ Please fill all required fields correctly.');
//     return;
//   }

//   submitPopup.style.display = 'flex';

//   try {
//     // 1️⃣ Collect form data
//     const formData = {};
//     Array.from(form.elements).forEach(el => {
//       if(el.name) formData[el.name] = el.value || null;
//     });

//     formData.userId = currentUser.uid; // logged-in user only
//     formData.createdAt = new Date().toISOString();
//     formData.plan = "Personal Workout Plan";

//     const docRef = doc(db, "personal_workout_plan", formData.userId + "_" + Date.now());

//     // 2️⃣ Save initial record as "created"
//     await setDoc(docRef, { ...formData, status: "created" });

//     // 3️⃣ Fetch plan amount
//     const planRef = doc(db, "plans", "personal_workout_plan");
//     const planSnap = await getDoc(planRef);
//     if (!planSnap.exists()) throw new Error("Plan not found in Firestore");
//     // const planData = planSnap.data();
//     // const amount = planData.amount;
//     const planData = planSnap.data();
// let amount = planData.amount;

// // 🔥 APPLY WELCOME OFFER (10% OFF)
// const userSnap = await getDoc(doc(db, "users", currentUser.uid));
// if (userSnap.exists()) {
//   const u = userSnap.data();

//   if (
//     u.offerEligible === true &&
//     u.offerUsed === false &&
//     u.offerPlan === "personal_workout_plan"
//   ) {
//     amount = Math.round(amount * 0.9); // 10% OFF
//   }
// }


//     // 4️⃣ Get Razorpay key
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

//     // 6️⃣ Mark as "pending"
//     await setDoc(docRef, { status: "pending", orderId: orderData.id }, { merge: true });

//     // 7️⃣ Razorpay Checkout
//     const options = {
//       key: key,
//       amount: orderData.amount,
//       currency: orderData.currency,
//       name: "IronnRoot Fitness",
//       order_id: orderData.id,
//       description: "Personal Workout Plan Payment",
//       prefill: {
//         name: formData.firstName + " " + formData.lastName,
//         email: formData.email || "",
//         contact: formData.phone || ""
//       },
//       notes: { userId: formData.userId },
//       theme: { color: "#ff4d4d" },
//       handler: async function(response) {
//         try {
//           // 8️⃣ Verify payment
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

//           // 9️⃣ Update success
//           // await setDoc(docRef, {
//           //   status: "success",
//           //   paymentId: response.razorpay_payment_id,
//           //   amount: amount,
//           //   successAt: new Date().toISOString()
//           // }, { merge: true });
//           await setDoc(docRef, {
//   status: "success",
//   paymentId: response.razorpay_payment_id,
//   amount: amount,
//   successAt: new Date().toISOString()
// }, { merge: true });

// // 🔒 MARK OFFER AS USED (ONE-TIME)
// const userRef = doc(db, "users", currentUser.uid);
// const userSnap = await getDoc(userRef);

// if (userSnap.exists()) {
//   const u = userSnap.data();

//   if (
//     u.offerEligible === true &&
//     u.offerUsed === false &&
//     u.offerPlan === "personal_workout_plan"
//   ) {
//     await setDoc(
//       userRef,
//       { offerUsed: true },
//       { merge: true }
//     );
//   }
// }


//           submitPopup.style.display = 'none';
//           window.location.href = `/success.html?paymentId=${response.razorpay_payment_id}&plan=${formData.plan}`;
//           form.reset();

//         } catch(err) {
//           console.error(err);
//           await setDoc(docRef, {
//             status: "failed",
//             error: err.message,
//             failedAt: new Date().toISOString()
//           }, { merge: true });

//           submitPopup.style.display = 'none';
//           window.location.href = "failure.html";
//         }
//       },
//       modal: {
//         ondismiss: async function() {
//           try {
//             await setDoc(docRef, {
//               status: "failed",
//               error: "User dismissed checkout",
//               failedAt: new Date().toISOString()
//             }, { merge: true });
//           } catch(err) { console.error(err); }
//           submitPopup.style.display = 'none';
//           window.location.href = "failure.html";
//         }
//       }
//     };

//     const rzp = new Razorpay(options);
//     rzp.open();

//   } catch(err) {
//     console.error(err);
//     await setDoc(doc(db, "errors", "workout_" + Date.now()), {
//       error: err.message,
//       at: new Date().toISOString()
//     });

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

const form = document.getElementById("trainingForm");
let currentUser = null;

onAuthStateChanged(auth, user => {
  currentUser = user;
});

// 🚫 HARD BLOCK if not logged in
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (!currentUser) {
    alert("Please sign up or login to continue.");
    sessionStorage.setItem("selectedPlan", "personal_workout_plan");
    window.location.href = "login.html";
    return;
  }

  if (!form.checkValidity()) {
    alert("Please fill all required fields correctly.");
    return;
  }

  try {
    // Collect form data
    const formData = {};
    // Array.from(form.elements).forEach(el => {
    //   if (el.name) formData[el.name] = el.value || null;
    // });

    formData.userId = currentUser.uid;
    formData.createdAt = new Date().toISOString();
    formData.plan = "Personal Workout Plan";

    // Create doc
    const docId = `${currentUser.uid}_${Date.now()}`;
    const docRef = doc(db, "personal_workout_plan", docId);
    await setDoc(docRef, { ...formData, status: "created" });

    // Fetch base price
    const planRef = doc(db, "plans", "personal_workout_plan");
    const planSnap = await getDoc(planRef);
    if (!planSnap.exists()) throw new Error("Plan not found");

    let amount = planSnap.data().amount;

    // 🔥 OFFER CHECK
    const userSnap = await getDoc(doc(db, "users", currentUser.uid));
    if (userSnap.exists()) {
      const u = userSnap.data();
      if (
        u.offerEligible &&
        !u.offerUsed &&
        u.offerPlan === "personal_workout_plan"
      ) {
        amount = Math.round(amount * 0.95); // 5% OFF
      }
    }

    // Razorpay
    const options = {
      key: "rzp_test_S1pV5yI8vZLNi9",
      amount: amount * 100,
      currency: "INR",
      name: "IronnRoot Fitness",
      description: "Personal Workout Plan",
      handler: async function (response) {
        // Save success
        await setDoc(docRef, {
          ...formData,
          status: "success",
          paymentId: response.razorpay_payment_id,
          amount: amount
        });

        // 🔒 MARK OFFER USED
        await setDoc(
          doc(db, "users", currentUser.uid),
          { offerUsed: true },
          { merge: true }
        );

        window.location.href =
          `/success.html?paymentId=${response.razorpay_payment_id}&plan=${formData.plan}`;
      },
      modal: {
        ondismiss: async function () {
          await setDoc(docRef, {
            ...formData,
            status: "failed",
            amount: amount
          });
          window.location.href = `/failure.html?plan=${formData.plan}`;
        }
      },
      prefill: {
        name: `${formData.firstName || ""} ${formData.lastName || ""}`,
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
