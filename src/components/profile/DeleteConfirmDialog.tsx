"use client";

import { useState } from "react";
import { LinkItem } from "@/types/profile";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  link: LinkItem | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
  onShowToast: (message: string) => void;
}

export function DeleteConfirmDialog({
  isOpen,
  link,
  onClose,
  onConfirm,
  onShowToast,
}: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!link) return;

    try {
      setIsDeleting(true);
      await onConfirm(link.id);
      onShowToast("링크를 삭제했어요");
      onClose();
    } catch (error) {
      console.error("링크 삭제 중 오류가 발생했습니다:", error);
      onShowToast("링크 삭제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isDeleting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[calc(100%-2.5rem)] sm:max-w-[420px] p-6 rounded-[24px]">
        <DialogHeader className="pr-6">
          <DialogTitle className="text-[18px] font-bold text-[#191f28]">
            정말 삭제하시겠습니까?
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-1">
          {/* 링크 이름 표시 영역 */}
          {link && (
            <div className="flex items-center gap-3 p-3.5 rounded-[16px] bg-[#f2f4f6]/80 border border-[#e5e8eb]">
              <div className="w-10 h-10 rounded-[12px] bg-white flex items-center justify-center text-xl shrink-0 shadow-2xs">
                <span role="img" aria-label={link.title}>
                  {link.icon || "🔗"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-[#191f28] truncate">
                  {link.title}
                </p>
                {link.subtitle ? (
                  <p className="text-[12px] text-[#6b7684] truncate mt-0.5">
                    {link.subtitle}
                  </p>
                ) : (
                  <p className="text-[12px] text-[#8b95a1] truncate mt-0.5">
                    {link.url}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 경고: "이 작업은 되돌릴 수 없습니다" (빨간색) */}
          <div className="flex items-center gap-2 px-1 text-[#f04452]">
            <AlertTriangle className="w-4 h-4 shrink-0 stroke-[2.2]" />
            <p className="text-[13px] font-semibold text-[#f04452]">
              이 작업은 되돌릴 수 없습니다
            </p>
          </div>
        </div>

        {/* 액션 버튼: [취소] [삭제하기] */}
        <DialogFooter className="mt-2 flex-row justify-end gap-2 sm:gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 sm:flex-initial h-11 px-5 rounded-[14px] text-[14px] font-medium text-[#4e5968] bg-[#f2f4f6] hover:bg-[#e5e8eb] active:scale-[0.98] transition-all cursor-pointer"
          >
            취소
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 sm:flex-initial h-11 px-6 rounded-[14px] text-[14px] font-semibold text-white bg-[#f04452] hover:bg-[#d83a47] disabled:opacity-50 active:scale-[0.98] shadow-sm transition-all cursor-pointer"
          >
            {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "삭제하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
