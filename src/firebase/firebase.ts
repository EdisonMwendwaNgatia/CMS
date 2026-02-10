import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";  

const firebaseConfig = {
  apiKey: "AIzaSyCfCDCVJBLXd9DOPsBVFyFfOIXKZUAG2wI",
  authDomain: "student-innovation-hub.firebaseapp.com",
  databaseURL: "https://student-innovation-hub-default-rtdb.firebaseio.com",
  projectId: "student-innovation-hub",
  storageBucket: "student-innovation-hub.firebasestorage.app",
  messagingSenderId: "68503838806",
  appId: "1:68503838806:web:ba42223d1eb6c3951b5bf7",
  measurementId: "G-SP5LHXMX0Y"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
