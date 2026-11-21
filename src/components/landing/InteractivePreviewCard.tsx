"use client";

import { useState } from "react";
import { CheckCircle2, ExternalLink, Sparkles, TrendingUp, Laptop, Palette, Rocket } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PreviewProfile {
  id: "dev" | "design" | "creator";
  label: string;
  icon: typeof Laptop;
  displayName: string;
  username: string;
  role: string;
  bio: string;
  avatarText: string;
  badgeColor: string;
  links: Array<{
    title: string;
    description: string;
    tag: string;
    clicks: number;
    iconColor: string;
  }>;
  stacks: string[];
}

const PREVIEW_PROFILES: Record<string, PreviewProfile> = {
  dev: {
    id: "dev",
    label: "개발자",
    icon: Laptop,
    displayName: "김토스",
    username: "toss_kim",
    role: "Frontend Engineer",
    bio: "복잡한 세상을 단순하게 만드는 사용자 경험에 몰입합니다. 오픈소스와 클린코드를 사랑해요.",
    avatarText: "토스",
    badgeColor: "bg-[#e8f3ff] text-[#3182f6]",
    links: [
      {
        title: "GitHub / toss-frontend",
        description: "최신 React, Next.js 오픈소스 프로젝트",
        tag: "오픈소스",
        clicks: 1420,
        iconColor: "bg-[#191f28] text-white",
      },
      {
        title: "기술 블로그: 토스 엔지니어링",
        description: "웹 성능 최적화와 대규모 프론트엔드 아키텍처",
        tag: "인기글",
        clicks: 890,
        iconColor: "bg-[#3182f6] text-white",
      },
      {
        title: "2026 포트폴리오 & 이력서",
        description: "프로젝트 상세 내역 및 경력 기술서 (PDF)",
        tag: "이력서",
        clicks: 530,
        iconColor: "bg-[#00b569] text-white",
      },
    ],
    stacks: ["React 19", "Next.js", "TypeScript", "Tailwind CSS"],
  },
  design: {
    id: "design",
    label: "디자이너",
    icon: Palette,
    displayName: "이지은",
    username: "jieun_ux",
    role: "Product Designer",
    bio: "데이터와 감성을 잇는 직관적인 프로덕트를 만듭니다. 디자인 시스템(TDS)과 마이크로 인터랙션을 탐구합니다.",
    avatarText: "지은",
    badgeColor: "bg-[#fff0d6] text-[#ff9b00]",
    links: [
      {
        title: "Behance Design Case Study",
        description: "금융 앱 리디자인 & 디자인 시스템 구축기",
        tag: "대표작",
        clicks: 1250,
        iconColor: "bg-[#053eff] text-white",
      },
      {
        title: "Figma Community Resources",
        description: "무료 모바일 UI 컴포넌트 킷 & 아이콘 팩",
        tag: "템플릿",
        clicks: 980,
        iconColor: "bg-[#f24e1e] text-white",
      },
      {
        title: "Dribbble Daily UI Shots",
        description: "매주 연재하는 감각적인 인터랙션 모션",
        tag: "쇼케이스",
        clicks: 410,
        iconColor: "bg-[#ea4c89] text-white",
      },
    ],
    stacks: ["Figma", "Design System", "Prototyping", "UI/UX"],
  },
  creator: {
    id: "creator",
    label: "크리에이터",
    icon: Rocket,
    displayName: "박수현",
    username: "suhyun_life",
    role: "Tech Creator & Writer",
    bio: "테크 트렌드와 생산성 도구를 쉽고 재미있게 소개합니다. 10만 구독자와 함께 성장하고 있어요.",
    avatarText: "수현",
    badgeColor: "bg-[#f5e8ff] text-[#8b5cf6]",
    links: [
      {
        title: "YouTube: 수현의 테크 라이프",
        description: "생산성 200% 올려주는 필수 개발 도구 TOP 5",
        tag: "최신영상",
        clicks: 3410,
        iconColor: "bg-[#ff0000] text-white",
      },
      {
        title: "주간 생산성 뉴스레터 구독",
        description: "매주 월요일 아침 배달되는 유용한 IT 인사이트",
        tag: "무료구독",
        clicks: 2150,
        iconColor: "bg-[#ff9b00] text-white",
      },
      {
        title: "Notion 템플릿 & 업무 가이드북",
        description: "목표 달성과 시간 관리를 위한 올인원 대시보드",
        tag: "인기자료",
        clicks: 1120,
        iconColor: "bg-[#191f28] text-white",
      },
    ],
    stacks: ["YouTube", "Newsletter", "Notion", "Community"],
  },
};

interface InteractivePreviewCardProps {
  onShowToast: (message: string) => void;
}

