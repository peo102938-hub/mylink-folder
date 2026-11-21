import { ImageResponse } from "next/og";
import { getOgFonts } from "@/lib/og-fonts";

export const runtime = "nodejs";

export const alt = "마이링크 | 나만의 올인원 프로필 링크";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const fonts = await getOgFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9fafb",
          fontFamily: "Pretendard, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 은은한 배경 장식 그라데이션 원 */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(49, 130, 246, 0.12) 0%, rgba(49, 130, 246, 0) 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-100px",
            width: "550px",
            height: "550px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(49, 130, 246, 0.08) 0%, rgba(49, 130, 246, 0) 70%)",
            display: "flex",
          }}
        />

        {/* 메인 프레임 카드 */}
        <div
          style={{
            width: "1060px",
            height: "510px",
            backgroundColor: "#ffffff",
            borderRadius: "32px",
            border: "1.5px solid #e5e8eb",
            boxShadow: "0 20px 40px -15px rgba(25, 31, 40, 0.07)",
            padding: "48px 56px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          {/* 상단 헤더: 브랜드 로고 + 도메인 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "14px",
                  backgroundColor: "#3182f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontSize: "24px",
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(49, 130, 246, 0.35)",
                }}
              >
                🔗
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: "26px",
                    fontWeight: 700,
                    color: "#191f28",
                    letterSpacing: "-0.5px",
                  }}
                >
                  마이링크
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#8b95a1",
                    marginTop: "-2px",
                  }}
                >
                  mylink.kr
                </span>
              </div>
            </div>

            {/* TDS 스타일 뱃지 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 18px",
                borderRadius: "9999px",
                backgroundColor: "#e8f3ff",
                color: "#1b64da",
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "0.2px",
              }}
            >
              <span style={{ marginRight: "6px" }}>✨</span>
              <span>PERSONALIZED LINK VAULT</span>
            </div>
          </div>

          {/* 중간 콘텐츠: 2열 레이아웃 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "40px",
              marginTop: "20px",
              marginBottom: "10px",
            }}
          >
            {/* 좌측: 타이틀 및 설명 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: "1",
              }}
            >
              <h1
                style={{
                  fontSize: "44px",
                  fontWeight: 700,
                  color: "#191f28",
                  lineHeight: "1.25",
                  letterSpacing: "-1px",
                  margin: "0 0 16px 0",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span>나만의 링크를 하나로,</span>
                <span style={{ color: "#3182f6" }}>감각적인 프로필 페이지</span>
              </h1>
              <p
                style={{
                  fontSize: "20px",
                  fontWeight: 500,
                  color: "#4e5968",
                  lineHeight: "1.5",
                  margin: 0,
                  letterSpacing: "-0.2px",
                }}
              >
                소셜 계정, 포트폴리오, 주요 링크를 단 1초 만에 모아 공유하세요.
              </p>
            </div>

            {/* 우측: 프리뷰 미니 카드 그래픽 */}
            <div
              style={{
                width: "360px",
                backgroundColor: "#f9fafb",
                borderRadius: "24px",
                border: "1px solid #e5e8eb",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                boxShadow: "0 8px 24px rgba(25, 31, 40, 0.04)",
              }}
            >
              {/* 유저 프리뷰 헤더 */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    backgroundColor: "#e8f3ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    color: "#3182f6",
                    fontWeight: 700,
                    border: "1px solid #d1e6ff",
                  }}
                >
                  M
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "16px", fontWeight: 700, color: "#191f28" }}>
                      홍길동
                    </span>
                    <span
                      style={{
                        width: "14px",
                        height: "14px",
                        borderRadius: "50%",
                        backgroundColor: "#3182f6",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "9px",
                        fontWeight: 700,
                      }}
                    >
                      ✓
                    </span>
                  </div>
                  <span style={{ fontSize: "12px", color: "#6b7684", fontWeight: 500 }}>
                    Frontend Developer
                  </span>
                </div>
              </div>

              {/* 프리뷰 링크 아이템 1 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#ffffff",
                  padding: "10px 14px",
                  borderRadius: "14px",
                  border: "1px solid #e5e8eb",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "16px" }}>💻</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#333d4b" }}>
                    포트폴리오 사이트
                  </span>
                </div>
                <span style={{ fontSize: "13px", color: "#b0b8c1" }}>→</span>
              </div>

              {/* 프리뷰 링크 아이템 2 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#ffffff",
                  padding: "10px 14px",
                  borderRadius: "14px",
                  border: "1px solid #e5e8eb",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "16px" }}>🐙</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#333d4b" }}>
                    GitHub 프로필
                  </span>
                </div>
                <span style={{ fontSize: "13px", color: "#b0b8c1" }}>→</span>
              </div>
            </div>
          </div>

          {/* 하단 푸터 뱃지 리스트 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              paddingTop: "18px",
              borderTop: "1px solid #f2f4f6",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "12px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e8eb",
                color: "#4e5968",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              <span>⚡</span>
              <span>1초 만에 완성하는 링크 모음</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "12px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e8eb",
                color: "#4e5968",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              <span>📊</span>
              <span>실시간 클릭 통계 분석</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "12px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e8eb",
                color: "#4e5968",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              <span>✨</span>
              <span>모던 & 미니멀 프로필</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fonts.length > 0 ? fonts : undefined,
    }
  );
}
