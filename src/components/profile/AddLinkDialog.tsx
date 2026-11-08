"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinkItem } from "@/types/profile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import {
  linkFormSchema,
  type LinkFormValues,
  PRESET_ICONS,
  PRESET_BADGES,
  normalizeUrl,
} from "@/lib/linkValidation";

// 하위 호환성을 위해 스키마 및 타입 재내보내기
export { linkFormSchema, type LinkFormValues };

interface AddLinkDialogProps {
  onAddLink: (link: Omit<LinkItem, "id">) => Promise<LinkItem | void> | void;
  onShowToast: (message: string) => void;
  triggerButton?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddLinkDialog({
  onAddLink,
  onShowToast,
  triggerButton,
  isOpen: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: AddLinkDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const [isCustomBadge, setIsCustomBadge] = useState(false);

  // 2. React Hook Form 연동 (Zod Resolver 사용)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      title: "",
      url: "",
      subtitle: "",
      icon: "🔗",
      badge: null,
    },
    mode: "onTouched",
  });

  const currentIcon = watch("icon");
  const currentBadge = watch("badge");

  const handleOpenChange = (nextOpen: boolean) => {
    if (isControlled && controlledOnOpenChange) {
      controlledOnOpenChange(nextOpen);
    } else {
      setInternalOpen(nextOpen);
    }
    if (!nextOpen) {
      reset();
      setIsCustomBadge(false);
    }
  };

  const onSubmit = async (values: LinkFormValues) => {
    const normalizedUrl = normalizeUrl(values.url);

    try {
      await onAddLink({
        title: values.title.trim(),
        url: normalizedUrl,
        subtitle: values.subtitle?.trim() || "",
        icon: values.icon.trim() || "🔗",
        badge: values.badge?.trim() || null,
        isActive: true,
      });

      onShowToast("새 링크를 추가했어요");
      handleOpenChange(false);
    } catch (error) {
      console.error("링크 추가 중 오류가 발생했습니다:", error);
      onShowToast("링크 저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {triggerButton !== null && (
        <DialogTrigger
          render={
            triggerButton ? (
              <>{triggerButton}</>
            ) : (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold text-[#3182f6] bg-[#e8f3ff] hover:bg-[#d5e8ff] active:scale-95 transition-all cursor-pointer"
                aria-label="새 링크 추가하기"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>링크 추가</span>
              </button>
            )
          }
        />
      )}

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 링크 추가</DialogTitle>
          <DialogDescription>
            프로필 페이지에 보여줄 새로운 링크 카드를 등록합니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
          {/* 1. 아이콘 선택 */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold text-[#333d4b]">
              아이콘
            </label>
            <div className="flex items-center gap-3">
              {/* 현재 아이콘 미리보기 */}
              <div className="relative flex items-center justify-center w-12 h-12 rounded-[16px] bg-[#f2f4f6] border border-[#e5e8eb] shrink-0 text-2xl shadow-xs">
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

            {/* 빠른 추천 이모지 칩 */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PRESET_ICONS.map((preset) => {
                const isSelected = currentIcon === preset.icon;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setValue("icon", preset.icon, { shouldValidate: true })}
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
                htmlFor="link-title"
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
              id="link-title"
              type="text"
              {...register("title")}
              placeholder="예: 포트폴리오, 기술 블로그"
              className={`w-full h-11 px-3.5 rounded-[14px] border text-[14px] text-[#191f28] placeholder-[#8b95a1] bg-[#f9fafb] focus:bg-white focus:outline-none transition-all ${
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
                htmlFor="link-url"
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
              id="link-url"
              type="text"
              {...register("url")}
              placeholder="예: https://velog.io/@username 또는 myblog.com"
              className={`w-full h-11 px-3.5 rounded-[14px] border text-[14px] text-[#191f28] placeholder-[#8b95a1] bg-[#f9fafb] focus:bg-white focus:outline-none transition-all ${
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
                htmlFor="link-subtitle"
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
              id="link-subtitle"
              type="text"
              {...register("subtitle")}
              placeholder="예: 진행했던 주요 프로젝트와 작업물이에요"
              className="w-full h-11 px-3.5 rounded-[14px] border border-[#e5e8eb] text-[14px] text-[#191f28] placeholder-[#8b95a1] bg-[#f9fafb] focus:bg-white focus:border-[#3182f6] focus:ring-2 focus:ring-[#3182f6]/10 focus:outline-none transition-all"
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

          {/* 다이얼로그 액션 버튼들 */}
          <DialogFooter className="mt-4 gap-2 sm:gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleOpenChange(false)}
              className="h-11 px-4 rounded-[14px] text-[14px] font-medium text-[#4e5968] bg-[#f2f4f6] hover:bg-[#e5e8eb] active:scale-[0.98] transition-all cursor-pointer"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-6 rounded-[14px] text-[14px] font-semibold text-white bg-[#3182f6] hover:bg-[#1b64da] disabled:opacity-50 active:scale-[0.98] shadow-sm transition-all cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "추가하기"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
