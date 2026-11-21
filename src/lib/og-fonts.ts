// Satori / Next.js ImageResponse를 위한 한글 웹폰트(Pretendard) 로더

let cachedBold: ArrayBuffer | null = null;
let cachedMedium: ArrayBuffer | null = null;

const FONT_URL_BOLD =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff/Pretendard-Bold.woff";
const FONT_URL_MEDIUM =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff/Pretendard-Medium.woff";

export async function getOgFonts() {
  const fontConfigs: Array<{
    name: string;
    data: ArrayBuffer;
    weight: 400 | 500 | 600 | 700;
    style: "normal";
  }> = [];

  try {
    if (!cachedBold) {
      const res = await fetch(FONT_URL_BOLD, { cache: "force-cache" });
      if (res.ok) {
        cachedBold = await res.arrayBuffer();
      }
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
      const res = await fetch(FONT_URL_MEDIUM, { cache: "force-cache" });
      if (res.ok) {
        cachedMedium = await res.arrayBuffer();
      }
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
