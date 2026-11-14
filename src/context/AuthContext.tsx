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
import { saveUserProfile, getUserProfile, extractEmailPrefix } from "@/lib/firestoreLinks";

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
        // 프로필 동기화:
        // - username: 이메일 앞부분 자동 생성 (기본값)
        // - displayName: 구글 계정 이름 (기본값)
        try {
          const emailPrefix = extractEmailPrefix(currentUser.email);
          const googleDisplayName = currentUser.displayName || "사용자";

          const existingProfile = await getUserProfile(currentUser.uid);

          if (!existingProfile) {
            // 처음 로그인한 유저: 기본 프로필 생성
            await saveUserProfile(currentUser.uid, {
              uid: currentUser.uid,
              username: emailPrefix,
              displayName: googleDisplayName,
              bio: `안녕하세요, ${googleDisplayName}입니다.`,
              email: currentUser.email || "",
              photoURL: currentUser.photoURL || null,
            });
          } else {
            // 이미 프로필이 있는 경우: 사용자가 변경한 값을 보존하면서 누락된 필드만 보충
            await saveUserProfile(currentUser.uid, {
              uid: currentUser.uid,
              username: existingProfile.username || emailPrefix,
              displayName: existingProfile.displayName || googleDisplayName,
              bio: existingProfile.bio !== undefined ? existingProfile.bio : `안녕하세요, ${existingProfile.displayName || googleDisplayName}입니다.`,
              email: currentUser.email || existingProfile.email || "",
              photoURL: currentUser.photoURL || existingProfile.photoURL || null,
            });
          }
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
        const googleDisplayName = loggedInUser.displayName || "사용자";

        const existingProfile = await getUserProfile(loggedInUser.uid);
        if (!existingProfile) {
          await saveUserProfile(loggedInUser.uid, {
            uid: loggedInUser.uid,
            username: emailPrefix,
            displayName: googleDisplayName,
            bio: `안녕하세요, ${googleDisplayName}입니다.`,
            email: loggedInUser.email || "",
            photoURL: loggedInUser.photoURL || null,
          });
        }
      }
      return loggedInUser;
    } catch (error: unknown) {
      const authError = error as { code?: string; message?: string };
      // 사용자가 팝업 창을 닫아 취소한 경우 (auth/popup-closed-by-user 또는 auth/cancelled-popup-request)
      if (
        authError?.code === "auth/popup-closed-by-user" ||
        authError?.code === "auth/cancelled-popup-request"
      ) {
        return null;
      }
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
