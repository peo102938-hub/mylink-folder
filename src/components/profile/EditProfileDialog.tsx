"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUid?: string | null;
  initialData: {
    displayName: string;
    username?: string;
    role?: string;
    bio: string;
  };
  onSave: (updated: {
    displayName: string;
    username: string;
    role: string;
    bio: string;
  }) => Promise<void>;
  onShowToast: (message: string) => void;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  initialData,
  onSave,
  onShowToast,
}: EditProfileDialogProps) {
  const [displayName, setDisplayName] = useState(initialData.displayName || "");
  const [role, setRole] = useState(initialData.role || "");
  const [bio, setBio] = useState(initialData.bio || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 사용자 아이디(username)는 고유 식별자로서 수정 불가
  const username = initialData.username || "";

  useEffect(() => {
    if (open) {
      setDisplayName(initialData.displayName || "");
      setRole(initialData.role || "");
      setBio(initialData.bio || "");
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedDisplayName = displayName.trim();
    const trimmedBio = bio.trim();

    if (!trimmedDisplayName) {
      onShowToast("표시 이름을 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      // users/{userId}/profile 저장 (username은 기존 고유값 유지)
      await onSave({
        displayName: trimmedDisplayName,
        username,
        role: role.trim() || "Creator",
        bio: trimmedBio,
      });

      onShowToast("프로필 정보를 수정했어요");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      onShowToast("프로필 수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-md">
        <DialogHeader>
          <DialogTitle>프로필 정보 수정</DialogTitle>
          <DialogDescription>
            내 프로필 페이지와 공유 링크에 노출될 정보를 수정합니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {/* 1. 표시 이름 (displayName) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-semibold text-[#333d4b]">
                표시 이름 <span className="text-[#f04452]">*</span>
              </label>
              <span className="text-[11px] text-[#8b95a1]">기본값: 구글 이름</span>
            </div>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="예: 홍길동"
              required
              className="w-full h-11 px-3.5 rounded-[14px] border border-[#e5e8eb] bg-[#f9fafb] text-[14px] text-[#191f28] placeholder-[#8b95a1] focus:bg-white focus:border-[#3182f6] focus:outline-none transition-all"
            />
          </div>

          {/* 2. 사용자 아이디 (username - 고유 식별자, 수정 불가) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-semibold text-[#333d4b] flex items-center gap-1.5">
                <span>사용자 아이디 (username)</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#8b95a1] bg-[#f2f4f6] px-1.5 py-0.5 rounded-[5px]">
                  <Lock className="w-3 h-3 text-[#8b95a1]" />
                  수정 불가
                </span>
              </label>
              <span className="text-[11px] text-[#8b95a1]">개인 링크 주소</span>
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#8b95a1] text-[14px] font-medium select-none">
                @
              </span>
              <input
                type="text"
                value={username}
                readOnly
                disabled
                className="w-full h-11 pl-8 pr-3.5 rounded-[14px] border border-[#e5e8eb] bg-[#f2f4f6] text-[14px] text-[#6b7684] cursor-not-allowed select-none focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-[#8b95a1]">
              아이디(username)는 고유 주소로 사용되어 수정할 수 없습니다.
            </p>
          </div>

          {/* 3. 소개글 (bio) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#333d4b]">
              소개글 (bio)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="나를 소개하는 소개글을 적어보세요."
              rows={3}
              className="w-full p-3 rounded-[14px] border border-[#e5e8eb] bg-[#f9fafb] text-[14px] text-[#191f28] placeholder-[#8b95a1] focus:bg-white focus:border-[#3182f6] focus:outline-none transition-all resize-none leading-relaxed"
            />
          </div>

          <DialogFooter className="mt-4 gap-2 sm:gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              className="h-11 px-4 rounded-[14px] text-[14px] font-medium text-[#4e5968] bg-[#f2f4f6] hover:bg-[#e5e8eb] active:scale-[0.98] transition-all cursor-pointer"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-6 rounded-[14px] text-[14px] font-semibold text-white bg-[#3182f6] hover:bg-[#1b64da] disabled:opacity-50 active:scale-[0.98] shadow-sm transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "저장하기"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
