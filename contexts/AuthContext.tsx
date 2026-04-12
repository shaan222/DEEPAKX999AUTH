'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  onIdTokenChanged,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { initializeUserSubscription } from '@/lib/subscription-limits';
import { generatePermanentUsername } from '@/lib/utils';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, inviteCode?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const tokenRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleGoogleSignInSuccess = useCallback(async (user: User) => {
    // Check if user document exists, if not create it
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      // Generate permanent username
      const username = generatePermanentUsername();
      // Create user document for new Google sign-in
      await setDoc(userDocRef, {
        email: user.email,
        username, // Permanent, non-changeable username
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: 'user',
        createdAt: new Date().toISOString(),
        subscription: initializeUserSubscription(),
        provider: 'google',
        clientRank: 'bronze', // Default rank
        rankSubTier: 'client', // Default sub-tier
      });
    }
  }, []);

  // Setup token refresh to prevent automatic logout
  useEffect(() => {
    let currentUserRef: User | null = null;

    const setupTokenRefresh = (currentUser: User) => {
      // Clear any existing interval
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
      }

      // Refresh token every 50 minutes (tokens expire after 1 hour)
      // This ensures the token is refreshed before it expires
      tokenRefreshIntervalRef.current = setInterval(async () => {
        try {
          // Force token refresh
          const token = await currentUser.getIdToken(true);
          console.log('Token refreshed successfully');
        } catch (error) {
          console.error('Error refreshing token:', error);
          // If token refresh fails, user might need to re-authenticate
          // But don't log them out immediately - let Firebase handle it
        }
      }, 50 * 60 * 1000); // 50 minutes
    };

    // Refresh token when user becomes visible (returns to tab)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && currentUserRef) {
        try {
          // Refresh token when user returns to the tab
          await currentUserRef.getIdToken(true);
          console.log('Token refreshed on visibility change');
        } catch (error) {
          console.error('Error refreshing token on visibility change:', error);
        }
      }
    };

    // Refresh token when page becomes visible
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    // Listen for auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      setLoading(false);
      currentUserRef = authUser;
      
      if (authUser) {
        // Setup token refresh when user is logged in
        setupTokenRefresh(authUser);
        
        // Also refresh token immediately to ensure it's valid
        try {
          await authUser.getIdToken(true);
        } catch (error) {
          console.error('Error getting initial token:', error);
        }
      } else {
        currentUserRef = null;
        // Clear interval when user logs out
        if (tokenRefreshIntervalRef.current) {
          clearInterval(tokenRefreshIntervalRef.current);
          tokenRefreshIntervalRef.current = null;
        }
      }
    });

    // Also listen for token changes to handle refresh automatically
    const unsubscribeToken = onIdTokenChanged(auth, async (authUser) => {
      if (authUser) {
        currentUserRef = authUser;
        // Token was refreshed, update user state if needed
        setUser(authUser);
      } else {
        currentUserRef = null;
      }
    });

    // Check for redirect result (Google Sign-In)
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          // Handle successful redirect sign-in
          handleGoogleSignInSuccess(result.user).then(() => {
            // After redirect sign-in, navigate to dashboard
            if (typeof window !== 'undefined' && window.location.pathname.includes('/login')) {
              window.location.href = '/dashboard';
            }
          });
        }
      })
      .catch((error) => {
        console.error('Error getting redirect result:', error);
      });

    return () => {
      unsubscribeAuth();
      unsubscribeToken();
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
      }
      if (typeof window !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [handleGoogleSignInSuccess]);

  const register = async (email: string, password: string, inviteCode?: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Generate permanent username
    const username = generatePermanentUsername();
    
    // Create user document in Firestore with free trial subscription
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: userCredential.user.email,
      username, // Permanent, non-changeable username
      role: 'user',
      createdAt: new Date().toISOString(),
      subscription: initializeUserSubscription(),
      inviteCode: inviteCode || null,
      invitedBy: null, // Will be filled by backend when processing invite code
      clientRank: 'bronze', // Default rank
      rankSubTier: 'client', // Default sub-tier
    });

    // Mark invite code as used
    if (inviteCode) {
      try {
        await fetch('/api/invite-code/use', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            code: inviteCode,
            userId: userCredential.user.uid,
            userEmail: userCredential.user.email
          }),
        });
      } catch (error) {
        console.error('Error marking invite code as used:', error);
      }
    }
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    try {
      // Try popup first (works in most cases)
      const result = await signInWithPopup(auth, provider);
      await handleGoogleSignInSuccess(result.user);
    } catch (error: any) {
      // If popup fails (blocked or COOP issue), fall back to redirect
      if (error.code === 'auth/popup-blocked' || 
          error.code === 'auth/popup-closed-by-user' ||
          error.message?.includes('Cross-Origin-Opener-Policy')) {
        // Use redirect as fallback
        await signInWithRedirect(auth, provider);
        // The redirect will be handled by getRedirectResult in useEffect
        // This function will return, and the redirect will happen
        return;
      }
      // Re-throw other errors
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
