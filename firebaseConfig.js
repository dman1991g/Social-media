// Import Firebase Modular SDK modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';  // Import getStorage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNU5uJ9YkR3F3BtghpRwIJ3TR6FaUFxTM",
  authDomain: "real-time-chat-app-b5633.firebaseapp.com",
  databaseURL: "https://real-time-chat-app-b5633-default-rtdb.firebaseio.com",
  projectId: "real-time-chat-app-b5633",
  storageBucket: "real-time-chat-app-b5633.appspot.com",
  messagingSenderId: "598824406460",
  appId: "1:598824406460:web:69dd525b78ada125be2fb9",
  measurementId: "G-0RBBS9DMW7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);  // Initialize Firebase Storage
const messaging = getMessageing(app);
export { app, auth, database, storage, messaging };