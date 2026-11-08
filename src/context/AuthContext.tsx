"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { saveUserProfile, extractEmailPrefix } from "@/lib/firestoreLinks";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => null,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // users/{users.uid} 문서에 프로필 정보 동기화:
        // displayName: 이메일 앞부분(예: peo102938)
        // username: 실제 이름(예: 홍길동)
        try {
          const emailPrefix = extractEmailPrefix(currentUser.email);
          const originalName = currentUser.displayName || "사용자";

          await saveUserProfile(currentUser.uid, {
            uid: currentUser.uid,
            displayName: emailPrefix,
            username: originalName,
            email: currentUser.email || "",
            photoURL: currentUser.photoURL || null,
          });
        } catch (e) {
          console.warn("Failed to sync user profile on auth change:", e);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<User | null> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedInUser = result.user;
      if (loggedInUser) {
        const emailPrefix = extractEmailPrefix(loggedInUser.email);
        const originalName = loggedInUser.displayName || "사용자";

        await saveUserProfile(loggedInUser.uid, {
          uid: loggedInUser.uid,
          displayName: emailPrefix,
          username: originalName,
          email: loggedInUser.email || "",
          photoURL: loggedInUser.photoURL || null,
        });
      }
      return loggedInUser;
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
