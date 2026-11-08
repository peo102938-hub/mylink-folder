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
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { checkUsernameAvailability } from "@/lib/firestoreLinks";

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
  currentUid,
  initialData,
  onSave,
  onShowToast,
}: EditProfileDialogProps) {
  const [displayName, setDisplayName] = useState(initialData.displayName || "");
  const [username, setUsername] = useState(initialData.username || "");
  const [role, setRole] = useState(initialData.role || "");
  const [bio, setBio] = useState(initialData.bio || "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{
    checked: boolean;
    valid: boolean;
    message: string;
  }>({ checked: false, valid: false, message: "" });

  useEffect(() => {
    if (open) {
      setDisplayName(initialData.displayName || "");
      setUsername(initialData.username || "");
      setRole(initialData.role || "");
      setBio(initialData.bio || "");
      setUsernameStatus({ checked: false, valid: false, message: "" });
    }
  }, [open, initialData]);

  // username 변경 시 중복 검사 상태 초기화
  const handleUsernameChange = (val: string) => {
    setUsername(val);
    setUsernameStatus({ checked: false, valid: false, message: "" });
  };

  // username 수동 중복 확인 버튼
  const handleCheckDuplicate = async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      setUsernameStatus({
        checked: true,
        valid: false,
        message: "아이디(username)를 입력해주세요.",
      });
      return;
    }

    try {
      setIsCheckingUsername(true);
      const res = await checkUsernameAvailability(
        trimmed,
        currentUid,
        initialData.username
      );
      if (res.available) {
        setUsernameStatus({
          checked: true,
          valid: true,
          message: "사용 가능한 아이디입니다.",
        });
      } else {
        setUsernameStatus({
          checked: true,
          valid: false,
          message: res.message || "이미 사용 중인 아이디(username)입니다.",
        });
      }
    } catch {
      setUsernameStatus({
        checked: true,
        valid: true,
        message: "사용 가능한 아이디입니다.",
      });
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedDisplayName = displayName.trim();
    const trimmedUsername = username.trim();
    const trimmedBio = bio.trim();

    if (!trimmedDisplayName) {
      onShowToast("표시 이름을 입력해주세요.");
      return;
    }

    if (!trimmedUsername) {
      onShowToast("사용자 아이디(username)를 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. 저장 전 username 중복 체크 검증
      const duplicateCheck = await checkUsernameAvailability(
        trimmedUsername,
        currentUid,
        initialData.username
      );

      if (!duplicateCheck.available) {
        setUsernameStatus({
          checked: true,
          valid: false,
          message: duplicateCheck.message || "이미 사용 중인 아이디(username)입니다.",
        });
        onShowToast(duplicateCheck.message || "이미 사용 중인 아이디입니다.");
        setIsSubmitting(false);
        return;
      }

      // 2. users/{userId}/profile 저장
      await onSave({
        displayName: trimmedDisplayName,
        username: trimmedUsername,
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

          {/* 2. 사용자 아이디 (username - 공유 URL용 & 중복 체크) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-semibold text-[#333d4b]">
                사용자 아이디 (username) <span className="text-[#f04452]">*</span>
              </label>
              <span className="text-[11px] text-[#8b95a1]">공유 URL용 / 기본값: 이메일 앞자리</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex items-center flex-1">
                <span className="absolute left-3.5 text-[#8b95a1] text-[14px] font-medium select-none">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="peo102938"
                  required
                  className={`w-full h-11 pl-8 pr-3.5 rounded-[14px] border ${
                    usernameStatus.checked && !usernameStatus.valid
                      ? "border-[#f04452] bg-[#fff5f5]"
                      : usernameStatus.checked && usernameStatus.valid
                      ? "border-[#3182f6] bg-[#f0f6ff]"
                      : "border-[#e5e8eb] bg-[#f9fafb]"
                  } text-[14px] text-[#191f28] placeholder-[#8b95a1] focus:bg-white focus:border-[#3182f6] focus:outline-none transition-all`}
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCheckDuplicate}
                disabled={isCheckingUsername || !username.trim()}
                className="h-11 px-3 rounded-[14px] text-[12px] font-semibold text-[#3182f6] border-[#d1e6ff] bg-[#f0f6ff] hover:bg-[#e8f3ff] active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                {isCheckingUsername ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  "중복 확인"
                )}
              </Button>
            </div>

            {/* 중복 체크 상태 피드백 메시지 */}
            {usernameStatus.checked && (
              <div
                className={`flex items-center gap-1.5 text-[12px] mt-0.5 ${
                  usernameStatus.valid ? "text-[#3182f6]" : "text-[#f04452]"
                }`}
              >
                {usernameStatus.valid ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{usernameStatus.message}</span>
              </div>
            )}
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
