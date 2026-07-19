import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDO19W6RAoUpcty7t0RxFtc38Dv-msEfig",
  authDomain: "carrental-2897c.firebaseapp.com",
  projectId: "carrental-2897c",
  storageBucket: "carrental-2897c.firebasestorage.app",
  messagingSenderId: "757085254256",
  appId: "1:757085254256:web:e007a5349d67bdebd3bab5",
  measurementId: "G-DLC7KFCZXD"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export default app;