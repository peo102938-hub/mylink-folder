import { z } from "zod";

// 올바른 웹 URL 및 메일주소 검증 정규식
// 1) http(s)://가 있거나 없는 일반 도메인 (예: github.com, velog.io/@user, https://example.com)
// 2) localhost 및 포트번호/경로/쿼리/해시 허용
export const URL_REGEX =
  /^(https?:\/\/)?((([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,})|localhost)(:\d+)?(\/[^\s]*)?$/i;
export const MAILTO_REGEX =
  /^mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i;

// 링크 생성 및 수정 공통 Zod 검증 스키마
export const linkFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "링크 제목을 입력해주세요." })
    .max(40, { message: "링크 제목은 최대 40자까지 입력할 수 있어요." }),
  url: z
    .string()
    .trim()
    .min(1, { message: "연결 URL을 입력해주세요." })
    .refine(
      (val) => {
        const trimmed = val.trim();
        return URL_REGEX.test(trimmed) || MAILTO_REGEX.test(trimmed);
      },
      {
        message: "올바른 URL 형식(예: github.com)을 입력해주세요.",
      }
    ),
  subtitle: z
    .string()
    .max(80, { message: "보조 설명은 최대 80자까지 입력할 수 있어요." }),
  icon: z
    .string()
    .min(1, { message: "아이콘을 입력해주세요." }),
  badge: z
    .string()
    .max(10, { message: "뱃지 문구는 최대 10자까지 가능해요." })
    .nullable(),
});

export type LinkFormValues = z.infer<typeof linkFormSchema>;

export const PRESET_ICONS = [
  { icon: "💼", label: "포트폴리오" },
  { icon: "🐙", label: "GitHub" },
  { icon: "✍️", label: "블로그" },
  { icon: "📄", label: "이력서" },
  { icon: "🌐", label: "웹사이트" },
  { icon: "📱", label: "SNS" },
  { icon: "🎨", label: "디자인" },
  { icon: "💡", label: "프로젝트" },
  { icon: "☕", label: "커피챗" },
  { icon: "🔗", label: "기타" },
];

export const PRESET_BADGES = ["추천", "NEW", "HOT"];

/**
 * 프로토콜(http/https/mailto)이 누락된 URL에 기본 https:// 접두어 부여
 */
export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (
    !trimmed.startsWith("http://") &&
    !trimmed.startsWith("https://") &&
    !trimmed.startsWith("mailto:")
  ) {
    return `https://${trimmed}`;
  }
  return trimmed;
}
