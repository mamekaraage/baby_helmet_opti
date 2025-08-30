import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebaseの設定
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIRESTORE_APIKEY,
    // apiKey: "AIzaSyACKDt7_XtJPUtYdNposwPmh9y1bG4Xnho",
    authDomain: process.env.NEXT_PUBLIC_FIRESTORE_AUTHDOMAIN,
    // authDomain: "baby-helmet-opti-dev.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIRESTORE_PROJECTID,
    // projectId: "baby-helmet-opti-dev",
    storageBucket: process.env.NEXT_PUBLIC_FIRESTORE_STORAGEBUCKET,
    // storageBucket: "baby-helmet-opti-dev.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIRESTORE_MESSAGING,
    // messagingSenderId: "181216454863",
    appId: process.env.NEXT_PUBLIC_FIRESTORE_APPID,
    // appId: "1:181216454863:web:c7e7f180750126cd652fba"
  };

// Firebaseの初期化
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 
export default app;