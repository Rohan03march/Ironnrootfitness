// ================= FIREBASE IMPORTS =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyC1705Xy74qwXt8aOgvZGBIYs8uMU6u3js",
  authDomain: "ironnrootfitness-5156e.firebaseapp.com",
  projectId: "ironnrootfitness-5156e",
  storageBucket: "ironnrootfitness-5156e.firebasestorage.app",
  messagingSenderId: "508351386284",
  appId: "1:508351386284:web:289185a2ff7a08b8ef0509",
  measurementId: "G-S6235MZEPC",
};

// ================= INIT =================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ================= ELEMENTS =================
const signUpForm = document.getElementById("signupForm");
const signInForm = document.getElementById("signinForm");
const forgotPassword = document.getElementById("forgotPassword");
const popup = document.getElementById("popup");

// ================= HELPERS =================
function showPopup(message) {
  popup.textContent = message;
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 2500);
}

function redirectAfterAuth() {
  const selectedPlan = sessionStorage.getItem("selectedPlan");

  if (selectedPlan) {
    sessionStorage.removeItem("selectedPlan");

    if (selectedPlan === "personal_nutrition_plan")
      window.location.href = "personal-nutrition-plan.html";
    else if (selectedPlan === "personal_workout_plan")
      window.location.href = "personal-workout-plan.html";
    else if (selectedPlan === "ultimate_personal_coaching")
      window.location.href = "ultimate-personal-coaching.html";
    else window.location.href = "index.html";
  } else {
    window.location.href = "index.html";
  }
}

// ================= SIGN UP =================
signUpForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const phone = document.getElementById("signupPhone").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirm = document.getElementById("signupConfirm").value;

  // 🔒 VALIDATIONS
  if (!fullName) {
    showPopup("Enter your full name");
    return;
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    showPopup("Enter a valid email address");
    return;
  }

  if (!/^\+?\d{10,15}$/.test(phone)) {
    showPopup("Enter a valid phone number");
    return;
  }

  if (password.length < 6) {
    showPopup("Password must be at least 6 characters");
    return;
  }

  if (password !== confirm) {
    showPopup("Passwords do not match");
    return;
  }

  try {
    // 🔐 CREATE AUTH USER
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    const selectedPlan = sessionStorage.getItem("selectedPlan");

    // 🧾 SAVE USER IN FIRESTORE
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      fullName,
      email,
      phone,
      allowUser: true,
      createdAt: new Date().toISOString(),

      // 🎁 OFFER LOGIC
      signupSource: selectedPlan ? "plan" : "home",
      offerEligible: !!selectedPlan,
      offerPlan: selectedPlan || null,
      offerUsed: false,
    });

    showPopup("Account created successfully 🎉");
    signUpForm.reset();

    setTimeout(() => {
      redirectAfterAuth();
    }, 2600);

  } catch (error) {
    showPopup(error.message);
  }
});

// ================= SIGN IN =================
signInForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("signinEmail").value.trim();
  const password = document.getElementById("signinPassword").value;

  if (!email || !password) {
    showPopup("Enter email and password");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // 🔍 CHECK ACCESS
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) throw new Error("User record not found");

    if (!userDoc.data().allowUser)
      throw new Error("Your account is blocked");

    showPopup("Signed in successfully ✅");
    signInForm.reset();

    setTimeout(() => {
      redirectAfterAuth();
    }, 2600);

  } catch (error) {
    showPopup(error.message);
  }
});

// ================= FORGOT PASSWORD =================
forgotPassword.addEventListener("click", async () => {
  const email = document.getElementById("signinEmail").value.trim();

  if (!email) {
    showPopup("Enter your email first");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    showPopup("Password reset email sent 📧");
  } catch (error) {
    showPopup(error.message);
  }
});

// ================= AUTH STATE LOG =================
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Logged in:", user.uid);
  } else {
    console.log("No user logged in");
  }
});
