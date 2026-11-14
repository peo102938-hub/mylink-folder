"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  MousePointerClick,
  BarChart3,
  TrendingUp,
  Link2,
  Award,
  ExternalLink,
  PieChart as PieChartIcon,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { useProfileStorage } from "@/hooks/useProfileStorage";
import { Card } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import { Footer } from "@/components/profile/Footer";

// 차트 색상 팔레트 (Toss Design System 스타일)
const PALETTE = [
  "#3182f6", // Toss Blue
  "#00b569", // Toss Green
  "#ff9b00", // Toss Warm Orange
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#00c4df", // Cyan
  "#6b7684", // Grey
];

const chartConfig = {
  clicks: {
    label: "클릭 수",
    color: "#3182f6",
  },
} satisfies ChartConfig;

export default function StatsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading, refreshLinks } = useProfileStorage();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. 비로그인 시 즉시 홈(/)으로 리다이렉트
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  // 링크 목록 및 통계 데이터 계산
  const links = useMemo(() => data?.links || [], [data?.links]);

  const { totalClicks, activeLinksCount, avgClicks, topLink, sortedLinks } =
    useMemo(() => {
      const total = links.reduce((sum, l) => sum + (l.clickCount ?? 0), 0);
      const active = links.filter((l) => l.isActive).length;
      const avg = links.length > 0 ? (total / links.length).toFixed(1) : "0";

      // 클릭 수 기준 내림차순 정렬
      const sorted = [...links].sort(
        (a, b) => (b.clickCount ?? 0) - (a.clickCount ?? 0)
      );
      const top = sorted[0]?.clickCount ? sorted[0] : null;

      return {
        totalClicks: total,
        activeLinksCount: active,
        avgClicks: avg,
        topLink: top,
        sortedLinks: sorted,
      };
    }, [links]);

  // 바 차트용 데이터
  const barChartData = useMemo(() => {
    return links.map((link) => {
      const shortTitle =
        link.title.length > 7 ? `${link.title.slice(0, 7)}…` : link.title;
      return {
        title: shortTitle,
        fullName: link.title,
        clicks: link.clickCount ?? 0,
        icon: link.icon,
      };
    });
  }, [links]);

  // 파이/도넛 차트용 데이터 (클릭 수가 1 이상인 링크만)
  const pieChartData = useMemo(() => {
    return links
      .filter((l) => (l.clickCount ?? 0) > 0)
      .map((link, index) => ({
        name: link.title,
        value: link.clickCount ?? 0,
        fill: PALETTE[index % PALETTE.length],
      }));
  }, [links]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await refreshLinks();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // 로딩 상태이거나 비로그인 리다이렉트 대기 중일 때 스켈레톤 표시
  if (authLoading || (!user && !data) || (isLoading && !data)) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex flex-col items-center">
        <div className="w-full max-w-lg px-5 pt-8">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  // 비로그인 사용자 방어
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#191f28] flex flex-col items-center">
      {/* 1. 상단 고정 네비게이션 바 */}
      <header className="sticky top-0 z-30 w-full max-w-lg bg-[#f9fafb]/90 backdrop-blur-md border-b border-[#e5e8eb] px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="p-2 -ml-2 rounded-xl text-[#4e5968] hover:text-[#191f28] hover:bg-[#f2f4f6] active:scale-95 transition-all"
            aria-label="홈으로 돌아가기"
            title="홈으로 돌아가기"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </Link>
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-[#3182f6]" />
            <h1 className="text-[17px] font-bold tracking-tight text-[#191f28]">
              링크 통계
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-xl text-[#8b95a1] hover:text-[#3182f6] hover:bg-[#e8f3ff] active:scale-95 transition-all cursor-pointer"
          aria-label="데이터 새로고침"
          title="새로고침"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#3182f6]" : ""}`}
          />
        </button>
      </header>

      {/* 2. 메인 통계 콘텐츠 */}
      <main className="w-full max-w-lg px-5 pt-6 pb-12 flex flex-col gap-4">
        {/* 총 클릭 수 히어로 KPI 카드 */}
        <Card className="rounded-[24px] border border-[#e5e8eb] bg-white p-5 sm:p-6 shadow-[0_4px_16px_rgba(25,31,40,0.04)] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-[#8b95a1] uppercase tracking-wider flex items-center gap-1.5">
              <MousePointerClick className="w-4 h-4 text-[#3182f6]" />
              전체 링크 총 클릭 수
            </span>
            <span className="text-[11px] font-semibold text-[#3182f6] bg-[#e8f3ff] px-2.5 py-0.5 rounded-full">
              실시간 집계
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-[36px] sm:text-[40px] font-extrabold tracking-tight text-[#191f28]">
              {totalClicks.toLocaleString()}
            </span>
            <span className="text-[16px] font-semibold text-[#8b95a1]">회</span>
          </div>

          {/* 서브 KPI 그리드 */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#f2f4f6]">
            <div className="flex flex-col">
              <span className="text-[11px] text-[#8b95a1] font-medium">등록 링크</span>
              <span className="text-[15px] font-bold text-[#333d4b] mt-0.5">
                {links.length}개
                <span className="text-[11px] font-normal text-[#8b95a1] ml-1">
                  (공개 {activeLinksCount})
                </span>
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] text-[#8b95a1] font-medium">링크당 평균</span>
              <span className="text-[15px] font-bold text-[#333d4b] mt-0.5">
                {avgClicks}회
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] text-[#8b95a1] font-medium">최다 클릭 링크</span>
              <span className="text-[13px] font-bold text-[#3182f6] truncate mt-0.5">
                {topLink ? `${topLink.icon} ${topLink.title}` : "-"}
              </span>
            </div>
          </div>
        </Card>

        {/* 링크가 전혀 없는 경우 */}
        {links.length === 0 ? (
          <Card className="rounded-[20px] border border-dashed border-[#d1d6db] bg-white/60 p-8 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#f2f4f6] flex items-center justify-center text-[#8b95a1]">
              <Link2 className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#333d4b]">
                등록된 링크가 아직 없어요
              </p>
              <p className="text-[13px] text-[#8b95a1] mt-0.5">
                홈에서 링크를 추가하면 이곳에서 클릭 통계를 볼 수 있어요.
              </p>
            </div>
            <Link
              href="/"
              className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-[12px] text-[13px] font-semibold text-white bg-[#3182f6] hover:bg-[#1b64da] active:scale-95 transition-all shadow-xs"
            >
              링크 관리하러 가기
            </Link>
          </Card>
        ) : (
          <>
            {/* 차트 1: 링크별 클릭 수 막대 차트 (shadcn ChartContainer) */}
            <Card className="rounded-[24px] border border-[#e5e8eb] bg-white p-5 sm:p-6 shadow-[0_4px_16px_rgba(25,31,40,0.04)] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-[#3182f6]" />
                  <h2 className="text-[15px] font-bold text-[#191f28]">
                    링크별 클릭 수
                  </h2>
                </div>
                <span className="text-[12px] text-[#8b95a1]">
                  막대에 마우스를 올려보세요
                </span>
              </div>

              <div className="pt-2">
                <ChartContainer config={chartConfig} className="h-64 w-full">
                  <BarChart
                    data={barChartData}
                    margin={{ top: 12, right: 8, left: -20, bottom: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f2f4f6"
                    />
                    <XAxis
                      dataKey="title"
                      tickLine={false}
                      axisLine={{ stroke: "#e5e8eb" }}
                      tick={{ fill: "#6b7684", fontSize: 12 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#8b95a1", fontSize: 11 }}
                    />
                    <ChartTooltip
                      cursor={{ fill: "rgba(49, 130, 246, 0.06)" }}
                      content={
                        <ChartTooltipContent
                          labelKey="fullName"
                          formatter={(value, name, item) => (
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">
                                {item.payload.icon}
                              </span>
                              <span className="font-semibold text-[#191f28]">
                                {value}회 클릭
                              </span>
                            </div>
                          )}
                        />
                      }
                    />
                    <Bar
                      dataKey="clicks"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={48}
                    >
                      {barChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.clicks > 0
                              ? "#3182f6"
                              : "#e5e8eb"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
            </Card>

            {/* 차트 2: 클릭 점유율 도넛 차트 (1회 이상 클릭이 있을 때) */}
            {pieChartData.length > 0 && (
              <Card className="rounded-[24px] border border-[#e5e8eb] bg-white p-5 sm:p-6 shadow-[0_4px_16px_rgba(25,31,40,0.04)] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <PieChartIcon className="w-4 h-4 text-[#3182f6]" />
                    <h2 className="text-[15px] font-bold text-[#191f28]">
                      클릭 점유율
                    </h2>
                  </div>
                  <span className="text-[12px] text-[#8b95a1]">
                    상위 비중 분석
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                  <ChartContainer
                    config={chartConfig}
                    className="h-52 w-52 shrink-0"
                  >
                    <PieChart>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => (
                              <span className="font-semibold text-[#191f28]">
                                {value}회 (
                                {(
                                  ((value as number) / totalClicks) *
                                  100
                                ).toFixed(1)}
                                %)
                              </span>
                            )}
                          />
                        }
                      />
                      <Pie
                        data={pieChartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`pie-cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>

                  {/* 범례 리스트 */}
                  <div className="flex flex-col gap-2 flex-1 w-full justify-center">
                    {pieChartData.slice(0, 5).map((entry, index) => {
                      const percent = (
                        (entry.value / totalClicks) *
                        100
                      ).toFixed(1);
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between text-[13px]"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: entry.fill }}
                            />
                            <span className="text-[#333d4b] font-medium truncate">
                              {entry.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-bold text-[#191f28]">
                              {percent}%
                            </span>
                            <span className="text-[11px] text-[#8b95a1]">
                              ({entry.value}회)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            )}

            {/* 링크별 클릭 순위 리스트 (Leaderboard) */}
            <Card className="rounded-[24px] border border-[#e5e8eb] bg-white p-5 sm:p-6 shadow-[0_4px_16px_rgba(25,31,40,0.04)] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#3182f6]" />
                  <h2 className="text-[15px] font-bold text-[#191f28]">
                    링크별 상세 순위
                  </h2>
                </div>
                <span className="text-[12px] text-[#8b95a1] font-medium">
                  클릭 수 기준
                </span>
              </div>

              <div className="flex flex-col divide-y divide-[#f2f4f6]">
                {sortedLinks.map((link, idx) => {
                  const clickCount = link.clickCount ?? 0;
                  const percent =
                    totalClicks > 0
                      ? Math.round((clickCount / totalClicks) * 100)
                      : 0;

                  return (
                    <div
                      key={link.id}
                      className="py-3 first:pt-1 last:pb-0 flex items-center justify-between gap-3"
                    >
                      {/* 순위 배지 & 이모지 & 제목 */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span
                          className={`w-6 text-center text-[13px] font-bold shrink-0 ${
                            idx === 0
                              ? "text-[#ff9b00]"
                              : idx === 1
                              ? "text-[#6b7684]"
                              : idx === 2
                              ? "text-[#b0885a]"
                              : "text-[#b0b8c1]"
                          }`}
                        >
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}`}
                        </span>

                        <div className="w-9 h-9 rounded-xl bg-[#f2f4f6] flex items-center justify-center text-lg shrink-0">
                          {link.icon}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-semibold text-[#191f28] truncate">
                              {link.title}
                            </span>
                            {!link.isActive && (
                              <span className="text-[10px] text-[#8b95a1] bg-[#f2f4f6] px-1.5 py-0.5 rounded">
                                비공개
                              </span>
                            )}
                          </div>

                          {/* 비율 바 */}
                          <div className="w-full bg-[#f2f4f6] rounded-full h-1.5 mt-1.5 overflow-hidden">
                            <div
                              className="bg-[#3182f6] h-full rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 클릭 수 */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span className="text-[15px] font-extrabold text-[#191f28]">
                            {clickCount.toLocaleString()}
                          </span>
                          <span className="text-[11px] text-[#8b95a1] ml-0.5">회</span>
                          <p className="text-[10px] text-[#8b95a1]">{percent}%</p>
                        </div>

                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-[#b0b8c1] hover:text-[#3182f6] transition-colors"
                          aria-label={`${link.title} 바로가기`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        )}

        {/* 바텀 푸터 */}
        <Footer />
      </main>
    </div>
  );
}
