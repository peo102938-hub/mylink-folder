"use client";

import { useCallback, useEffect, useState } from "react";
import { ProfileData, LinkItem } from "@/types/profile";
import initialMockProfile from "@/data/mock-profile.json";
import {
  addLinkToFirestore,
  updateLinkInFirestore,
  deleteLinkFromFirestore,
  getLinksFromFirestore,
  subscribeFirestoreLinks,
  getUserProfile,
  saveUserProfile,
  extractEmailPrefix,
} from "@/lib/firestoreLinks";
import { useAuth } from "@/context/AuthContext";

export function useProfileStorage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Firestore에서 링크 목록 수동 재조회
  const refreshLinks = useCallback(async () => {
    if (!user) return;
    try {
      const firestoreLinks = await getLinksFromFirestore(user.uid);
      setData((current) => {
        if (!current) return current;
        return {
          ...current,
          links: firestoreLinks,
        };
      });
    } catch (error) {
      console.warn("Failed to refresh links from Firestore:", error);
    }
  }, [user]);

  // user 변경 또는 로그인 상태 변경 시 실행
  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    if (!user) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let isMounted = true;

    // 1. 유저 프로필 문서 가져오기 & 동기화
    const setupUserData = async () => {
      try {
        const remoteProfile = await getUserProfile(user.uid);

        // displayName은 이메일 앞부분(예: peo102938), username은 이름
        const emailPrefix = extractEmailPrefix(user.email);
        const initialDisplayName = remoteProfile?.displayName || emailPrefix;
        const initialUsername =
          remoteProfile?.username || user.displayName || "사용자";
        const initialEmail = remoteProfile?.email || user.email || "";
        const initialAvatarUrl = remoteProfile?.photoURL || user.photoURL || null;
        const initialBio =
          remoteProfile?.bio ||
          `${initialUsername}(@${initialDisplayName})님의 개인화된 링크 보관함입니다.`;
        const initialRole = remoteProfile?.role || "Personal Link Creator";

        const baseProfile: ProfileData = {
          displayName: initialDisplayName,
          username: initialUsername,
          role: initialRole,
          bio: initialBio,
          avatarText: initialDisplayName.slice(0, 1).toUpperCase(),
          avatarUrl: initialAvatarUrl,
          email: initialEmail,
          resumeUrl: null,
          stacks: (initialMockProfile as ProfileData).stacks || ["Link Management", "Cloud Sync"],
          links: [],
          socials: (initialMockProfile as ProfileData).socials || [],
        };

        if (isMounted) {
          setData(baseProfile);
        }

        // 2. users/{user.uid}/links 실시간 구독
        const unsubscribe = subscribeFirestoreLinks(
          user.uid,
          async (links) => {
            if (!isMounted) return;

            // 만약 처음 로그인해서 링크가 아예 없다면 기본 가이드 링크 1개를 Firestore에 자동 생성
            if (links.length === 0) {
              try {
                const sampleLink = {
                  title: "첫 번째 링크를 시작해보세요!",
                  url: "https://google.com",
                  subtitle: "오른쪽 수정/삭제 버튼으로 자유롭게 변경할 수 있어요",
                  icon: "✨",
                  badge: "시작하기",
                  isActive: true,
                };
                await addLinkToFirestore(user.uid, sampleLink);
                // 추가 후 onSnapshot에 의해 다음 콜백에서 links가 전달됨
                return;
              } catch (e) {
                console.warn("Auto-seeding first link failed:", e);
              }
            }

            setData((prev) => {
              if (!prev) {
                return {
                  ...baseProfile,
                  links,
                };
              }
              return {
                ...prev,
                links,
              };
            });
            setIsLoading(false);
          },
          (err) => {
            console.warn("Subscription error, fallback to one-time load:", err);
            getLinksFromFirestore(user.uid).then((links) => {
              if (isMounted) {
                setData((prev) => (prev ? { ...prev, links } : null));
                setIsLoading(false);
              }
            });
          }
        );

        return unsubscribe;
      } catch (err) {
        console.error("Error setting up user profile & links:", err);
        if (isMounted) setIsLoading(false);
        return () => {};
      }
    };

    let cleanupPromise = setupUserData();

    return () => {
      isMounted = false;
      cleanupPromise.then((cleanup) => {
        if (cleanup) cleanup();
      });
    };
  }, [user, authLoading]);

  const updateProfile = async (newData: ProfileData) => {
    if (!user) return;
    setData(newData);
    try {
      await saveUserProfile(user.uid, {
        displayName: newData.displayName,
        username: newData.username,
        email: newData.email,
        bio: newData.bio,
        role: newData.role,
        photoURL: newData.avatarUrl,
      });
    } catch (error) {
      console.error("Failed to update profile data in Firestore:", error);
    }
  };

  const addLink = async (newLink: Omit<LinkItem, "id"> | LinkItem): Promise<LinkItem> => {
    if (!user) {
      throw new Error("로그인이 필요합니다.");
    }
    try {
      const createdItem = await addLinkToFirestore(user.uid, newLink);
      await refreshLinks();
      return createdItem;
    } catch (error) {
      console.error(`Failed to add link to users/${user.uid}/links:`, error);
      throw error;
    }
  };

  const updateLink = async (
    id: string,
    updatedFields: Partial<LinkItem>
  ): Promise<void> => {
    if (!user) {
      throw new Error("로그인이 필요합니다.");
    }
    try {
      await updateLinkInFirestore(user.uid, id, updatedFields);
      await refreshLinks();
    } catch (error) {
      console.error(`Failed to update link in users/${user.uid}/links:`, error);
      throw error;
    }
  };

  const deleteLink = async (id: string): Promise<void> => {
    if (!user) {
      throw new Error("로그인이 필요합니다.");
    }
    try {
      await deleteLinkFromFirestore(user.uid, id);
      await refreshLinks();
    } catch (error) {
      console.error(`Failed to delete link from users/${user.uid}/links:`, error);
      throw error;
    }
  };

  return {
    user,
    authLoading,
    data,
    isLoading: authLoading || isLoading,
    updateProfile,
    addLink,
    updateLink,
    deleteLink,
    refreshLinks,
  };
}
