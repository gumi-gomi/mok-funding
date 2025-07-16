// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCAQOEIY72UMB5iSkxed6it8MfE-Li2CVk",
  authDomain: "mock-funding.firebaseapp.com",
  projectId: "mock-funding",
  storageBucket: "mock-funding.firebasestorage.app",
  messagingSenderId: "995886488798",
  appId: "1:995886488798:web:381863234be48a1cee764f"
};
// Firebase 초기화
const app = initializeApp(firebaseConfig);

// 인증과 Firestore 인스턴스 export
export const auth = getAuth(app);
export const db = getFirestore(app);
