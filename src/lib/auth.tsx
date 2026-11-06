import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
export { auth, db } from './firebase';

export type UserRole = 'volunteer' | 'organizer' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone: string;
  bloodType: string;
  role: UserRole;
  avatarUrl?: string;
  city?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface SignupParams {
  email: string;
  password: string;
  displayName: string;
  phone?: string;
  bloodType?: string;
  role?: UserRole;
  avatarUrl?: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  signup: (params: SignupParams) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  refreshProfile: () => Promise<UserProfile | null>;
  isAdmin: boolean;
  isOrganizer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin emails to automatically elevate
const ADMIN_EMAILS = ['emmanuelalvarico4@gmail.com', 'admin@sandigan.ph'];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync user profile document from Firestore in real-time
  useEffect(() => {
    let unsubscribeDoc: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (!fbUser) {
        setUser(null);
        setLoading(false);
        if (unsubscribeDoc) unsubscribeDoc();
        return;
      }

      const userDocRef = doc(db, 'users', fbUser.uid);

      // Set up real-time listener for the user profile document
      unsubscribeDoc = onSnapshot(
        userDocRef,
        async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            const isDefaultAdmin = ADMIN_EMAILS.includes(fbUser.email?.toLowerCase() || '');
            const finalRole: UserRole = isDefaultAdmin ? 'admin' : (data.role || 'volunteer');
            
            setUser({
              ...data,
              uid: fbUser.uid,
              email: fbUser.email || data.email,
              displayName: data.displayName || fbUser.displayName || 'Volunteer Member',
              avatarUrl: data.avatarUrl || fbUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${fbUser.email}`,
              role: finalRole,
            });
          } else {
            // Document doesn't exist yet: initialize new user in Firestore
            const isDefaultAdmin = ADMIN_EMAILS.includes(fbUser.email?.toLowerCase() || '');
            const initialRole: UserRole = isDefaultAdmin ? 'admin' : 'volunteer';

            const newProfile: UserProfile = {
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Volunteer',
              phone: fbUser.phoneNumber || '0917-000-0000',
              bloodType: 'O+',
              role: initialRole,
              avatarUrl: fbUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fbUser.displayName || fbUser.email || 'user')}`,
              city: 'Cagayan de Oro',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };

            try {
              await setDoc(userDocRef, newProfile);
              setUser(newProfile);
            } catch (err) {
              console.error('Failed to create initial user profile doc:', err);
              setUser(newProfile);
            }
          }
          setLoading(false);
        },
        (error) => {
          console.warn('User profile onSnapshot warning:', error);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  // Standard Email/Password Sign-In
  const login = async (email: string, password: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const fbUser = userCredential.user;

      const userDocRef = doc(db, 'users', fbUser.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const profile = docSnap.data() as UserProfile;
        setUser(profile);
        return profile;
      }

      const isDefaultAdmin = ADMIN_EMAILS.includes(fbUser.email?.toLowerCase() || '');
      const initialProfile: UserProfile = {
        uid: fbUser.uid,
        email: fbUser.email || email,
        displayName: fbUser.displayName || email.split('@')[0],
        phone: '0917-000-0000',
        bloodType: 'O+',
        role: isDefaultAdmin ? 'admin' : 'volunteer',
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
        city: 'Cagayan de Oro',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(userDocRef, initialProfile);
      setUser(initialProfile);
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed' || err?.message?.includes('operation-not-allowed')) {
        throw new Error('Email/Password provider is not yet enabled in your Firebase Console. Please use "Continue with Google" or enable Email/Password under Firebase Authentication > Sign-in method.');
      }
      handleFirestoreError(err, OperationType.GET, 'users');
    } finally {
      setLoading(false);
    }
  };

  // Standard Email/Password Sign-Up
  const signup = async (params: SignupParams): Promise<UserProfile> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        params.email.trim(),
        params.password
      );
      const fbUser = userCredential.user;

      if (params.displayName) {
        await updateFirebaseProfile(fbUser, { displayName: params.displayName });
      }

      const isDefaultAdmin = ADMIN_EMAILS.includes(params.email.trim().toLowerCase());
      const role: UserRole = isDefaultAdmin ? 'admin' : (params.role || 'volunteer');

      const newProfile: UserProfile = {
        uid: fbUser.uid,
        email: params.email.trim().toLowerCase(),
        displayName: params.displayName.trim() || 'Volunteer Member',
        phone: params.phone?.trim() || '0917-000-0000',
        bloodType: params.bloodType || 'O+',
        role,
        avatarUrl:
          params.avatarUrl ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(params.displayName || params.email)}`,
        city: 'Cagayan de Oro',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', fbUser.uid), newProfile);
      setUser(newProfile);
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed' || err?.message?.includes('operation-not-allowed')) {
        throw new Error('Email/Password provider is not yet enabled in your Firebase Console. Please use "Continue with Google" or enable Email/Password under Firebase Authentication > Sign-in method.');
      }
      handleFirestoreError(err, OperationType.CREATE, 'users');
    } finally {
      setLoading(false);
    }
  };

  // Google 1-Click Sign-In
  const loginWithGoogle = async (): Promise<UserProfile> => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      const userDocRef = doc(db, 'users', fbUser.uid);
      const docSnap = await getDoc(userDocRef);

      const isDefaultAdmin = ADMIN_EMAILS.includes(fbUser.email?.toLowerCase() || '');
      const role: UserRole = isDefaultAdmin ? 'admin' : 'volunteer';

      if (docSnap.exists()) {
        const existing = docSnap.data() as UserProfile;
        const updated = {
          ...existing,
          role: isDefaultAdmin ? 'admin' : existing.role,
        };
        setUser(updated);
        return updated;
      }

      const newProfile: UserProfile = {
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || 'Emmanuel Alvarico',
        phone: fbUser.phoneNumber || '0917-882-9012',
        bloodType: 'O+',
        role,
        avatarUrl: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        city: 'Cagayan de Oro',
        emergencyContactName: 'Maria Alvarico',
        emergencyContactPhone: '0917-555-1234',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(userDocRef, newProfile);
      setUser(newProfile);
      return newProfile;
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'users');
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  // Update profile directly in Firestore users/{uid}
  const updateProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    if (!firebaseUser || !user) throw new Error('No authenticated user session');

    const cleanUpdates = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    await updateDoc(userDocRef, cleanUpdates);

    const merged = { ...user, ...updates };
    setUser(merged);
    return merged;
  };

  const refreshProfile = async (): Promise<UserProfile | null> => {
    if (!firebaseUser) return null;
    const docSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (docSnap.exists()) {
      const p = docSnap.data() as UserProfile;
      setUser(p);
      return p;
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateProfile,
        refreshProfile,
        isAdmin: user?.role === 'admin',
        isOrganizer: user?.role === 'organizer' || user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
