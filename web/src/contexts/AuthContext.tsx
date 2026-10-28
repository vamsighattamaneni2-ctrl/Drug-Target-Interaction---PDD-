import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  institution: string;
  avatarText: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, role: string, institution: string) => Promise<void>;
  signInAsDemo: (type?: 'lead' | 'investigator' | 'guest') => void;
  signOut: () => Promise<void>;
}

const DEFAULT_DEMO_USER: UserProfile = {
  uid: 'usr-vamsi-01',
  email: 'vamsi@theratarget.org',
  displayName: 'Dr. Vamsi Ghattamaneni',
  role: 'Lead Computational Oncologist',
  institution: 'Therapeutic Discovery Institute',
  avatarText: 'VG',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Check localStorage cache
    const cached = localStorage.getItem('theratarget_user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return DEFAULT_DEMO_USER;
      }
    }
    return DEFAULT_DEMO_USER;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          const profile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || 'researcher@theratarget.org',
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Researcher',
            role: 'Bioinformatics Investigator',
            institution: 'Oncology Research Center',
            avatarText: (firebaseUser.displayName || firebaseUser.email || 'RE').slice(0, 2).toUpperCase(),
          };
          setUser(profile);
          localStorage.setItem('theratarget_user', JSON.stringify(profile));
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const profile: UserProfile = {
          uid: cred.user.uid,
          email: cred.user.email || email,
          displayName: cred.user.displayName || email.split('@')[0],
          role: 'Bioinformatics Investigator',
          institution: 'Oncology Research Center',
          avatarText: email.slice(0, 2).toUpperCase(),
        };
        setUser(profile);
        localStorage.setItem('theratarget_user', JSON.stringify(profile));
      } else {
        // Local simulation fallback
        await new Promise((res) => setTimeout(res, 500));
        const profile: UserProfile = {
          uid: `usr-${Date.now().toString().slice(-4)}`,
          email: email,
          displayName: email.split('@')[0].replace('.', ' '),
          role: 'Bioinformatics Researcher',
          institution: 'Genomics Research Lab',
          avatarText: email.slice(0, 2).toUpperCase(),
        };
        setUser(profile);
        localStorage.setItem('theratarget_user', JSON.stringify(profile));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string, role: string, institution: string) => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const profile: UserProfile = {
          uid: cred.user.uid,
          email: cred.user.email || email,
          displayName: name,
          role: role || 'Computational Biologist',
          institution: institution || 'Academic Medical Center',
          avatarText: name.slice(0, 2).toUpperCase(),
        };
        setUser(profile);
        localStorage.setItem('theratarget_user', JSON.stringify(profile));
      } else {
        await new Promise((res) => setTimeout(res, 500));
        const initials = name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'US';

        const profile: UserProfile = {
          uid: `usr-${Date.now().toString().slice(-4)}`,
          email: email,
          displayName: name,
          role: role || 'Computational Biologist',
          institution: institution || 'Academic Medical Center',
          avatarText: initials,
        };
        setUser(profile);
        localStorage.setItem('theratarget_user', JSON.stringify(profile));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsDemo = (type: 'lead' | 'investigator' | 'guest' = 'lead') => {
    let profile: UserProfile = DEFAULT_DEMO_USER;

    if (type === 'investigator') {
      profile = {
        uid: 'usr-investigator-02',
        email: 'sarah.chen@biotarget.org',
        displayName: 'Dr. Sarah Chen',
        role: 'Structural Pharmacologist',
        institution: 'Genomics & Drug Discovery Lab',
        avatarText: 'SC',
      };
    } else if (type === 'guest') {
      profile = {
        uid: 'usr-guest-03',
        email: 'guest.evaluator@theratarget.org',
        displayName: 'Guest Scientific Evaluator',
        role: 'Visiting Bioinformatician',
        institution: 'University Oncology Consortium',
        avatarText: 'GE',
      };
    }

    setUser(profile);
    localStorage.setItem('theratarget_user', JSON.stringify(profile));
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        await firebaseSignOut(auth);
      }
      setUser(null);
      localStorage.removeItem('theratarget_user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signInAsDemo,
        signOut,
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
