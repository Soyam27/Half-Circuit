import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth } from '../firebase/config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect
} from 'firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const mapAuthError = (error) => {
    const errorMessages = {
      'auth/email-already-in-use': 'Email is already registered',
      'auth/invalid-email': 'Invalid email address',
      'auth/weak-password': 'Password should be at least 6 characters',
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later',
      'auth/popup-closed-by-user': 'Sign-in popup was closed',
      'auth/popup-blocked': 'Popup blocked by browser'
    };
    return errorMessages[error.code] || error.message;
  };

  const signUp = useCallback(async (email, password, displayName) => {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        try { await updateProfile(cred.user, { displayName }); } catch (e) { console.warn('Display name update failed', e); }
      }
      return cred.user;
    } catch (error) {
      const friendlyError = mapAuthError(error);
      setAuthError(friendlyError);
      throw new Error(friendlyError);
    }
  }, []);

  const signIn = useCallback(async (email, password) => {
    setAuthError(null);
    try {
      return (await signInWithEmailAndPassword(auth, email, password)).user;
    } catch (error) {
      const friendlyError = mapAuthError(error);
      setAuthError(friendlyError);
      throw new Error(friendlyError);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      if (error.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectError) {
          const friendlyError = mapAuthError(redirectError);
          setAuthError(friendlyError);
          throw new Error(friendlyError);
        }
      }
      const friendlyError = mapAuthError(error);
      setAuthError(friendlyError);
      throw new Error(friendlyError);
    }
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    try { localStorage.removeItem('hc_last_search'); } catch (_) {}
  }, []);

  const resetPassword = useCallback(async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      const friendlyError = mapAuthError(error);
      setAuthError(friendlyError);
      throw new Error(friendlyError);
    }
  }, []);

  const value = {
    user,
    loading,
    authError,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
