"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "마이링크는 정말 완전 무료인가요?",
      a: "네, 마이링크는 모든 사용자에게 평생 무료로 제공됩니다. 링크 등록 개수 제한이나 숨겨진 유료 플랜 없이 무제한으로 사용하실 수 있습니다.",
    },
    {
      q: "실시간 클릭 통계는 어떻게 확인하나요?",
      a: "로그인 후 상단 바의 통계 아이콘을 누르면 내 링크별 총 클릭 수, 요일별 방문 트렌드, 가장 인기 있는 링크 순위를 한눈에 확인하실 수 있습니다.",
    },
    {
      q: "링크 주소는 어떤 형태로 생성되나요?",
      a: "프로필 설정에서 원하는 영문 사용자명(@username)을 등록하시면, 간결하고 기억하기 쉬운 고유 주소(예: mylink.io/@yourname)로 전 세계 누구에게나 공유할 수 있습니다.",
    },
    {
      q: "모바일과 PC 모두에서 잘 동작하나요?",
      a: "마이링크는 토스 디자인 시스템(TDS) 철학을 기반으로 완벽한 반응형(Responsive) 웹으로 제작되었습니다. 스마트폰, 태블릿, 데스크탑 모니터 어디서든 최적의 크기와 레이아웃으로 쾌적하게 렌더링됩니다.",
    },
    {
      q: "등록한 데이터는 안전하게 보관되나요?",
      a: "Google의 검증된 Firebase 인프라 및 엄격한 보안 규칙(Firestore Security Rules)을 통해 본인 계정만 데이터를 수정할 수 있도록 철저하게 암호화 및 보호됩니다.",
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="w-full flex flex-col gap-4">
      <div className="flex flex-col items-center text-center px-2 mb-1">
        <span className="text-[12px] font-bold text-[#3182f6] tracking-wider uppercase mb-1.5 px-2.5 py-0.5 rounded-full bg-[#f2f4f6]">
          Frequently Asked Questions
        </span>
        <h2 className="text-[22px] sm:text-[24px] font-bold text-[#191f28] tracking-tight">
          자주 묻는 질문
        </h2>
        <p className="text-[14px] text-[#4e5968] mt-1">
          마이링크에 대해 궁금한 점을 빠르게 확인해보세요.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <Card
              key={faq.q}
              className="rounded-[22px] border border-[#e5e8eb] bg-white overflow-hidden shadow-[0_2px_8px_rgba(25,31,40,0.02)] transition-all"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full px-5 py-4.5 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-[#f9fafb]/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#f2f4f6] text-[#3182f6] flex items-center justify-center shrink-0">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-bold text-[#191f28]">
                    {faq.q}
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-[#8b95a1] transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180 text-[#3182f6]" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-[14px] leading-relaxed text-[#4e5968] border-t border-[#f2f4f6] bg-[#fdfdfe] animate-in fade-in duration-200">
                  <p className="pl-11">{faq.a}</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
