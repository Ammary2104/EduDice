// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAV_WwsYj0TVlcpBsdvnCiTiYsyxdfEAiI",
  authDomain: "edudice-a4950.firebaseapp.com",
  projectId: "edudice-a4950",
  storageBucket: "edudice-a4950.firebasestorage.app",
  messagingSenderId: "235692483223",
  appId: "1:235692483223:web:f692792c6b34ee769ebfd2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Helper function to convert username to email format
const usernameToEmail = (username) => {
  return `${username.toLowerCase().replace(/\s+/g, '')}@edudice.app`;
};

// Sign up function
export const signUp = async (username, password) => {
  try {
    const email = usernameToEmail(username);
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    await updateProfile(userCredential.user, {
      displayName: username
    });
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    let errorMessage = error.message;
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Username already exists. Please choose a different username.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters.';
    } else {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
};

// Login function with improved error handling
export const login = async (username, password) => {
  try {
    const email = usernameToEmail(username);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    // Return user-friendly error messages
    if (error.code === 'auth/invalid-credential') {
      return { success: false, error: 'wrong-password' };
    } else if (error.code === 'auth/user-not-found') {
      return { success: false, error: 'user-not-found' };
    } else if (error.code === 'auth/wrong-password') {
      return { success: false, error: 'wrong-password' };
    } else if (error.code === 'auth/invalid-email') {
      return { success: false, error: 'invalid-email' };
    } else {
      return { success: false, error: error.message };
    }
  }
};

// Logout function
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export { auth, db };