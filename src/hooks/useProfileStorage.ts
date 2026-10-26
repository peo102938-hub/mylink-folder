"use client";

import { useEffect, useState } from "react";
import { ProfileData, LinkItem } from "@/types/profile";
import initialMockProfile from "@/data/mock-profile.json";
import {
  addLinkToFirestore,
  getLinksFromFirestore,
  subscribeFirestoreLinks,
} from "@/lib/firestoreLinks";

export const STORAGE_KEY = "mylink_profile_data";

export function useProfileStorage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    let baseData: ProfileData;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        baseData = JSON.parse(stored) as ProfileData;
      } else {
        // DATA-01: Auto Seed if storage is empty
        baseData = initialMockProfile as ProfileData;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(baseData));
      }
    } catch (error) {
      console.error("Failed to load profile data from localStorage:", error);
      baseData = initialMockProfile as ProfileData;
    }

    // 초기 로컬 데이터 설정
    setData(baseData);

    /**
     * Firestore(users/anonymous/links)에서 createdAt 기준 최신순 정렬 링크 목록을 상태에 반영
     */
    const syncFirestoreLinks = (firestoreLinks: LinkItem[]) => {
      if (!isMounted) return;

      setData((current) => {
        const profile = current || baseData;
        // Firestore에 데이터가 존재하면 최신순으로 정렬된 Firestore 링크 목록 적용
        const nextLinks =
          firestoreLinks.length > 0 ? firestoreLinks : profile.links;

        const updated: ProfileData = {
          ...profile,
          links: nextLinks,
        };

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to update localStorage:", e);
        }

        return updated;
      });
      setIsLoading(false);
    };

    // 1. 페이지 로드 시 Firestore(users/anonymous/links)에서 createdAt 최신순으로 1회 로드
    getLinksFromFirestore()
      .then((links) => {
        if (links && links.length > 0) {
          syncFirestoreLinks(links);
        } else {
          if (isMounted) setIsLoading(false);
        }
      })
      .catch((err) => {
        console.warn(
          "Failed to load initial links from Firestore, using local fallback:",
          err
        );
        if (isMounted) setIsLoading(false);
      });

    // 2. Firestore(users/anonymous/links) 실시간 구독 (createdAt 최신순 정렬)
    const unsubscribe = subscribeFirestoreLinks(
      (firestoreLinks) => {
        syncFirestoreLinks(firestoreLinks);
      },
      (error) => {
        console.warn(
          "Could not sync links from Firestore, using local data:",
          error
        );
        if (isMounted) setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const updateProfile = (newData: ProfileData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      setData(newData);
    } catch (error) {
      console.error("Failed to update profile data in localStorage:", error);
    }
  };

  const addLink = async (newLink: Omit<LinkItem, "id"> | LinkItem): Promise<LinkItem> => {
    try {
      const createdItem = await addLinkToFirestore(newLink);

      setData((prev) => {
        if (!prev) return prev;
        const remaining = (prev.links || []).filter((l) => l.id !== createdItem.id);
        const updated: ProfileData = {
          ...prev,
          links: [createdItem, ...remaining],
        };

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to update localStorage:", e);
        }

        return updated;
      });

      return createdItem;
    } catch (error) {
      console.error("Failed to add link to Firestore (users/anonymous/links):", error);
      throw error;
    }
  };

  return {
    data,
    isLoading,
    updateProfile,
    addLink,
  };
}
