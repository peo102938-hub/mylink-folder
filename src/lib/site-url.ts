/**
 * 배포 환경 및 로컬 환경에 맞는 기본 사이트 URL을 반환합니다.
 * 1. NEXT_PUBLIC_SITE_URL (사용자 지정 프로덕션 도메인)
 * 2. VERCEL_PROJECT_PRODUCTION_URL (Vercel 공식 프로덕션 도메인)
 * 3. VERCEL_URL (Vercel 프리뷰 배포 도메인)
 * 4. fallback: http://localhost:3000
 */
export function getSiteUrl(): string {
  // 1. 명시적으로 설정된 사이트 URL 우선
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const url = process.env.NEXT_PUBLIC_SITE_URL.trim();
    return url.startsWith("http") ? url : `https://${url}`;
  }

  // 2. Vercel 프로덕션 프로젝트 URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  // 3. Vercel 시스템 URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 4. 로컬 개발 환경
  return "http://localhost:3000";
}
