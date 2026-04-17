import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCHhdLYSVMNzqJZgvXiZaLce2GBkoZJsn0",
  authDomain: "fbm-pc.firebaseapp.com",
  projectId: "fbm-pc",
  storageBucket: "fbm-pc.firebasestorage.app",
  messagingSenderId: "695597832220",
  appId: "1:695597832220:web:f6c887fcfc9f5bdbb1a7d9",
  measurementId: "G-65STDYST4Y"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
