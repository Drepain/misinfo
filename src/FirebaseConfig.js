import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {

  apiKey: "AIzaSyAmPt3uhhmdCintKM2YWDYqNcxUMhlzLKs",

  authDomain: "misinfo-f8c9b.firebaseapp.com",

  projectId: "misinfo-f8c9b",

  storageBucket: "misinfo-f8c9b.firebasestorage.app",

  messagingSenderId: "919864716359",

  appId: "1:919864716359:web:b3f69e65efcd953932d562"

};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };