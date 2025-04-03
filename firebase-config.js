// Firebase Configuration

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

  
  const firebaseConfig = {
    apiKey: "AIzaSyD_GbexAAo2WZ6MAqTScFw8UIHFSoTuoSA",
    authDomain: "medremainders.firebaseapp.com",
    projectId: "medremainders",
    storageBucket: "medremainders.firebasestorage.app",
    messagingSenderId: "204827224692",
    appId: "1:204827224692:web:3e1be5f8dccc2125ed3f21"
  };
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const database = getDatabase(app);
  
  export { auth, database };