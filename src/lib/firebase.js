import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCLVrQohFR2iRuMYMDB2chrftzNmvvfYiI",
  authDomain: "reactchat123.firebaseapp.com",
  projectId: "reactchat123",
  storageBucket: "reactchat123.appspot.com",
  messagingSenderId: "121164806353",
  appId: "1:121164806353:web:4347a890be4c3ee7e9adf0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();
