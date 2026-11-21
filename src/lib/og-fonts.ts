// Satori / Next.js ImageResponse를 위한 한글 웹폰트(Pretendard) 로더

let cachedBold: ArrayBuffer | null = null;
let cachedMedium: ArrayBuffer | null = null;

const FONT_URL_BOLD =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff/Pretendard-Bold.woff";
const FONT_URL_MEDIUM =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff/Pretendard-Medium.woff";

/**
 * 타임아웃이 포함된 fetch 헬퍼
 * 카카오/페이스북 크롤러는 2~3초 내 응답이 없으면 엑박 처리하므로
 * 외부 CDN이 지연되면 즉시 시스템 폰트로 폴백합니다.
 */
async function fetchWithTimeout(url: string, timeoutMs = 1500): Promise<ArrayBuffer | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: "force-cache",
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

export async function getOgFonts() {
  const fontConfigs: Array<{
    name: string;
    data: ArrayBuffer;
    weight: 400 | 500 | 600 | 700;
    style: "normal";
  }> = [];

  try {
    if (!cachedBold) {
      cachedBold = await fetchWithTimeout(FONT_URL_BOLD, 1500);
    }
    if (cachedBold) {
      fontConfigs.push({
        name: "Pretendard",
        data: cachedBold,
        weight: 700,
        style: "normal",
      });
    }

    if (!cachedMedium) {
      cachedMedium = await fetchWithTimeout(FONT_URL_MEDIUM, 1500);
    }
    if (cachedMedium) {
      fontConfigs.push({
        name: "Pretendard",
        data: cachedMedium,
        weight: 500,
        style: "normal",
      });
    }
  } catch (error) {
    console.warn("Failed to load Pretendard fonts for OG image, falling back to system font:", error);
  }

  return fontConfigs;
}
