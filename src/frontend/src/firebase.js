import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Cấu hình Firebase cho dự án EduSubmit
const firebaseConfig = {
    apiKey: "AIzaSyBWzMNuI-yWiwzKEX4NHj4DB2JDp3mVzrk", // Hãy đảm bảo đây là API Key chính xác nhất của bro
    authDomain: "edusubmit-df9a8.firebaseapp.com",
    projectId: "edusubmit-df9a8",
    storageBucket: "edusubmit-df9a8.firebasestorage.app",
    messagingSenderId: "47069143596",
    appId: "1:47069143596:web:4fd1b4c4e0a8d284cfa789",
    measurementId: "G-SYMY2XMSR1"
};

// Khởi tạo Firebase (Chỉ 1 lần duy nhất)
const app = initializeApp(firebaseConfig);

// Xuất công cụ Auth và GoogleProvider ra để xài cho trang Register (Chỉ 1 lần duy nhất)
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);