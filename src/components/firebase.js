import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA2CrZHaTPO0-wYTesqVNE1G9bQMMs3Iqc",
  authDomain: "basic2fasystem.firebaseapp.com",
  projectId: "basic2fasystem",
  storageBucket: "basic2fasystem.firebasestorage.app",
  messagingSenderId: "866715344220",
  appId: "1:866715344220:web:ae3df5289309383d60f599",
  measurementId: "G-WRHJE4WJ5Q"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
