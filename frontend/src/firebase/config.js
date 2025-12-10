// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDtJRj6kxQldbKQqP9A1abtP3SNhwVvNTM",
  authDomain: "right-to-compare.firebaseapp.com",
  projectId: "right-to-compare",
  storageBucket: "right-to-compare.firebasestorage.app",
  messagingSenderId: "648003451856",
  appId: "1:648003451856:web:3bd45e4f5ec265e11397d5",
  measurementId: "G-RQGYFY5DPX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);