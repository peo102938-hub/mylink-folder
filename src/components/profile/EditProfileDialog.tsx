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
import { Loader2 } from "lucide-react";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: {
    displayName: string;
    username?: string;
    role: string;
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
  const [username, setUsername] = useState(initialData.username || "");
  const [role, setRole] = useState(initialData.role || "");
  const [bio, setBio] = useState(initialData.bio || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setDisplayName(initialData.displayName || "");
      setUsername(initialData.username || "");
      setRole(initialData.role || "");
      setBio(initialData.bio || "");
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      onShowToast("핸들 아이디를 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        displayName: displayName.trim(),
        username: username.trim() || displayName.trim(),
        role: role.trim() || "Creator",
        bio: bio.trim(),
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
            내 프로필 페이지와 링크에 노출될 소개 정보를 수정합니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {/* 1. 이름 (username) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#333d4b]">
              이름 (사용자명)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="예: 홍길동"
              className="w-full h-11 px-3.5 rounded-[14px] border border-[#e5e8eb] bg-[#f9fafb] text-[14px] text-[#191f28] placeholder-[#8b95a1] focus:bg-white focus:border-[#3182f6] focus:outline-none transition-all"
            />
          </div>

          {/* 2. 핸들/아이디 (displayName) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#333d4b]">
              핸들 아이디 <span className="text-[#f04452]">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#8b95a1] text-[14px] font-medium">
                @
              </span>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="peo102938"
                required
                className="w-full h-11 pl-8 pr-3.5 rounded-[14px] border border-[#e5e8eb] bg-[#f9fafb] text-[14px] text-[#191f28] placeholder-[#8b95a1] focus:bg-white focus:border-[#3182f6] focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* 3. 직무 / 역할 (role) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#333d4b]">
              한 줄 직무 / 소속
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="예: Frontend Developer, Creator"
              className="w-full h-11 px-3.5 rounded-[14px] border border-[#e5e8eb] bg-[#f9fafb] text-[14px] text-[#191f28] placeholder-[#8b95a1] focus:bg-white focus:border-[#3182f6] focus:outline-none transition-all"
            />
          </div>

          {/* 4. 소개글 (bio) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#333d4b]">
              자기소개 (Bio)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="나를 소개하는 짧은 글을 적어보세요."
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
