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
import { LandingPageView } from "@/components/landing/LandingPageView";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { AddLinkDialog } from "@/components/profile/AddLinkDialog";
import { Toast } from "@/components/ui/Toast";
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react";

export default function Home() {
  const { user, data, isLoading, updateProfile, addLink, updateLink, deleteLink } =
    useProfileStorage();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 로그인 상태에서 랜딩 페이지 미리보기 토글 상태
  const [showLandingView, setShowLandingView] = useState(false);

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
      {/* 1. 상단 고정 앱 바 (반응형 지원) */}
      <TopAppBar
        displayName={data?.displayName ?? (user?.displayName || "마이링크")}
        profileData={data}
        onAddLinkClick={() => setIsAddLinkOpen(true)}
        onEditProfileClick={() => setIsEditProfileOpen(true)}
        onShowToast={showToast}
      />

      {/* 2. 메인 콘텐츠 */}
      {isLoading ? (
        <ProfileSkeleton />
      ) : !user || showLandingView ? (
        /* 비로그인 상태이거나, 로그인 사용자가 서비스 소개를 볼 때: 반응형 랜딩 페이지 뷰 */
        <main className="w-full flex flex-col items-center">
          {/* 로그인 사용자가 랜딩을 보고 있을 때 상단 돌아가기 플로팅 바 */}
          {user && (
            <div className="w-full max-w-5xl px-4 sm:px-6 pt-4">
              <button
                type="button"
                onClick={() => setShowLandingView(false)}
                className="w-full py-2.5 px-4 rounded-2xl bg-white border border-[#3182f6] text-[#3182f6] text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-xs hover:bg-[#e8f3ff] active:scale-[0.99] transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>내 마이링크 관리 화면으로 돌아가기</span>
              </button>
            </div>
          )}
          <LandingPageView onShowToast={showToast} />
        </main>
      ) : data ? (
        /* 로그인 상태 화면: users/{users.uid}/links 개인화 데이터 및 유저 정보 관리 */
        <main className="w-full max-w-lg px-5 pt-5 pb-12 flex flex-col gap-4">
          {/* 랜딩 페이지 둘러보기 안내 미니 배너 */}
          <button
            type="button"
            onClick={() => setShowLandingView(true)}
            className="w-full py-2.5 px-4 rounded-2xl bg-white border border-[#e5e8eb] text-[#4e5968] hover:text-[#191f28] hover:border-[#b0b8c1] text-[13px] font-medium flex items-center justify-between shadow-2xs hover:shadow-xs active:scale-[0.99] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#3182f6]" />
              <span>마이링크 서비스 소개 & 기능 둘러보기</span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#8b95a1]" />
          </button>

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

          {/* users/{user.uid}/links 주요 링크 카드 리스트 */}
          <LinkCardList
            links={data.links}
            onAddLink={addLink}
            onUpdateLink={updateLink}
            onDeleteLink={deleteLink}
            isEditable={true}
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
          currentUid={user?.uid}
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
