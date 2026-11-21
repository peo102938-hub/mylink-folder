"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Share2, Loader2, User, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/clipboard";
import { useAuth } from "@/context/AuthContext";
import { ProfileDropdown } from "./ProfileDropdown";
import { ProfileData } from "@/types/profile";

interface TopAppBarProps {
  displayName: string;
  profileData?: ProfileData | null;
  onAddLinkClick?: () => void;
  onEditProfileClick?: () => void;
  onShowToast: (message: string) => void;
}

export function TopAppBar({
  displayName,
  profileData,
  onAddLinkClick,
  onEditProfileClick,
  onShowToast,
}: TopAppBarProps) {
  // username이 있으면 username 기반 URL, 없으면 displayName 기반으로 fallback
  const profileUsername = profileData?.username || null;
  const { user, loading, signInWithGoogle, logout } = useAuth();
  const [isAuthOperating, setIsAuthOperating] = useState(false);
  const [isNavigatingToMyPage, setIsNavigatingToMyPage] = useState(false);
  const [isNavigatingToStats, setIsNavigatingToStats] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  // 경로 이동 완료 시 로딩 상태 자동 해제
  useEffect(() => {
    setIsNavigatingToMyPage(false);
    setIsNavigatingToStats(false);
  }, [pathname]);

  const handleMyPageNavigation = () => {
    if (isNavigatingToMyPage) return;
    const targetUrl = `/${encodeURIComponent(profileUsername ?? displayName)}`;
    if (pathname === targetUrl) {
      onShowToast("현재 내 페이지입니다.");
      return;
    }
    setIsNavigatingToMyPage(true);
    router.push(targetUrl);
  };

  const handleStatsNavigation = () => {
    if (isNavigatingToStats) return;
    if (pathname === "/stats") {
      onShowToast("현재 통계 페이지입니다.");
      return;
    }
    setIsNavigatingToStats(true);
    router.push("/stats");
  };

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      const success = await copyToClipboard(url);
      if (success) {
        onShowToast("링크를 복사했어요");
      }
    }
  };

  const handleGoogleLogin = async () => {
    if (isAuthOperating) return;
    try {
      setIsAuthOperating(true);
      const loggedUser = await signInWithGoogle();
      if (loggedUser) {
        onShowToast(`${loggedUser.displayName || "사용자"}님 환영합니다!`);
      }
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      if (
        firebaseError?.code !== "auth/popup-closed-by-user" &&
        firebaseError?.code !== "auth/cancelled-popup-request"
      ) {
        console.error("Login failed:", error);
        onShowToast("로그인에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsAuthOperating(false);
    }
  };

  const handleLogout = async () => {
    if (isAuthOperating) return;
    try {
      setIsAuthOperating(true);
      await logout();
      onShowToast("로그아웃되었습니다.");
    } catch (error) {
      console.error("Logout failed:", error);
      onShowToast("로그아웃에 실패했습니다.");
    } finally {
      setIsAuthOperating(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#f9fafb]/90 backdrop-blur-md border-b border-[#e5e8eb] transition-all">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* 좌측 로고 / 홈 이동 링크 */}
        <Link
          href="/"
          className="flex items-center gap-1.5 min-w-0 hover:opacity-80 active:scale-95 transition-all"
          title="홈으로 이동"
        >
          <span className="text-[17px] font-bold tracking-tight text-[#191f28] truncate">
            마이링크
          </span>
        </Link>

        {/* 우측 액션 버튼들 (개인별 페이지 이동 + 프로필 드롭다운 or 구글 로그인 + 공유) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {loading ? (
            <div className="w-8 h-8 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-[#8b95a1]" />
            </div>
          ) : user ? (
            <>
              {/* 통계 페이지 이동 버튼 */}
              <button
                type="button"
                onClick={handleStatsNavigation}
                disabled={isNavigatingToStats}
                className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full text-[12px] font-semibold text-[#4e5968] bg-[#f2f4f6] hover:bg-[#e5e8eb] hover:text-[#191f28] active:scale-95 transition-all cursor-pointer border border-[#e5e8eb] disabled:opacity-70 disabled:cursor-not-allowed"
                title="링크 클릭 통계 분석"
              >
                {isNavigatingToStats ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3182f6]" />
                ) : (
                  <BarChart2 className="w-3.5 h-3.5 text-[#3182f6]" />
                )}
                <span>통계</span>
              </button>

              {/* 개인별 페이지 이동 버튼 (로딩 인디케이터 적용) */}
              <button
                type="button"
                onClick={handleMyPageNavigation}
                disabled={isNavigatingToMyPage}
                className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full text-[12px] font-semibold text-[#3182f6] bg-[#e8f3ff] hover:bg-[#d6e8ff] active:scale-95 transition-all cursor-pointer border border-[#cce4ff] disabled:opacity-80 disabled:cursor-not-allowed"
                title={`${displayName}님의 개인 페이지로 이동`}
              >
                {isNavigatingToMyPage ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3182f6]" />
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
                <span>{isNavigatingToMyPage ? "이동 중..." : "내 페이지"}</span>
              </button>

              {/* 로그인 상태: 추천 레이아웃 적용된 프로필 드롭다운 */}
              <ProfileDropdown
                user={user}
                profileData={profileData ?? null}
                onAddLinkClick={() => {
                  if (onAddLinkClick) onAddLinkClick();
                }}
                onEditProfileClick={() => {
                  if (onEditProfileClick) onEditProfileClick();
                }}
                onCopyLink={handleShare}
                onLogout={handleLogout}
                isLoggingOut={isAuthOperating}
              />
            </>
          ) : (
            /* 비로그인 상태: 구글 로그인 버튼 */
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isAuthOperating}
              onClick={handleGoogleLogin}
              className="rounded-full text-[13px] font-semibold text-[#333d4b] bg-white border-[#d1d6db] hover:bg-[#f2f4f6] hover:border-[#b0b8c1] active:scale-95 transition-all cursor-pointer h-8 px-3 flex items-center gap-1.5 shadow-xs"
            >
              {isAuthOperating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3182f6]" />
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              )}
              <span>Google 로그인</span>
            </Button>
          )}

          {/* 공유 버튼 */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="rounded-full text-[13px] font-semibold text-[#4e5968] hover:text-[#191f28] hover:bg-[#f2f4f6] active:scale-95 transition-all cursor-pointer h-8 px-2.5"
            aria-label="링크 공유하기"
            title="페이지 링크 복사"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
