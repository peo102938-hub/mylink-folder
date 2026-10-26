"use client";

import { useEffect, useState } from "react";
import { ProfileData, LinkItem } from "@/types/profile";
import initialMockProfile from "@/data/mock-profile.json";
import { addLinkToFirestore, subscribeFirestoreLinks } from "@/lib/firestoreLinks";

export const STORAGE_KEY = "mylink_profile_data";

export function useProfileStorage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
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
    setData(baseData);
    setIsLoading(false);

    // Firestore `users/anonymous/links` 실시간 동기화
    const unsubscribe = subscribeFirestoreLinks(
      (firestoreLinks) => {
        setData((current) => {
          const profile = current || baseData;
          if (firestoreLinks.length === 0) {
            return profile;
          }

          // Firestore 링크를 상단에 배치하고, 중복되지 않는 기본/로컬 링크들을 보존
          const firestoreIds = new Set(firestoreLinks.map((item) => item.id));
          const existingRemainingLinks = (profile.links || []).filter(
            (item) => !firestoreIds.has(item.id)
          );

          const updated: ProfileData = {
            ...profile,
            links: [...firestoreLinks, ...existingRemainingLinks],
          };

          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          } catch (e) {
            console.error("Failed to update localStorage:", e);
          }

          return updated;
        });
      },
      (error) => {
        console.warn("Could not sync links from Firestore, using local data:", error);
      }
    );

    return () => {
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
        const remaining = prev.links.filter((l) => l.id !== createdItem.id);
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
