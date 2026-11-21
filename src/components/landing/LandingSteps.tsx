"use client";

import { LogIn, PlusCircle, Share2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export function LandingSteps() {
  const steps = [
    {
      step: "01",
      title: "Google 원클릭 로그인",
      description: "복잡한 회원가입 절차 없이 사용 중인 구글 계정으로 3초 만에 시작하세요.",
      icon: LogIn,
      iconBg: "bg-[#e8f3ff] text-[#3182f6]",
    },
    {
      step: "02",
      title: "프로필 & 링크 간편 등록",
      description: "닉네임, 한 줄 소개, 대표 링크, 기술 스택을 직관적인 다이얼로그로 추가합니다.",
      icon: PlusCircle,
      iconBg: "bg-[#fff0d6] text-[#ff9b00]",
    },
    {
      step: "03",
      title: "어디에나 링크 공유 & 분석",
      description: "완성된 프로필 링크를 인스타그램, 깃허브, 이력서에 공유하고 클릭 수를 확인하세요.",
      icon: Share2,
      iconBg: "bg-[#e6f8f0] text-[#00b569]",
    },
  ];

  return (
    <section className="w-full flex flex-col gap-4">
      <div className="flex flex-col items-center text-center px-2 mb-1">
        <span className="text-[12px] font-bold text-[#3182f6] tracking-wider uppercase mb-1.5 px-2.5 py-0.5 rounded-full bg-[#f2f4f6]">
          Simple 3 Steps
        </span>
        <h2 className="text-[22px] sm:text-[24px] font-bold text-[#191f28] tracking-tight">
          단 10초 만에 완성하는 나만의 프로필
        </h2>
        <p className="text-[14px] text-[#4e5968] mt-1">
          누구나 쉽고 빠르게 감각적인 프로필 링크를 만들 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.step}
              className="rounded-[28px] border border-[#e5e8eb] bg-white p-6 shadow-[0_4px_16px_rgba(25,31,40,0.04)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs ${item.iconBg}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[18px] font-extrabold text-[#d1d6db] tracking-wider">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-[17px] font-bold text-[#191f28]">
                  {item.title}
                </h3>
                <p className="text-[13.5px] text-[#6b7684] mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#f2f4f6] flex items-center gap-1.5 text-[11.5px] font-semibold text-[#8b95a1]">
                <Sparkles className="w-3.5 h-3.5 text-[#3182f6]" />
                <span>누구나 손쉬운 원클릭</span>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
