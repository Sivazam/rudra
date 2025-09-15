import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
	apiKey: "AIzaSyADTcaTlnTWepqB6bFuJH6WkXSh3lUVxso",
	authDomain: "rudra-bb6b7.firebaseapp.com",
	projectId: "rudra-bb6b7",
	storageBucket: "rudra-bb6b7.firebasestorage.app",
	messagingSenderId: "889150603232",
	appId: "1:889150603232:web:372e2ae8734b6eeab6f585",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
