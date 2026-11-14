"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProfileStorage } from "@/hooks/useProfileStorage";
import { TopAppBar } from "@/components/profile/TopAppBar";
import { HeroCard } from "@/components/profile/HeroCard";
import { QuickActions } from "@/components/profile/QuickActions";
import { LinkCardList } from "@/components/profile/LinkCardList";
import { TechStacks } from "@/components/profile/TechStacks";
import { SocialBar } from "@/components/profile/SocialBar";
import { Footer } from "@/components/profile/Footer";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { AddLinkDialog } from "@/components/profile/AddLinkDialog";
import { Toast } from "@/components/ui/Toast";
import { LinkItem, ProfileData } from "@/types/profile";
import {
  UserProfileDoc,
  subscribeFirestoreLinks,
  addLinkToFirestore,
  updateLinkInFirestore,
  deleteLinkFromFirestore,
  recordLinkClick,
  saveUserProfile,
} from "@/lib/firestoreLinks";
import initialMockProfile from "@/data/mock-profile.json";

interface UserProfileClientViewProps {
  userProfile: UserProfileDoc;
  initialLinks: LinkItem[];
}

export function UserProfileClientView({
  userProfile,
  initialLinks,
}: UserProfileClientViewProps) {
  const { user: currentUser } = useAuth();
  // 로그인한 본인의 데이터 (TopAppBar 및 헤더 드롭다운용)
  const { data: myProfileData, updateProfile: updateMyProfile } = useProfileStorage();

  const [links, setLinks] = useState<LinkItem[]>(initialLinks);
  const [profile, setProfile] = useState<UserProfileDoc>(userProfile);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 헤더 드롭다운 및 외부 액션용 다이얼로그 상태 (본인 페이지일 때만 동작)
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // 현재 페이지의 유저가 본인인지 확인
  const isOwner = currentUser?.uid === userProfile.uid;

  // 실시간 users/{userId}/links 동기화
  useEffect(() => {
    if (!userProfile.uid) return;
    const unsubscribe = subscribeFirestoreLinks(userProfile.uid, (updatedLinks) => {
      setLinks(updatedLinks);
    });
    return () => unsubscribe();
  }, [userProfile.uid]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 2400);
  };

  // 본인인 경우 링크 관리 핸들러
  const handleAddLink = async (newLink: Omit<LinkItem, "id"> | LinkItem) => {
    if (!isOwner) return;
    const created = await addLinkToFirestore(userProfile.uid, newLink);
    return created;
  };

  const handleUpdateLink = async (id: string, updatedFields: Partial<LinkItem>) => {
    if (!isOwner) return;
    await updateLinkInFirestore(userProfile.uid, id, updatedFields);
  };

  const handleDeleteLink = async (id: string) => {
    if (!isOwner) return;
    await deleteLinkFromFirestore(userProfile.uid, id);
  };

  // 링크 클릭 핸들러: 방문자가 클릭할 때만 카운트 저장 (편집 모드/소유자일 때는 제외)
  const handleLinkClick = async (linkId: string) => {
    if (isOwner) return;
    await recordLinkClick(userProfile.uid, linkId);
  };

  const displayName = profile.displayName || "사용자";
  const username = profile.username || "";
  const role = profile.role || "Creator";
  const bio =
    profile.bio !== undefined && profile.bio !== ""
      ? profile.bio
      : `안녕하세요, ${displayName}입니다.`;
  const avatarText = (displayName || username || "U").slice(0, 1).toUpperCase();
  const avatarUrl = profile.photoURL || null;
  const email = profile.email || "";

  const stacks = (initialMockProfile as ProfileData).stacks || ["Link Management", "Cloud Sync"];
  const socials = (initialMockProfile as ProfileData).socials || [];

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#191f28] flex flex-col items-center">
      {/* 1. 상단 고정 앱 바 */}
      <TopAppBar
        displayName={myProfileData?.displayName ?? (currentUser?.displayName || "마이링크")}
        profileData={myProfileData}
        onAddLinkClick={isOwner ? () => setIsAddLinkOpen(true) : undefined}
        onEditProfileClick={isOwner ? () => setIsEditProfileOpen(true) : undefined}
        onShowToast={showToast}
      />

      {/* 2. 메인 콘텐츠 */}
      <main className="w-full max-w-lg px-5 pt-6 pb-12 flex flex-col gap-4">
        {/* 본인 페이지인지 타인 공개 페이지인지 알림 배너 */}
        {isOwner ? (
          <div className="flex items-center justify-between px-3.5 py-2 rounded-[14px] bg-[#e8f3ff] border border-[#cce4ff] text-[12px] font-medium text-[#1b64da]">
            <span>✨ 내 개인 공개 프로필 페이지를 보고 있어요</span>
            <span className="font-semibold underline cursor-pointer" onClick={() => setIsEditProfileOpen(true)}>
              프로필 편집
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between px-3.5 py-2 rounded-[14px] bg-white border border-[#e5e8eb] text-[12px] font-medium text-[#6b7684]">
            <span>@{username} 님의 개인 페이지</span>
            <span className="text-[11px] text-[#8b95a1]">공개 뷰</span>
          </div>
        )}

        {/* 프로필 히어로 카드 */}
        <HeroCard
          displayName={displayName}
          username={username}
          role={role}
          bio={bio}
          avatarText={avatarText}
          avatarUrl={avatarUrl}
        />

        {/* 빠른 액션 바 (이메일 복사 등) */}
        <QuickActions
          email={email}
          resumeUrl={null}
          onShowToast={showToast}
        />

        {/* users/{userId}/links 링크 카드 리스트 (소유자면 추가/수정/삭제 가능, 방문자면 읽기 전용, 개인별 페이지에서는 조회수 비노출) */}
        <LinkCardList
          links={links}
          onAddLink={isOwner ? handleAddLink : undefined}
          onUpdateLink={isOwner ? handleUpdateLink : undefined}
          onDeleteLink={isOwner ? handleDeleteLink : undefined}
          onLinkClick={handleLinkClick}
          showClickCount={false}
          isEditable={isOwner}
          onShowToast={showToast}
        />

        {/* 기술 스택 / 태그 칩 */}
        <TechStacks stacks={stacks} />

        {/* 소셜 아이콘 바 */}
        <SocialBar socials={socials} />

        {/* 바텀 푸터 */}
        <Footer />
      </main>

      {/* 소유자일 때만 열리는 링크 추가 모달 */}
      {isOwner && (
        <AddLinkDialog
          isOpen={isAddLinkOpen}
          onOpenChange={setIsAddLinkOpen}
          triggerButton={null}
          onAddLink={handleAddLink}
          onShowToast={showToast}
        />
      )}

      {/* 소유자일 때만 열리는 프로필 정보 수정 모달 */}
      {isOwner && (
        <EditProfileDialog
          open={isEditProfileOpen}
          onOpenChange={setIsEditProfileOpen}
          currentUid={userProfile.uid}
          initialData={{
            displayName: profile.displayName,
            username: profile.username,
            role: profile.role,
            bio: profile.bio || "",
          }}
          onSave={async (updated) => {
            const updatedProfileData = {
              ...profile,
              displayName: updated.displayName,
              username: updated.username,
              role: updated.role,
              bio: updated.bio,
            };
            await saveUserProfile(userProfile.uid, updatedProfileData);
            setProfile(updatedProfileData);
            if (updateMyProfile && myProfileData) {
              await updateMyProfile({
                ...myProfileData,
                displayName: updated.displayName,
                username: updated.username,
                role: updated.role,
                bio: updated.bio,
              });
            }
          }}
          onShowToast={showToast}
        />
      )}

      {/* 하단 토스트 알림 */}
      <Toast message={toastMessage} />
    </div>
  );
}
