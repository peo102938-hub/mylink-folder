"use client";

import { useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProfileData, LinkItem } from "@/types/profile";
import initialMockProfile from "@/data/mock-profile.json";
import {
  addLinkToFirestore,
  updateLinkInFirestore,
  deleteLinkFromFirestore,
  getLinksFromFirestore,
  getUserProfile,
  saveUserProfile,
  extractEmailPrefix,
} from "@/lib/firestoreLinks";
import { useAuth } from "@/context/AuthContext";

export function useProfileStorage() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  // 1. 프로필 정보 1회성 조회 쿼리 (TanStack Query)
  const profileQuery = useQuery({
    queryKey: ["userProfile", user?.uid],
    queryFn: async (): Promise<ProfileData> => {
      if (!user) throw new Error("로그인이 필요합니다.");

      const remoteProfile = await getUserProfile(user.uid);
      const emailPrefix = extractEmailPrefix(user.email);
      const googleDisplayName = user.displayName || "사용자";

      const initialUsername = remoteProfile?.username || emailPrefix;
      const initialDisplayName = remoteProfile?.displayName || googleDisplayName;
      const initialEmail = remoteProfile?.email || user.email || "";
      const initialAvatarUrl = remoteProfile?.photoURL || user.photoURL || null;
      const initialBio =
        remoteProfile?.bio !== undefined
          ? remoteProfile.bio
          : `안녕하세요, ${initialDisplayName}입니다.`;
      const initialRole = remoteProfile?.role || "Creator";

      return {
        displayName: initialDisplayName,
        username: initialUsername,
        role: initialRole,
        bio: initialBio,
        avatarText: (initialDisplayName || initialUsername).slice(0, 1).toUpperCase(),
        avatarUrl: initialAvatarUrl,
        email: initialEmail,
        resumeUrl: null,
        stacks: (initialMockProfile as ProfileData).stacks || ["Link Management", "Cloud Sync"],
        links: [],
        socials: (initialMockProfile as ProfileData).socials || [],
      };
    },
    enabled: !!user && !authLoading,
  });

  // 2. 링크 목록 조회 쿼리 (실시간 리스너 대체, TanStack Query)
  const linksQuery = useQuery({
    queryKey: ["userLinks", user?.uid],
    queryFn: async (): Promise<LinkItem[]> => {
      if (!user) return [];
      const links = await getLinksFromFirestore(user.uid);

      // 신규 유저로 링크가 없을 경우 기본 시작 링크 생성
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
          const created = await addLinkToFirestore(user.uid, sampleLink);
          return [created];
        } catch (e) {
          console.warn("Auto-seeding first link failed:", e);
          return [];
        }
      }
      return links;
    },
    enabled: !!user && !authLoading,
  });

  // 3. 프로필 업데이트 Mutation (낙관적 업데이트 적용)
  const updateProfileMutation = useMutation({
    mutationFn: async (newData: ProfileData) => {
      if (!user) throw new Error("로그인이 필요합니다.");
      await saveUserProfile(user.uid, {
        displayName: newData.displayName,
        username: newData.username,
        email: newData.email,
        bio: newData.bio,
        role: newData.role,
        photoURL: newData.avatarUrl,
      });
      return newData;
    },
    // 낙관적 업데이트(Optimistic Update)
    onMutate: async (newData: ProfileData) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ["userProfile", user?.uid] });

      // 이전 프로필 데이터 스냅샷 저장
      const previousProfile = queryClient.getQueryData<ProfileData>(["userProfile", user?.uid]);

      // 새 데이터를 캐시에 즉시 반영하여 UI에 즉각 노출
      queryClient.setQueryData<ProfileData>(["userProfile", user?.uid], (old) => {
        if (!old) return newData;
        const initial = (newData.displayName || newData.username || "U").slice(0, 1).toUpperCase();
        return {
          ...old,
          ...newData,
          avatarText: initial,
        };
      });

      // 에러 발생 시 롤백을 위해 context 반환
      return { previousProfile };
    },
    onError: (err, newData, context) => {
      // 오류 발생 시 이전 데이터로 캐시 롤백
      if (context?.previousProfile) {
        queryClient.setQueryData(["userProfile", user?.uid], context.previousProfile);
      }
      console.error("Profile update failed, rolling back optimistic update:", err);
    },
    onSettled: () => {
      // 성공/실패 여부와 관계없이 서버 최신 상태와 동기화
      queryClient.invalidateQueries({ queryKey: ["userProfile", user?.uid] });
    },
  });

  // 4. 링크 추가 Mutation
  const addLinkMutation = useMutation({
    mutationFn: async (newLink: Omit<LinkItem, "id"> | LinkItem) => {
      if (!user) throw new Error("로그인이 필요합니다.");
      return await addLinkToFirestore(user.uid, newLink);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userLinks", user?.uid] });
    },
  });

  // 5. 링크 수정 Mutation
  const updateLinkMutation = useMutation({
    mutationFn: async ({
      id,
      updatedFields,
    }: {
      id: string;
      updatedFields: Partial<LinkItem>;
    }) => {
      if (!user) throw new Error("로그인이 필요합니다.");
      await updateLinkInFirestore(user.uid, id, updatedFields);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userLinks", user?.uid] });
    },
  });

  // 6. 링크 삭제 Mutation
  const deleteLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("로그인이 필요합니다.");
      await deleteLinkFromFirestore(user.uid, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userLinks", user?.uid] });
    },
  });

  // 조합된 전체 프로필 데이터
  const data: ProfileData | null = useMemo(() => {
    if (!user || !profileQuery.data) return null;
    return {
      ...profileQuery.data,
      links: linksQuery.data || [],
    };
  }, [user, profileQuery.data, linksQuery.data]);

  // 수동 링크 새로고침
  const refreshLinks = useCallback(async () => {
    if (!user) return;
    await queryClient.invalidateQueries({ queryKey: ["userLinks", user.uid] });
  }, [queryClient, user]);

  const updateProfile = async (newData: ProfileData) => {
    await updateProfileMutation.mutateAsync(newData);
  };

  const addLink = async (newLink: Omit<LinkItem, "id"> | LinkItem): Promise<LinkItem> => {
    return await addLinkMutation.mutateAsync(newLink);
  };

  const updateLink = async (id: string, updatedFields: Partial<LinkItem>): Promise<void> => {
    await updateLinkMutation.mutateAsync({ id, updatedFields });
  };

  const deleteLink = async (id: string): Promise<void> => {
    await deleteLinkMutation.mutateAsync(id);
  };

  const isLoading =
    authLoading ||
    (!!user && (profileQuery.isLoading || linksQuery.isLoading));

  return {
    user,
    authLoading,
    data,
    isLoading,
    updateProfile,
    addLink,
    updateLink,
    deleteLink,
    refreshLinks,
  };
}
