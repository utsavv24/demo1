import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, COLLECTIONS } from '../lib/firebase';
import { UserProfile, UserRole } from '../types/pharmacy';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string, phone?: string, address?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateCustomerProfile: (data: Partial<UserProfile>) => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'utsavkashyap258@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Synchronize Firestore user document with Firebase Auth
  const syncUserProfile = async (user: User): Promise<UserProfile> => {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, user.uid);
      const userSnap = await getDoc(userRef);

      const isDefaultAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      if (userSnap.exists()) {
        const existingData = userSnap.data() as UserProfile;
        // Elevate if matches known admin email
        if (isDefaultAdmin && existingData.role !== 'admin') {
          const updated = { ...existingData, role: 'admin' as UserRole };
          await setDoc(userRef, updated, { merge: true });
          setUserProfile(updated);
          return updated;
        }
        setUserProfile(existingData);
        return existingData;
      } else {
        // Create initial profile
        const newProfile: UserProfile = {
          uid: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Valued Patient',
          email: user.email || '',
          role: isDefaultAdmin ? 'admin' : 'customer',
          address: 'Kashyap Pharmacy Complex, Health Avenue',
          phone: '+91 8485057206',
          createdAt: new Date().toISOString()
        };
        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
        return newProfile;
      }
    } catch (err) {
      console.warn('Could not sync profile to Firestore (using local session profile):', err);
      const fallback: UserProfile = {
        uid: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Patient User',
        email: user.email || '',
        role: user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'customer',
        createdAt: new Date().toISOString()
      };
      setUserProfile(fallback);
      return fallback;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await syncUserProfile(result.user);
      }
      setAuthModalOpen(false);
    } catch (error: any) {
      console.error('Google Sign In failed:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      if (result.user) {
        await syncUserProfile(result.user);
      }
      setAuthModalOpen(false);
    } catch (error: any) {
      console.error('Email login failed:', error);
      throw error;
    }
  };

  const signupWithEmail = async (
    email: string, 
    pass: string, 
    name: string, 
    phone?: string, 
    address?: string
  ) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      if (result.user) {
        await updateFirebaseProfile(result.user, { displayName: name });
        const isDefaultAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        const newProfile: UserProfile = {
          uid: result.user.uid,
          name,
          email,
          role: isDefaultAdmin ? 'admin' : 'customer',
          phone: phone || '',
          address: address || '',
          createdAt: new Date().toISOString()
        };
        try {
          await setDoc(doc(db, COLLECTIONS.USERS, result.user.uid), newProfile);
        } catch (dbErr) {
          console.warn('Profile write error:', dbErr);
        }
        setUserProfile(newProfile);
      }
      setAuthModalOpen(false);
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const updateCustomerProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser || !userProfile) return;
    const updated = { ...userProfile, ...data };
    try {
      await setDoc(doc(db, COLLECTIONS.USERS, currentUser.uid), updated, { merge: true });
    } catch (e) {
      console.warn('Update profile error in Firestore:', e);
    }
    setUserProfile(updated);
  };

  // Demo account switcher to allow seamless testing of both Customer & Admin roles
  const switchDemoRole = (role: UserRole) => {
    if (role === 'admin') {
      setUserProfile({
        uid: 'demo-admin-utsav',
        name: 'Dr. Utsav Kashyap (Pharmacist Admin)',
        email: ADMIN_EMAIL,
        role: 'admin',
        phone: '+91 8485057206',
        address: 'Kashyap Pharmacy HQ, Medical Enclave',
        createdAt: new Date().toISOString()
      });
    } else {
      setUserProfile({
        uid: 'demo-customer-rahul',
        name: 'Rahul Sharma (Customer)',
        email: 'rahul.sharma@example.com',
        role: 'customer',
        phone: '+91 91234 56789',
        address: '42 Greenway Apartments, Sector 14, Gurugram',
        createdAt: new Date().toISOString()
      });
    }
  };

  const isAdmin = userProfile?.role === 'admin' || userProfile?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        loading,
        isAuthModalOpen,
        setAuthModalOpen,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
        updateCustomerProfile,
        switchDemoRole
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
