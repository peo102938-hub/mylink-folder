"use client";

import { useCallback, useEffect, useState } from "react";
import { ProfileData, LinkItem } from "@/types/profile";
import initialMockProfile from "@/data/mock-profile.json";
import {
  addLinkToFirestore,
  updateLinkInFirestore,
  deleteLinkFromFirestore,
  getLinksFromFirestore,
} from "@/lib/firestoreLinks";

export const STORAGE_KEY = "mylink_profile_data";

export function useProfileStorage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Firestore에서 링크 목록을 1회 조회하여 로컬 상태 + localStorage에 반영
   */
  const refreshLinks = useCallback(async () => {
    try {
      const firestoreLinks = await getLinksFromFirestore();

      setData((current) => {
        if (!current) return current;
        const nextLinks =
          firestoreLinks.length > 0 ? firestoreLinks : current.links;

        const updated: ProfileData = {
          ...current,
          links: nextLinks,
        };

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to update localStorage:", e);
        }

        return updated;
      });
    } catch (error) {
      console.warn("Failed to refresh links from Firestore:", error);
    }
  }, []);

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

    // 페이지 로드 시 Firestore(users/anonymous/links)에서 createdAt 최신순으로 1회 로드
    getLinksFromFirestore()
      .then((links) => {
        if (!isMounted) return;
        if (links && links.length > 0) {
          const updated: ProfileData = {
            ...baseData,
            links,
          };
          setData(updated);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          } catch (e) {
            console.error("Failed to update localStorage:", e);
          }
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn(
          "Failed to load initial links from Firestore, using local fallback:",
          err
        );
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
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

      // Firestore 저장 성공 후 전체 목록을 다시 조회하여 동기화
      await refreshLinks();

      return createdItem;
    } catch (error) {
      console.error("Failed to add link to Firestore (users/anonymous/links):", error);
      throw error;
    }
  };

  const updateLink = async (
    id: string,
    updatedFields: Partial<LinkItem>
  ): Promise<void> => {
    try {
      await updateLinkInFirestore(id, updatedFields);

      // Firestore 업데이트 성공 후 전체 목록을 다시 조회하여 동기화
      await refreshLinks();
    } catch (error) {
      console.error("Failed to update link in Firestore (users/anonymous/links):", error);
      throw error;
    }
  };

  const deleteLink = async (id: string): Promise<void> => {
    try {
      await deleteLinkFromFirestore(id);

      // Firestore 삭제 성공 후 전체 목록을 다시 조회하여 동기화
      await refreshLinks();
    } catch (error) {
      console.error("Failed to delete link from Firestore (users/anonymous/links):", error);
      throw error;
    }
  };

  return {
    data,
    isLoading,
    updateProfile,
    addLink,
    updateLink,
    deleteLink,
    refreshLinks,
  };
}
