"use client";

import { useState } from "react";
import { Database, ShieldCheck, User as UserIcon } from "lucide-react";
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
import { Toast } from "@/components/ui/Toast";

export default function Home() {
  const { user, data, isLoading, addLink, updateLink, deleteLink } = useProfileStorage();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 2400);
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#191f28] flex flex-col items-center">
      {/* 1. 상단 고정 앱 바 (구글 소셜 로그인 및 공유 버튼 포함) */}
      <TopAppBar
        displayName={data?.displayName ?? (user?.displayName || "마이링크")}
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
          {/* Firestore 개인화 경로 및 유저 계정 상태 안내 카드 */}
          <div className="rounded-[18px] bg-[#f0f6ff] border border-[#d1e6ff] px-4 py-3 flex items-center justify-between gap-3 text-[13px] text-[#1b64da]">
            <div className="flex items-center gap-2 min-w-0">
              <Database className="w-4 h-4 shrink-0 text-[#3182f6]" />
              <div className="truncate">
                <span className="font-semibold">저장 경로: </span>
                <span className="font-mono text-[12px] bg-white/80 px-1.5 py-0.5 rounded border border-[#c5ddff] text-[#1b64da]">
                  users/{user.uid}/links
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 text-[12px] text-[#4e5968] bg-white/70 px-2 py-0.5 rounded-full border border-[#dbe9ff]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00b06b]" />
              <span>개인화 활성화</span>
            </div>
          </div>

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

      {/* 하단 토스트 알림 */}
      <Toast message={toastMessage} />
    </div>
  );
}
