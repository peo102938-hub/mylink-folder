"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { User as FirebaseUser } from "firebase/auth";
import {
  User,
  Plus,
  Copy,
  Edit3,
  LogOut,
  BarChart2,
  ChevronDown,
  ChevronRight,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { ProfileData } from "@/types/profile";

interface ProfileDropdownProps {
  user: FirebaseUser;
  profileData: ProfileData | null;
  onAddLinkClick: () => void;
  onEditProfileClick: () => void;
  onCopyLink: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
}

export function ProfileDropdown({
  user,
  profileData,
  onAddLinkClick,
  onEditProfileClick,
  onCopyLink,
  onLogout,
  isLoggingOut,
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isNavigatingProfile, setIsNavigatingProfile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsNavigatingProfile(false);
  }, [pathname]);

  // 바깥 영역 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const displayName = profileData?.displayName || user.displayName || "사용자";
  const username = profileData?.username || user.email?.split("@")[0] || "user";
  const email = profileData?.email || user.email || "";
  const photoUrl = profileData?.avatarUrl || user.photoURL || null;

  // username이 있으면 username 기반 URL 사용 (고유 식별자, 중복 없음)
  const profileHref = `/${encodeURIComponent(username)}`;

  // 통계 계산
  const totalLinks = profileData?.links?.length || 0;
  const activeLinks = profileData?.links?.filter((l) => l.isActive).length || 0;
  const inactiveLinks = totalLinks - activeLinks;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* 헤더 트리거 버튼 (아바타 + 유저명 + 드롭다운 아이콘) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-[#f2f4f6] active:bg-[#e5e8eb] active:scale-95 transition-all cursor-pointer border border-transparent hover:border-[#e5e8eb]"
        aria-expanded={isOpen}
        aria-label="프로필 메뉴 열기"
      >
        {photoUrl ? (
          <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#d1d6db] shrink-0">
            <Image
              src={photoUrl}
              alt={displayName}
              fill
              sizes="28px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full bg-[#e8f3ff] text-[#3182f6] text-xs font-bold flex items-center justify-center border border-[#cce4ff] shrink-0">
            {displayName.slice(0, 1)}
          </div>
        )}
        <span className="text-[13px] font-semibold text-[#333d4b] max-w-[80px] truncate">
          {displayName}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#8b95a1] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* 드롭다운 메뉴 팝오버 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-[22px] bg-white border border-[#e5e8eb] shadow-[0_12px_40px_rgba(25,31,40,0.12)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
          {/* 1. 계정 및 사용자 식별 정보 헤더 (클릭 시 개인별 페이지로 이동) */}
          <button
            type="button"
            disabled={isNavigatingProfile}
            onClick={() => {
              if (isNavigatingProfile) return;
              setIsNavigatingProfile(true);
              setIsOpen(false);
              router.push(profileHref);
            }}
            className="w-full text-left p-3 bg-[#f9fafb] hover:bg-[#f2f4f6] rounded-[16px] border border-[#f2f4f6] flex items-center gap-3 transition-colors cursor-pointer group disabled:opacity-75"
            title={`${displayName}님의 개인 페이지로 이동`}
          >
            {photoUrl ? (
              <div className="relative w-11 h-11 rounded-full overflow-hidden border border-[#e5e8eb] shrink-0">
                <Image
                  src={photoUrl}
                  alt={displayName}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#e8f3ff] text-[#3182f6] font-bold text-lg flex items-center justify-center shrink-0 border border-[#d1e6ff]">
                {displayName.slice(0, 1)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] font-bold text-[#191f28] group-hover:text-[#3182f6] transition-colors truncate">
                  {displayName}
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e8f3ff] text-[#3182f6]">
                  구글 연동
                </span>
              </div>
              <p className="text-[12px] font-medium text-[#4e5968] truncate mt-0.5">
                @{username}
              </p>
              <p className="text-[11px] text-[#8b95a1] truncate">
                {email}
              </p>
            </div>
            {isNavigatingProfile ? (
              <Loader2 className="w-4 h-4 text-[#3182f6] animate-spin shrink-0" />
            ) : (
              <ExternalLink className="w-4 h-4 text-[#8b95a1] group-hover:text-[#3182f6] transition-colors shrink-0" />
            )}
          </button>

          {/* 2. 등록된 링크 통계 요약 섹션 (클릭 시 /stats 페이지로 이동) */}
          <Link
            href="/stats"
            onClick={() => setIsOpen(false)}
            className="my-2 p-2.5 rounded-[14px] bg-[#f0f6ff]/70 hover:bg-[#e8f3ff] border border-[#d6e6fe] flex items-center justify-between text-[12px] transition-colors cursor-pointer group"
            title="통계 분석 페이지로 이동"
          >
            <div className="flex items-center gap-1.5 text-[#1b64da] font-medium">
              <BarChart2 className="w-3.5 h-3.5" />
              <span className="font-semibold">링크 통계 분석</span>
            </div>
            <div className="flex items-center gap-1 text-[#3182f6] font-semibold text-[11px]">
              <span>총 {totalLinks}개</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* 3. 편의 액션 메뉴 항목들 */}
          <div className="flex flex-col gap-0.5 py-1">
            {/* 통계 페이지 바로가기 */}
            <Link
              href="/stats"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] text-[13px] font-semibold text-[#191f28] hover:bg-[#f2f4f6] active:scale-[0.99] transition-all cursor-pointer text-left"
            >
              <BarChart2 className="w-4 h-4 text-[#3182f6]" />
              <div className="flex items-center justify-between flex-1">
                <span>링크 클릭 통계</span>
                <span className="text-[11px] font-medium text-[#3182f6] bg-[#e8f3ff] px-1.5 py-0.5 rounded-[6px]">/stats</span>
              </div>
            </Link>

            {/* 개인별 페이지 바로가기 */}
            <Link
              href={profileHref}
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] text-[13px] font-semibold text-[#191f28] hover:bg-[#f2f4f6] active:scale-[0.99] transition-all cursor-pointer text-left"
            >
              <User className="w-4 h-4 text-[#3182f6]" />
              <div className="flex items-center justify-between flex-1">
                <span>내 프로필 페이지</span>
                <span className="text-[11px] font-medium text-[#8b95a1]">/@{username}</span>
              </div>
            </Link>

            {/* 새 링크 추가 */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onAddLinkClick();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] text-[13px] font-semibold text-[#3182f6] hover:bg-[#e8f3ff] active:scale-[0.99] transition-all cursor-pointer text-left"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>새 링크 추가</span>
            </button>

            {/* 내 링크 복사 */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onCopyLink();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] text-[13px] font-medium text-[#333d4b] hover:bg-[#f2f4f6] active:scale-[0.99] transition-all cursor-pointer text-left"
            >
              <Copy className="w-4 h-4 text-[#6b7684]" />
              <span>내 프로필 링크 복사</span>
            </button>

            {/* 프로필 정보 수정 */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onEditProfileClick();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] text-[13px] font-medium text-[#333d4b] hover:bg-[#f2f4f6] active:scale-[0.99] transition-all cursor-pointer text-left"
            >
              <Edit3 className="w-4 h-4 text-[#6b7684]" />
              <span>프로필 정보 수정</span>
            </button>
          </div>

          {/* 4. 하단 로그아웃 */}
          <div className="pt-1 mt-1 border-t border-[#f2f4f6]">
            <button
              type="button"
              disabled={isLoggingOut}
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] text-[13px] font-medium text-[#f04452] hover:bg-[#fff0f0] active:scale-[0.99] transition-all cursor-pointer text-left disabled:opacity-50"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4 text-[#f04452]" />
              )}
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
