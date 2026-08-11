import { createContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
// 👇 Import db and Firestore functions
import { app, db } from "../utils/firebase.config"; 
import { doc, getDoc, setDoc } from "firebase/firestore";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Google Login (UPDATED WITH FIRESTORE CHECK)
  const googleLogin = async () => {
    try {
      // Trigger the Google popup
      const result = await signInWithPopup(auth, googleProvider);
      const loggedInUser = result.user;

      // Check if this user already exists in your Firestore "users" collection
      const userRef = doc(db, "users", loggedInUser.uid);
      const userSnap = await getDoc(userRef);

      // If they DO NOT exist, create a new profile for them
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: loggedInUser.displayName || "Google User",
          email: loggedInUser.email,
          createdAt: new Date(),
          role: "customer"
        });
      }

      return result;
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      throw error;
    }
  };

  // 2. Email/Password Login
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // 3. Email/Password Sign Up
  const signUp = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // 4. Log Out
  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unSubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => {
      unSubscribe();
    };
  }, [auth]);

  const userInfo = {
    user,
    isLoading,
    login,
    signUp,
    logout,
    googleLogin,
  };

  return (
    <AuthContext.Provider value={userInfo}>
      {children}
    </AuthContext.Provider>
  );
};