"use client";

import { useState } from "react";
import { useProfileStorage } from "@/hooks/useProfileStorage";
import { TopAppBar } from "@/components/profile/TopAppBar";
import { HeroCard } from "@/components/profile/HeroCard";
import { QuickActions } from "@/components/profile/QuickActions";
import { LinkCardList } from "@/components/profile/LinkCardList";
import { TechStacks } from "@/components/profile/TechStacks";
import { SocialBar } from "@/components/profile/SocialBar";
import { Footer } from "@/components/profile/Footer";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import { LoginRequiredView } from "@/components/profile/LoginRequiredView";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { AddLinkDialog } from "@/components/profile/AddLinkDialog";
import { Toast } from "@/components/ui/Toast";

export default function Home() {
  const { user, data, isLoading, updateProfile, addLink, updateLink, deleteLink } =
    useProfileStorage();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 헤더 드롭다운 및 외부 액션용 다이얼로그 상태
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 2400);
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#191f28] flex flex-col items-center">
      {/* 1. 상단 고정 앱 바 (프로필 드롭다운 메뉴 포함) */}
      <TopAppBar
        displayName={data?.displayName ?? (user?.email?.split("@")[0] || "마이링크")}
        profileData={data}
        onAddLinkClick={() => setIsAddLinkOpen(true)}
        onEditProfileClick={() => setIsEditProfileOpen(true)}
        onShowToast={showToast}
      />

      {/* 2. 메인 콘텐츠 */}
      {isLoading ? (
        <ProfileSkeleton />
      ) : !user ? (
        /* 비로그인 상태 화면: 설명 문구 및 구글 로그인 유도 */
        <main className="w-full max-w-lg px-5 pt-4 pb-12 flex flex-col gap-4">
          <LoginRequiredView onShowToast={showToast} />
          <Footer />
        </main>
      ) : data ? (
        /* 로그인 상태 화면: users/{users.uid}/links 개인화 데이터 및 유저 정보 */
        <main className="w-full max-w-lg px-5 pt-6 pb-12 flex flex-col gap-4">
          {/* 프로필 히어로 카드 (로그인된 유저 정보 표시) */}
          <HeroCard
            displayName={data.displayName}
            username={data.username}
            role={data.role}
            bio={data.bio}
            avatarText={data.avatarText}
            avatarUrl={data.avatarUrl}
          />

          {/* 빠른 액션 바 */}
          <QuickActions
            email={data.email}
            resumeUrl={data.resumeUrl}
            onShowToast={showToast}
          />

          {/* users/{user.uid}/links 주요 링크 카드 리스트 (추가, 수정, 삭제) */}
          <LinkCardList
            links={data.links}
            onAddLink={addLink}
            onUpdateLink={updateLink}
            onDeleteLink={deleteLink}
            onShowToast={showToast}
          />

          {/* 기술 스택 / 태그 칩 */}
          <TechStacks stacks={data.stacks} />

          {/* 소셜 아이콘 바 */}
          <SocialBar socials={data.socials} />

          {/* 바텀 푸터 */}
          <Footer />
        </main>
      ) : null}

      {/* 헤더 드롭다운에서 트리거되는 링크 추가 모달 */}
      <AddLinkDialog
        isOpen={isAddLinkOpen}
        onOpenChange={setIsAddLinkOpen}
        triggerButton={null}
        onAddLink={addLink}
        onShowToast={showToast}
      />

      {/* 헤더 드롭다운에서 트리거되는 프로필 정보 수정 모달 */}
      {data && (
        <EditProfileDialog
          open={isEditProfileOpen}
          onOpenChange={setIsEditProfileOpen}
          initialData={{
            displayName: data.displayName,
            username: data.username,
            role: data.role,
            bio: data.bio,
          }}
          onSave={async (updated) => {
            await updateProfile({
              ...data,
              displayName: updated.displayName,
              username: updated.username,
              role: updated.role,
              bio: updated.bio,
            });
          }}
          onShowToast={showToast}
        />
      )}

      {/* 하단 토스트 알림 */}
      <Toast message={toastMessage} />
    </div>
  );
}
