import { ImageResponse } from "next/og";
import { getUserByUsername, getLinksFromFirestore } from "@/lib/firestoreLinks";
import { getOgFonts } from "@/lib/og-fonts";

export const runtime = "nodejs";

export const alt = "사용자 프로필 | 마이링크";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface Props {
  params: Promise<{
    username: string;
  }>;
}

export default async function Image({ params }: Props) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username || "").replace(/^@/, "");

  const fonts = await getOgFonts();

  // 1. 유저 프로필 조회
  let userProfile = null;
  let links: Array<{ title: string; subtitle?: string; icon?: string; url: string }> = [];

  try {
    userProfile = await getUserByUsername(decodedUsername);
    if (userProfile?.uid) {
      const fetchedLinks = await getLinksFromFirestore(userProfile.uid);
      links = (fetchedLinks || []).filter((link) => link.isActive !== false);
    }
  } catch (error) {
    console.warn(`[opengraph-image] Error fetching data for username: ${decodedUsername}`, error);
  }

  // 폴백 기본값 설정
  const displayName = userProfile?.displayName || decodedUsername || "마이링크 사용자";
  const displayRole = userProfile?.role?.trim() || "크리에이터 & 메이커";
  const displayBio =
    userProfile?.bio?.trim() ||
    `안녕하세요! ${displayName}의 마이링크 프로필입니다. 다양한 프로젝트와 소셜 링크를 확인해보세요.`;
  const avatarText = displayName.slice(0, 1).toUpperCase();
  const photoURL = userProfile?.photoURL || null;

  // 상위 링크 최대 3개 선별
  const previewLinks = links.slice(0, 3);
  const totalLinksCount = links.length;

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
        {/* 토스 블루 무드 배경 조명 (Blurs) */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-80px",
            width: "550px",
            height: "550px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(49, 130, 246, 0.15) 0%, rgba(49, 130, 246, 0) 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-120px",
            left: "-90px",
            width: "550px",
            height: "550px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0, 181, 105, 0.08) 0%, rgba(0, 181, 105, 0) 70%)",
            display: "flex",
          }}
        />

        {/* 메인 프로필 카드 프레임 */}
        <div
          style={{
            width: "1080px",
            height: "520px",
            backgroundColor: "#ffffff",
            borderRadius: "32px",
            border: "1.5px solid #e5e8eb",
            boxShadow: "0 20px 45px -12px rgba(25, 31, 40, 0.08)",
            padding: "40px 48px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          {/* 1. 상단 바: 로고와 사용자 맞춤 URL */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            {/* 좌측 로고 */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "12px",
                  backgroundColor: "#3182f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontSize: "20px",
                  boxShadow: "0 4px 10px rgba(49, 130, 246, 0.3)",
                }}
              >
                🔗
              </div>
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#191f28",
                  letterSpacing: "-0.4px",
                }}
              >
                마이링크
              </span>
            </div>

            {/* 우측 사용자 프로필 링크 뱃지 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 18px",
                borderRadius: "9999px",
                backgroundColor: "#f2f4f6",
                border: "1px solid #e5e8eb",
              }}
            >
              <span style={{ fontSize: "14px", color: "#6b7684" }}>🌐</span>
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#333d4b",
                  letterSpacing: "-0.2px",
                }}
              >
                mylink.kr/@{decodedUsername}
              </span>
            </div>
          </div>

          {/* 2. 중앙 컨텐츠: 유저 프로필(좌) + 링크 목록 프리뷰(우) */}
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              justifyContent: "space-between",
              gap: "36px",
              marginTop: "20px",
              marginBottom: "16px",
              flex: "1",
            }}
          >
            {/* [좌측] 유저 메인 정보 컬럼 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                flex: "1",
                maxWidth: "520px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                {/* 아바타 + 이름/핸들 행 */}
                <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                  {/* 아바타 */}
                  {photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoURL}
                      alt={displayName}
                      width="80"
                      height="80"
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2.5px solid #e5e8eb",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        backgroundColor: "#e8f3ff",
                        color: "#3182f6",
                        fontSize: "34px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid #d1e6ff",
                      }}
                    >
                      {avatarText}
                    </div>
                  )}

                  {/* 텍스트 정보 */}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          fontSize: "30px",
                          fontWeight: 700,
                          color: "#191f28",
                          letterSpacing: "-0.6px",
                        }}
                      >
                        {displayName}
                      </span>
                      {/* 공식 인증 체크 뱃지 */}
                      <div
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          backgroundColor: "#3182f6",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "13px",
                          fontWeight: 700,
                        }}
                      >
                        ✓
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: 500,
                        color: "#8b95a1",
                        marginTop: "2px",
                      }}
                    >
                      @{decodedUsername}
                    </span>
                    <span
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "#3182f6",
                        marginTop: "4px",
                      }}
                    >
                      {displayRole}
                    </span>
                  </div>
                </div>

                {/* 소개글 바이오 박스 */}
                <div
                  style={{
                    marginTop: "20px",
                    padding: "16px 20px",
                    borderRadius: "18px",
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e8eb",
                    fontSize: "16px",
                    lineHeight: "1.5",
                    color: "#4e5968",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {displayBio}
                </div>
              </div>

              {/* 유저 태그/상태 뱃지 */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "14px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    borderRadius: "12px",
                    backgroundColor: "#e8f3ff",
                    color: "#1b64da",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  <span>🔗</span>
                  <span>{totalLinksCount > 0 ? `${totalLinksCount}개의 링크 연결됨` : "활성 링크 모음"}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    borderRadius: "12px",
                    backgroundColor: "#f2f4f6",
                    color: "#4e5968",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  <span>✨</span>
                  <span>공식 프로필</span>
                </div>
              </div>
            </div>

            {/* [우측] 등록된 주요 링크 미리보기 카드 영역 */}
            <div
              style={{
                width: "410px",
                backgroundColor: "#f9fafb",
                borderRadius: "24px",
                border: "1px solid #e5e8eb",
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 4px 16px rgba(25, 31, 40, 0.03)",
              }}
            >
              {/* 섹션 제목 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#6b7684", letterSpacing: "0.2px" }}>
                  FEATURED LINKS
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: "6px",
                    backgroundColor: "#e5e8eb",
                    color: "#4e5968",
                  }}
                >
                  {totalLinksCount} Links
                </span>
              </div>

              {/* 링크 리스트 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: "1" }}>
                {previewLinks.length > 0 ? (
                  previewLinks.map((link, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: "#ffffff",
                        padding: "12px 16px",
                        borderRadius: "16px",
                        border: "1px solid #e5e8eb",
                        boxShadow: "0 2px 6px rgba(25, 31, 40, 0.02)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          maxWidth: "320px",
                        }}
                      >
                        <span style={{ fontSize: "20px" }}>{link.icon || "🔗"}</span>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span
                            style={{
                              fontSize: "14px",
                              fontWeight: 700,
                              color: "#191f28",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "260px",
                            }}
                          >
                            {link.title}
                          </span>
                          {link.subtitle && (
                            <span
                              style={{
                                fontSize: "11px",
                                color: "#8b95a1",
                                fontWeight: 500,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "260px",
                              }}
                            >
                              {link.subtitle}
                            </span>
                          )}
                        </div>
                      </div>
                      <span style={{ fontSize: "14px", color: "#3182f6", fontWeight: 700 }}>
                        →
                      </span>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#ffffff",
                      borderRadius: "16px",
                      border: "1px dashed #d1d6db",
                      padding: "28px 16px",
                      gap: "6px",
                    }}
                  >
                    <span style={{ fontSize: "24px" }}>🔗</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#6b7684" }}>
                      등록된 링크를 방문해보세요
                    </span>
                  </div>
                )}
              </div>

              {/* 우측 하단 팁 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "12px",
                  paddingTop: "10px",
                  borderTop: "1px solid #e5e8eb",
                }}
              >
                <span style={{ fontSize: "12px", color: "#8b95a1", fontWeight: 500 }}>
                  탭하여 전체 링크 및 소셜 채널 확인하기
                </span>
              </div>
            </div>
          </div>

          {/* 3. 하단 안내 바 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "16px",
              borderTop: "1px solid #f2f4f6",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", color: "#8b95a1", fontWeight: 500 }}>
                나만의 링크 모음 서비스
              </span>
              <span style={{ fontSize: "12px", color: "#d1d6db" }}>•</span>
              <span style={{ fontSize: "14px", color: "#3182f6", fontWeight: 600 }}>
                마이링크 (MyLink)
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 16px",
                borderRadius: "10px",
                backgroundColor: "#3182f6",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              <span>프로필 방문하기</span>
              <span>↗</span>
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
