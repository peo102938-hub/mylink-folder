"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinkItem } from "@/types/profile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  linkFormSchema,
  type LinkFormValues,
  PRESET_ICONS,
  PRESET_BADGES,
  normalizeUrl,
} from "@/lib/linkValidation";
import { Loader2, Pencil, X } from "lucide-react";

interface InlineEditLinkCardProps {
  link: LinkItem;
  onSave: (id: string, updated: Partial<LinkItem>) => Promise<void>;
  onCancel: () => void;
  onShowToast: (message: string) => void;
}

export function InlineEditLinkCard({
  link,
  onSave,
  onCancel,
  onShowToast,
}: InlineEditLinkCardProps) {
  const isPresetBadge = link.badge ? PRESET_BADGES.includes(link.badge) : false;
  const [isCustomBadge, setIsCustomBadge] = useState<boolean>(
    Boolean(link.badge && !isPresetBadge)
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      title: link.title || "",
      url: link.url || "",
      subtitle: link.subtitle || "",
      icon: link.icon || "🔗",
      badge: link.badge || null,
    },
    mode: "onTouched",
  });

  const currentIcon = watch("icon");
  const currentBadge = watch("badge");

  const onSubmit = async (values: LinkFormValues) => {
    const normalizedUrl = normalizeUrl(values.url);

    try {
      await onSave(link.id, {
        title: values.title.trim(),
        url: normalizedUrl,
        subtitle: values.subtitle?.trim() || "",
        icon: values.icon.trim() || "🔗",
        badge: values.badge?.trim() || null,
        isActive: link.isActive ?? true,
      });

      onShowToast("링크를 수정했어요");
      onCancel();
    } catch (error) {
      console.error("링크 수정 중 오류가 발생했습니다:", error);
      onShowToast("링크 수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <Card className="rounded-[20px] border-2 border-[#3182f6] bg-white p-4 sm:p-5 shadow-[0_6px_24px_rgba(49,130,246,0.14)] transition-all">
      {/* 편집 모드 상단 헤더 */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#f2f4f6]">
        <div className="flex items-center gap-1.5 text-[#3182f6]">
          <Pencil className="w-4 h-4 stroke-[2.2]" />
          <span className="text-[14px] font-bold">링크 수정</span>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 rounded-full text-[#8b95a1] hover:text-[#191f28] hover:bg-[#f2f4f6] transition-colors cursor-pointer"
          aria-label="수정 취소"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* 1. 아이콘 선택 */}
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-semibold text-[#333d4b]">
            아이콘
          </label>
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-[14px] bg-[#f2f4f6] border border-[#e5e8eb] shrink-0 text-xl shadow-2xs">
              <span>{currentIcon || "🔗"}</span>
            </div>
            <div className="flex-1">
              <input
                type="text"
                {...register("icon")}
                placeholder="직접 이모지 입력"
                className="w-full h-10 px-3 rounded-[12px] border border-[#e5e8eb] bg-[#f9fafb] text-[13px] text-[#191f28] placeholder-[#8b95a1] focus:bg-white focus:border-[#3182f6] focus:outline-none transition-all"
                maxLength={4}
              />
            </div>
          </div>

          {/* 추천 이모지 칩 */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {PRESET_ICONS.map((preset) => {
              const isSelected = currentIcon === preset.icon;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() =>
                    setValue("icon", preset.icon, { shouldValidate: true })
                  }
                  title={preset.label}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[10px] text-[12px] transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#3182f6] text-white font-medium shadow-xs"
                      : "bg-[#f2f4f6] text-[#4e5968] hover:bg-[#e5e8eb]"
                  }`}
                >
                  <span>{preset.icon}</span>
                  <span className="text-[11px]">{preset.label}</span>
                </button>
              );
            })}
          </div>
          {errors.icon && (
            <span className="text-[11px] text-[#f04452] font-medium">
              {errors.icon.message}
            </span>
          )}
        </div>

        {/* 2. 링크 제목 (필수) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor={`edit-title-${link.id}`}
              className="text-[13px] font-semibold text-[#333d4b] shrink-0 whitespace-nowrap"
            >
              링크 제목 <span className="text-[#f04452]">*</span>
            </label>
            {errors.title && (
              <span className="text-[11px] text-[#f04452] font-medium text-right shrink-0 whitespace-nowrap">
                {errors.title.message}
              </span>
            )}
          </div>
          <input
            id={`edit-title-${link.id}`}
            type="text"
            {...register("title")}
            placeholder="예: 포트폴리오, 기술 블로그"
            className={`w-full h-10 px-3.5 rounded-[12px] border text-[14px] text-[#191f28] placeholder-[#8b95a1] bg-[#f9fafb] focus:bg-white focus:outline-none transition-all ${
              errors.title
                ? "border-[#f04452] focus:border-[#f04452]"
                : "border-[#e5e8eb] focus:border-[#3182f6] focus:ring-2 focus:ring-[#3182f6]/10"
            }`}
          />
        </div>

        {/* 3. 링크 URL (필수) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor={`edit-url-${link.id}`}
              className="text-[13px] font-semibold text-[#333d4b] shrink-0 whitespace-nowrap"
            >
              연결 URL <span className="text-[#f04452]">*</span>
            </label>
            {errors.url && (
              <span className="text-[11px] text-[#f04452] font-medium text-right shrink-0 whitespace-nowrap">
                {errors.url.message}
              </span>
            )}
          </div>
          <input
            id={`edit-url-${link.id}`}
            type="text"
            {...register("url")}
            placeholder="예: https://velog.io/@username 또는 myblog.com"
            className={`w-full h-10 px-3.5 rounded-[12px] border text-[14px] text-[#191f28] placeholder-[#8b95a1] bg-[#f9fafb] focus:bg-white focus:outline-none transition-all ${
              errors.url
                ? "border-[#f04452] focus:border-[#f04452]"
                : "border-[#e5e8eb] focus:border-[#3182f6] focus:ring-2 focus:ring-[#3182f6]/10"
            }`}
          />
        </div>

        {/* 4. 보조 설명 (선택) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor={`edit-subtitle-${link.id}`}
              className="text-[13px] font-semibold text-[#333d4b] shrink-0 whitespace-nowrap"
            >
              보조 설명{" "}
              <span className="text-[11px] font-normal text-[#8b95a1]">
                (선택)
              </span>
            </label>
            {errors.subtitle && (
              <span className="text-[11px] text-[#f04452] font-medium text-right shrink-0 whitespace-nowrap">
                {errors.subtitle.message}
              </span>
            )}
          </div>
          <input
            id={`edit-subtitle-${link.id}`}
            type="text"
            {...register("subtitle")}
            placeholder="예: 진행했던 주요 프로젝트와 작업물이에요"
            className="w-full h-10 px-3.5 rounded-[12px] border border-[#e5e8eb] text-[14px] text-[#191f28] placeholder-[#8b95a1] bg-[#f9fafb] focus:bg-white focus:border-[#3182f6] focus:ring-2 focus:ring-[#3182f6]/10 focus:outline-none transition-all"
          />
        </div>

        {/* 5. 강조 뱃지 (선택) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-[13px] font-semibold text-[#333d4b] shrink-0 whitespace-nowrap">
              강조 뱃지{" "}
              <span className="text-[11px] font-normal text-[#8b95a1]">
                (선택)
              </span>
            </label>
            {errors.badge && (
              <span className="text-[11px] text-[#f04452] font-medium text-right shrink-0 whitespace-nowrap">
                {errors.badge.message}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setValue("badge", null, { shouldValidate: true });
                setIsCustomBadge(false);
              }}
              className={`px-3 py-1 rounded-[10px] text-[12px] transition-all cursor-pointer ${
                !isCustomBadge && !currentBadge
                  ? "bg-[#333d4b] text-white font-medium"
                  : "bg-[#f2f4f6] text-[#6b7684] hover:bg-[#e5e8eb]"
              }`}
            >
              없음
            </button>

            {PRESET_BADGES.map((b) => {
              const isSelected = !isCustomBadge && currentBadge === b;
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => {
                    setValue("badge", b, { shouldValidate: true });
                    setIsCustomBadge(false);
                  }}
                  className={`px-3 py-1 rounded-[10px] text-[12px] transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#e8f3ff] text-[#3182f6] font-bold border border-[#3182f6]/30 shadow-xs"
                      : "bg-[#f2f4f6] text-[#4e5968] hover:bg-[#e5e8eb]"
                  }`}
                >
                  {b}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => {
                setIsCustomBadge(true);
                if (PRESET_BADGES.includes(currentBadge || "")) {
                  setValue("badge", "", { shouldValidate: true });
                }
              }}
              className={`px-3 py-1 rounded-[10px] text-[12px] transition-all cursor-pointer ${
                isCustomBadge
                  ? "bg-[#e8f3ff] text-[#3182f6] font-bold border border-[#3182f6]/30"
                  : "bg-[#f2f4f6] text-[#6b7684] hover:bg-[#e5e8eb]"
              }`}
            >
              직접 입력
            </button>
          </div>

          {isCustomBadge && (
            <input
              type="text"
              value={currentBadge || ""}
              onChange={(e) =>
                setValue("badge", e.target.value, { shouldValidate: true })
              }
              placeholder="뱃지 문구 (예: 이벤트, 인기)"
              maxLength={10}
              className="w-full h-9 px-3 rounded-[10px] border border-[#e5e8eb] bg-[#f9fafb] text-[12px] text-[#191f28] placeholder-[#8b95a1] focus:bg-white focus:border-[#3182f6] focus:outline-none transition-all mt-1"
            />
          )}
        </div>

        {/* 액션 버튼들: [취소] [저장] */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f2f4f6]">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-10 px-4 rounded-[12px] text-[13px] font-medium text-[#4e5968] bg-[#f2f4f6] hover:bg-[#e5e8eb] active:scale-[0.98] transition-all cursor-pointer"
          >
            취소
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-10 px-5 rounded-[12px] text-[13px] font-semibold text-white bg-[#3182f6] hover:bg-[#1b64da] disabled:opacity-50 active:scale-[0.98] shadow-sm transition-all cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "저장"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
