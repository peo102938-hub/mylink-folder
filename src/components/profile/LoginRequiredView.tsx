"use client";

import { useState } from "react";
import { LogIn, ShieldCheck, Zap, Share2, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

interface LoginRequiredViewProps {
  onShowToast: (message: string) => void;
}

export function LoginRequiredView({ onShowToast }: LoginRequiredViewProps) {
  const { signInWithGoogle } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    try {
      setIsLoggingIn(true);
      const user = await signInWithGoogle();
      if (user) {
        onShowToast(`${user.displayName || "사용자"}님 환영합니다!`);
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
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 py-4 animate-in fade-in duration-300">
      {/* 1. 메인 안내 카드 */}
      <Card className="rounded-[28px] border border-[#e5e8eb] bg-white p-7 text-center shadow-[0_4px_16px_rgba(25,31,40,0.04)] flex flex-col items-center">
        {/* 아이콘 배지 */}
        <div className="w-16 h-16 rounded-2xl bg-[#e8f3ff] text-[#3182f6] flex items-center justify-center mb-5 shadow-xs">
          <Sparkles className="w-8 h-8" />
        </div>

        <span className="text-[12px] font-bold text-[#3182f6] tracking-wider uppercase mb-1.5 px-2.5 py-0.5 rounded-full bg-[#f2f4f6]">
          Personalized Link Vault
        </span>

        <h1 className="text-[23px] font-bold text-[#191f28] tracking-tight mb-2">
          나만의 링크를 한곳에서 관리하세요
        </h1>

        <p className="text-[15px] leading-relaxed text-[#4e5968] max-w-sm mb-6">
          마이링크는 <strong>Google 계정</strong>으로 로그인한 뒤 사용할 수 있는 개인 링크 서비스입니다.
          로그인 후 나만의 맞춤 프로필과 링크를 자유롭게 추가하고 편집해보세요.
        </p>

        {/* 대형 구글 로그인 CTA 버튼 */}
        <Button
          type="button"
          size="lg"
          disabled={isLoggingIn}
          onClick={handleLogin}
          className="w-full max-w-sm h-12 rounded-2xl bg-[#3182f6] hover:bg-[#1b64da] text-white font-semibold text-[15px] shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
        >
          {isLoggingIn ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center p-0.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            </div>
          )}
          <span>Google 계정으로 계속하기</span>
        </Button>
      </Card>

      {/* 2. 로그인 시 제공되는 기능 안내 카드 목록 */}
      <div className="flex flex-col gap-3">
        <h2 className="text-[13px] font-bold text-[#8b95a1] px-1 uppercase tracking-wider">
          로그인 후 이용할 수 있는 기능
        </h2>

        {/* Feature 1 */}
        <div className="rounded-[20px] bg-white border border-[#e5e8eb] p-4 flex items-start gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#f2f4f6] text-[#3182f6] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#191f28]">
              나만의 안전한 클라우드 저장소
            </h3>
            <p className="text-[13px] text-[#6b7684] mt-0.5 leading-relaxed">
              모든 링크와 프로필은 로그인한 계정의 안전한 개인 클라우드에 독립적으로 보관됩니다.
            </p>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="rounded-[20px] bg-white border border-[#e5e8eb] p-4 flex items-start gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#f2f4f6] text-[#ff9b00] flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#191f28]">
              실시간 링크 추가 · 수정 · 삭제
            </h3>
            <p className="text-[13px] text-[#6b7684] mt-0.5 leading-relaxed">
              다이얼로그 및 인라인 편집기로 원하는 링크를 손쉽게 등록하고 순서와 배지를 커스텀할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="rounded-[20px] bg-white border border-[#e5e8eb] p-4 flex items-start gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#f2f4f6] text-[#00b06b] flex items-center justify-center shrink-0">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#191f28]">
              구글 프로필 동기화 & 원클릭 공유
            </h3>
            <p className="text-[13px] text-[#6b7684] mt-0.5 leading-relaxed">
              Google 계정 프로필 이미지와 이름을 자동으로 가져와 어디서든 나를 알릴 수 있는 멋진 프로필 페이지를 완성합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