export function InteractivePreviewCard({ onShowToast }: InteractivePreviewCardProps) {
  const [activeTab, setActiveTab] = useState<"dev" | "design" | "creator">("dev");
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({});

  const currentProfile = PREVIEW_PROFILES[activeTab];

  const handleLinkClick = (title: string) => {
    setClickCounts((prev) => {
      const current = prev[title] || 0;
      return { ...prev, [title]: current + 1 };
    });
    onShowToast(`🎉 '${title}' 클릭! 실시간 방문자 수 +1 집계`);
  };

  return (
    <Card className="rounded-[28px] border border-[#e5e8eb] bg-white p-5 sm:p-6 shadow-[0_4px_16px_rgba(25,31,40,0.04)] flex flex-col justify-between transition-all duration-300">
      <div>
        {/* 상단 헤더 & 모드 전환 탭 */}
        <div className="flex items-center justify-between pb-4 border-b border-[#f2f4f6] mb-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00b569] animate-pulse" />
            <span className="text-[12px] font-bold text-[#4e5968] tracking-tight">
              실시간 프리뷰 시뮬레이터
            </span>
          </div>
          <span className="text-[11px] font-medium text-[#8b95a1] bg-[#f2f4f6] px-2 py-0.5 rounded-full">
            체험 모드
          </span>
        </div>

        {/* 페르소나 선택 탭 버튼 그룹 */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#f2f4f6] rounded-2xl mb-5">
          {(Object.values(PREVIEW_PROFILES) as PreviewProfile[]).map((profile) => {
            const Icon = profile.icon;
            const isActive = activeTab === profile.id;
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => setActiveTab(profile.id)}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-[#191f28] shadow-xs scale-[1.02]"
                    : "text-[#6b7684] hover:text-[#191f28] hover:bg-white/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#3182f6]" : ""}`} />
                <span>{profile.label}</span>
              </button>
            );
          })}
        </div>

        {/* 프로필 헤더 카드 영역 */}
        <div className="rounded-[20px] bg-[#f9fafb] border border-[#e5e8eb]/70 p-4 mb-4 transition-all">
          <div className="flex items-center gap-3">
            <div
              className={`w-13 h-13 rounded-full flex items-center justify-center font-bold text-lg shrink-0 shadow-xs border border-white/60 ${currentProfile.badgeColor}`}
            >
              {currentProfile.avatarText}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-[16px] font-bold text-[#191f28] truncate">
                  {currentProfile.displayName}
                </h3>
                <span className="text-[13px] font-medium text-[#8b95a1]">
                  @{currentProfile.username}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3182f6] shrink-0" />
              </div>
              <p className="text-[13px] text-[#4e5968] font-medium mt-0.5 truncate">
                {currentProfile.role}
              </p>
            </div>
          </div>

          <p className="text-[12.5px] leading-relaxed text-[#4e5968] mt-3 pt-3 border-t border-[#e5e8eb]/50">
            {currentProfile.bio}
          </p>

          {/* 태그 칩 */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {currentProfile.stacks.map((stack) => (
              <span
                key={stack}
                className="text-[11px] font-medium text-[#4e5968] bg-white border border-[#e5e8eb] px-2 py-0.5 rounded-lg"
              >
                {stack}
              </span>
            ))}
          </div>
        </div>

        {/* 인터랙티브 링크 리스트 */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[12px] font-bold text-[#8b95a1] uppercase tracking-wider">
              링크를 클릭해보세요
            </span>
            <span className="text-[11px] text-[#3182f6] font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              실시간 클릭 집계 시뮬레이션
            </span>
          </div>

          {currentProfile.links.map((link) => {
            const extraClicks = clickCounts[link.title] || 0;
            const totalClicks = link.clicks + extraClicks;

            return (
              <div
                key={link.title}
                onClick={() => handleLinkClick(link.title)}
                className="group relative rounded-[18px] bg-white border border-[#e5e8eb] p-3.5 flex items-center justify-between hover:border-[#3182f6] hover:shadow-xs active:scale-[0.99] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-[12px] font-bold shadow-2xs ${link.iconColor}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[14px] font-bold text-[#191f28] group-hover:text-[#3182f6] transition-colors truncate">
                        {link.title}
                      </h4>
                      <span className="text-[10px] font-semibold text-[#3182f6] bg-[#e8f3ff] px-1.5 py-0.5 rounded-md shrink-0">
                        {link.tag}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#6b7684] truncate mt-0.5">
                      {link.description}
                    </p>
                  </div>
                </div>

                {/* 클릭 수 배지 */}
                <div className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-[#8b95a1] bg-[#f9fafb] px-2 py-1 rounded-xl border border-[#e5e8eb]">
                  <Sparkles className="w-3 h-3 text-[#ff9b00]" />
                  <span>{totalClicks.toLocaleString()}회</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 하단 캡션 안내 */}
      <div className="mt-4 pt-3 border-t border-[#f2f4f6] flex items-center justify-between text-[12px] text-[#8b95a1]">
        <span>✨ 내 링크도 3초 만에 이렇게 완성돼요</span>
        <span className="font-semibold text-[#3182f6]">100% 무료</span>
      </div>
    </Card>
  );
}
