export { cn } from "cn";

/**
 * 링크의 수정 일시(updatedAt)를 보기 좋은 한국어 포맷(YYYY.MM.DD HH:mm)으로 변환
 */
export function formatUpdatedAt(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}.${month}.${day} ${hours}:${minutes}`;
  } catch {
    return "";
  }
}
