"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

interface LandingCtaProps {
  onShowToast: (message: string) => void;
}

export function LandingCta({ onShowToast }: LandingCtaProps) {
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
    <Card className="rounded-[28px] border border-[#e5e8eb] bg-white p-7 sm:p-8 text-center shadow-[0_4px_16px_rgba(25,31,40,0.04)] flex flex-col items-center">
      <div className="w-14 h-14 rounded-2xl bg-[#e8f3ff] text-[#3182f6] flex items-center justify-center mb-4 shadow-xs">
        <Sparkles className="w-7 h-7" />
      </div>

      <span className="text-[12px] font-bold text-[#3182f6] tracking-wider uppercase mb-1.5 px-2.5 py-0.5 rounded-full bg-[#f2f4f6]">
        Get Started Now
      </span>

      <h2 className="text-[22px] sm:text-[25px] font-bold text-[#191f28] tracking-tight mb-2">
        지금 바로 나만의 마이링크를 시작하세요
      </h2>

      <p className="text-[14.5px] leading-relaxed text-[#4e5968] max-w-md mb-6">
        복잡한 가입 절차 없이, 평생 무료로 나를 표현하는 가장 세련된 링크를 만들어보세요.
      </p>

      {/* 대형 구글 로그인 CTA 버튼 (히어로 섹션 버튼과 100% 동일) */}
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

      <span className="mt-4 text-[12px] text-[#8b95a1] flex items-center gap-1">
        <span>설정까지 단 10초</span>
        <span>•</span>
        <span>신용카드 등록 없음</span>
      </span>
    </Card>
  );
}
