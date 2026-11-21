"use client";

import { useState } from "react";
import { BarChart3, Copy, Check, Link2, Sparkles, ShieldCheck, Layers, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { copyToClipboard } from "@/lib/clipboard";

interface LandingFeaturesProps {
  onShowToast: (message: string) => void;
}

export function LandingFeatures({ onShowToast }: LandingFeaturesProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleCopyDemoUrl = async () => {
    const success = await copyToClipboard("https://mylink.io/@toss_kim");
    if (success) {
      setCopiedUrl(true);
      onShowToast("가상의 마이링크 주소가 복사되었습니다!");
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  return (
    <section className="w-full flex flex-col gap-4">
      <div className="flex flex-col items-center text-center px-2 mb-1">
        <span className="text-[12px] font-bold text-[#3182f6] tracking-wider uppercase mb-1.5 px-2.5 py-0.5 rounded-full bg-[#f2f4f6]">
          Key Features
        </span>
        <h2 className="text-[22px] sm:text-[24px] font-bold text-[#191f28] tracking-tight">
          필요한 것만 깔끔하게, 마이링크의 핵심 기능
        </h2>
        <p className="text-[14px] text-[#4e5968] mt-1">
          복잡한 설정 없이 직관적인 UI로 나를 가장 돋보이게 표현하세요.
        </p>
      </div>

      {/* 그리드 레이아웃: 모바일 1열, 데스크탑 2열/3열 반응형 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 카드 1: 실시간 클릭 분석 (통계 차트 그래픽 내장) */}
        <Card className="rounded-[28px] border border-[#e5e8eb] bg-white p-6 shadow-[0_4px_16px_rgba(25,31,40,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#e8f3ff] text-[#3182f6] flex items-center justify-center shadow-xs">
                <BarChart3 className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-semibold text-[#00b569] bg-[#e6f8f0] px-2.5 py-1 rounded-full flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                지난주 대비 +34%
              </span>
            </div>

            <h3 className="text-[18px] font-bold text-[#191f28]">
              실시간 클릭 & 유입 통계 분석
            </h3>
            <p className="text-[14px] text-[#4e5968] mt-1 leading-relaxed">
              어떤 링크가 가장 많은 관심을 받았는지 실시간으로 집계하고 요일별 유입 트렌드를 분석합니다.
            </p>
          </div>

          {/* 미니 차트 시뮬레이션 UI */}
          <div className="mt-5 p-4 rounded-2xl bg-[#f9fafb] border border-[#e5e8eb]">
            <div className="flex items-center justify-between text-[12px] font-medium text-[#8b95a1] mb-3">
              <span>이번 주 링크 총 클릭 수</span>
              <span className="font-bold text-[#191f28] text-[14px]">12,480회</span>
            </div>
            {/* 막대 차트 바 */}
            <div className="flex items-end justify-between gap-2 h-20 pt-2">
              {[
                { day: "월", height: "45%", count: "1,200" },
                { day: "화", height: "60%", count: "1,850" },
                { day: "수", height: "80%", count: "2,400" },
                { day: "목", height: "70%", count: "2,100" },
                { day: "금", height: "95%", count: "3,100", active: true },
                { day: "토", height: "55%", count: "1,600" },
                { day: "일", height: "40%", count: "1,100" },
              ].map((bar) => (
                <div key={bar.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div
                    style={{ height: bar.height }}
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      bar.active ? "bg-[#3182f6]" : "bg-[#d1e6ff] group-hover:bg-[#a6cdfe]"
                    }`}
                  />
                  <span className={`text-[11px] font-medium ${bar.active ? "text-[#3182f6] font-bold" : "text-[#8b95a1]"}`}>
                    {bar.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* 카드 2: 나만의 고유 링크 (@username) */}
        <Card className="rounded-[28px] border border-[#e5e8eb] bg-white p-6 shadow-[0_4px_16px_rgba(25,31,40,0.04)] flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#fff0d6] text-[#ff9b00] flex items-center justify-center shadow-xs mb-4">
              <Link2 className="w-6 h-6" />
            </div>

            <h3 className="text-[18px] font-bold text-[#191f28]">
              심플하고 기억하기 쉬운 고유 주소
            </h3>
            <p className="text-[14px] text-[#4e5968] mt-1 leading-relaxed">
              SNS 바이오, 포트폴리오, 이력서, 명함에 딱 한 줄의 주소만 기재하세요. 언제든 프로필을 자유롭게 업데이트할 수 있습니다.
            </p>
          </div>

          {/* 주소 복사 인터랙션 박스 */}
          <div className="mt-5 p-3.5 rounded-2xl bg-[#f9fafb] border border-[#e5e8eb] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3182f6]" />
              <span className="text-[13px] font-semibold text-[#191f28] truncate">
                mylink.io/@toss_kim
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyDemoUrl}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#e5e8eb] text-[12px] font-semibold text-[#4e5968] hover:text-[#191f28] hover:border-[#b0b8c1] active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              {copiedUrl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#00b569]" />
                  <span className="text-[#00b569]">복사됨</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#8b95a1]" />
                  <span>주소 복사</span>
                </>
              )}
            </button>
          </div>
        </Card>

        {/* 카드 3: 맞춤형 스택 & 소셜 칩 */}
        <Card className="rounded-[28px] border border-[#e5e8eb] bg-white p-6 shadow-[0_4px_16px_rgba(25,31,40,0.04)] flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#f5e8ff] text-[#8b5cf6] flex items-center justify-center shadow-xs mb-4">
              <Layers className="w-6 h-6" />
            </div>

            <h3 className="text-[18px] font-bold text-[#191f28]">
              전문성을 드러내는 스택 & 태그 시스템
            </h3>
            <p className="text-[14px] text-[#4e5968] mt-1 leading-relaxed">
              자신이 다루는 기술 스택과 활동 중인 소셜 채널 뱃지를 원하는 만큼 자유롭게 추가하고 커스텀하세요.
            </p>
          </div>

          {/* 태그 칩 데모 */}
          <div className="mt-5 p-3.5 rounded-2xl bg-[#f9fafb] border border-[#e5e8eb] flex flex-wrap gap-1.5">
            {[
              "React 19",
              "TypeScript",
              "Next.js",
              "Figma",
              "GitHub",
              "YouTube",
              "Velog",
              "LinkedIn",
            ].map((chip) => (
              <span
                key={chip}
                className="text-[12px] font-semibold text-[#333d4b] bg-white border border-[#e5e8eb] px-2.5 py-1 rounded-xl shadow-2xs"
              >
                #{chip}
              </span>
            ))}
          </div>
        </Card>

        {/* 카드 4: 안전한 개인 클라우드 동기화 */}
        <Card className="rounded-[28px] border border-[#e5e8eb] bg-white p-6 shadow-[0_4px_16px_rgba(25,31,40,0.04)] flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#e6f8f0] text-[#00b569] flex items-center justify-center shadow-xs mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="text-[18px] font-bold text-[#191f28]">
              Google 기반의 안전한 개인 저장소
            </h3>
            <p className="text-[14px] text-[#4e5968] mt-1 leading-relaxed">
              별도의 비밀번호 없이 Google 계정 하나로 모든 데이터가 암호화되어 안전한 개인 클라우드에 영구 보관됩니다.
            </p>
          </div>

          <div className="mt-5 p-3.5 rounded-2xl bg-[#f9fafb] border border-[#e5e8eb] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-[#e5e8eb] shrink-0">
              <Sparkles className="w-4 h-4 text-[#3182f6]" />
            </div>
            <div className="text-[12px] text-[#4e5968] leading-tight">
              <span className="font-bold text-[#191f28]">100% 실시간 자동 저장</span>
              <br />
              수정 즉시 내 링크 페이지에 실시간 반영됩니다.
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
