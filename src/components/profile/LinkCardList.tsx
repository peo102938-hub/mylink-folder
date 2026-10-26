"use client";

import { useState } from "react";
import { LinkItem } from "@/types/profile";
import { ChevronRight, Plus, Link2, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddLinkDialog } from "@/components/profile/AddLinkDialog";
import { InlineEditLinkCard } from "@/components/profile/InlineEditLinkCard";
import { DeleteConfirmDialog } from "@/components/profile/DeleteConfirmDialog";

interface LinkCardListProps {
  links: LinkItem[];
  onAddLink?: (link: Omit<LinkItem, "id">) => Promise<LinkItem | void> | void;
  onUpdateLink?: (id: string, updated: Partial<LinkItem>) => Promise<void>;
  onDeleteLink?: (id: string) => Promise<void>;
  onShowToast?: (message: string) => void;
}

export function LinkCardList({
  links,
  onAddLink,
  onUpdateLink,
  onDeleteLink,
  onShowToast = () => {},
}: LinkCardListProps) {
  // Only display active links per PRD
  const activeLinks = links.filter((link) => link.isActive);

  // 현재 인라인 편집 중인 링크 ID 상태
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  // 현재 삭제 확인 모달에 열려있는 대상 링크
  const [deletingLink, setDeletingLink] = useState<LinkItem | null>(null);

  return (
    <section className="flex flex-col gap-3">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <h2 className="text-[12px] font-bold text-[#8b95a1] uppercase tracking-wider">
            Links
          </h2>
          <span className="text-[12px] text-[#8b95a1] font-medium">
            {activeLinks.length}개
          </span>
        </div>

        {onAddLink && (
          <AddLinkDialog onAddLink={onAddLink} onShowToast={onShowToast} />
        )}
      </div>

      {/* Link Cards or Empty State */}
      {activeLinks.length === 0 ? (
        <Card className="rounded-[20px] border border-dashed border-[#d1d6db] bg-white/60 p-8 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#f2f4f6] flex items-center justify-center text-[#8b95a1]">
            <Link2 className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#333d4b]">
              등록된 링크가 아직 없어요
            </p>
            <p className="text-[12px] text-[#8b95a1] mt-0.5">
              새로운 링크를 추가하여 프로필을 완성해보세요.
            </p>
          </div>
          {onAddLink && (
            <AddLinkDialog
              onAddLink={onAddLink}
              onShowToast={onShowToast}
              triggerButton={
                <button
                  type="button"
                  className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-[12px] text-[13px] font-semibold text-white bg-[#3182f6] hover:bg-[#1b64da] active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>첫 링크 추가하기</span>
                </button>
              }
            />
          )}
        </Card>
      ) : (
        <div className="flex flex-col gap-2.5">
          {activeLinks.map((link) => {
            // 인라인 편집 UI 활성화 시 해당 카드를 인라인 폼 컴포넌트로 렌더링
            if (editingLinkId === link.id && onUpdateLink) {
              return (
                <InlineEditLinkCard
                  key={link.id}
                  link={link}
                  onSave={onUpdateLink}
                  onCancel={() => setEditingLinkId(null)}
                  onShowToast={onShowToast}
                />
              );
            }

            return (
              <Card
                key={link.id}
                className="group rounded-[20px] border border-[#e5e8eb] bg-white p-3.5 sm:p-4 flex flex-row items-center justify-between hover:border-[#3182f6] hover:shadow-[0_4px_16px_rgba(49,130,246,0.08)] ring-0 transition-all duration-200"
              >
                {/* 좌측: 링크 영역 (클릭 시 새 창 이동) */}
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 min-w-0 flex-1 pr-2 cursor-pointer active:opacity-80 transition-opacity"
                  aria-label={`${link.title} 바로가기`}
                >
                  {/* Emoji Icon Container (40x40px, rounded-[14px]) */}
                  <div className="w-10 h-10 rounded-[14px] bg-[#f2f4f6] flex items-center justify-center text-xl shrink-0 group-hover:scale-105 group-hover:bg-[#e8f3ff] transition-all duration-200">
                    <span role="img" aria-label={link.title}>
                      {link.icon}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-semibold text-[#191f28] truncate group-hover:text-[#3182f6] transition-colors">
                        {link.title}
                      </span>
                      {link.badge && (
                        <Badge
                          variant="secondary"
                          className="h-5 px-1.5 py-0 rounded-[6px] bg-[#e8f3ff] text-[#3182f6] text-[11px] font-semibold border-transparent shrink-0"
                        >
                          {link.badge}
                        </Badge>
                      )}
                    </div>
                    {link.subtitle && (
                      <p className="text-[13px] text-[#6b7684] truncate mt-0.5">
                        {link.subtitle}
                      </p>
                    )}
                  </div>
                </a>

                {/* 우측 액션 버튼: 항상 표시 (Always Visible) */}
                <div className="flex items-center gap-1 shrink-0 pl-1">
                  {onUpdateLink && (
                    <button
                      type="button"
                      onClick={() => setEditingLinkId(link.id)}
                      className="p-2 rounded-[10px] text-[#8b95a1] hover:text-[#3182f6] hover:bg-[#e8f3ff] active:scale-95 transition-all cursor-pointer"
                      aria-label={`${link.title} 수정`}
                      title="수정"
                    >
                      <Pencil className="w-4 h-4 stroke-[2]" />
                    </button>
                  )}

                  {onDeleteLink && (
                    <button
                      type="button"
                      onClick={() => setDeletingLink(link)}
                      className="p-2 rounded-[10px] text-[#8b95a1] hover:text-[#f04452] hover:bg-[#feebee] active:scale-95 transition-all cursor-pointer"
                      aria-label={`${link.title} 삭제`}
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4 stroke-[2]" />
                    </button>
                  )}

                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-[#b0b8c1] hover:text-[#3182f6] transition-colors"
                    aria-label={`${link.title} 바로가기`}
                  >
                    <ChevronRight className="w-5 h-5 group-hover:text-[#3182f6] group-hover:translate-x-0.5 transition-all duration-200" />
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {onDeleteLink && (
        <DeleteConfirmDialog
          isOpen={Boolean(deletingLink)}
          link={deletingLink}
          onClose={() => setDeletingLink(null)}
          onConfirm={async (id) => {
            await onDeleteLink(id);
          }}
          onShowToast={onShowToast}
        />
      )}
    </section>
  );
}
