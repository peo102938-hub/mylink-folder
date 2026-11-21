import { getUserByUsername, getLinksFromFirestore } from "@/lib/firestoreLinks";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { UserProfileClientView } from "./UserProfileClientView";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username || "").replace(/^@/, "");
  const userProfile = await getUserByUsername(decodedUsername);

  if (!userProfile) {
    return {
      title: `@${decodedUsername}`,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const displayName = userProfile.displayName || decodedUsername;
  const description =
    userProfile.bio || `${displayName}님의 마이링크 프로필 및 추천 링크 목록입니다.`;
  const canonicalUrl = `/${encodeURIComponent(decodedUsername)}`;

  return {
    title: `${displayName} (@${decodedUsername})`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${displayName} (@${decodedUsername})`,
      description,
      url: canonicalUrl,
      type: "profile",
      username: decodedUsername,
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} (@${decodedUsername})`,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);

  // 1. username으로 유저 검색 (고유 식별자 기반, 중복 없음)
  const userProfile = await getUserByUsername(decodedUsername);

  // 2. 유저가 없거나 username이 없으면 404 페이지
  if (!userProfile || !userProfile.username || !userProfile.username.trim()) {
    notFound();
  }

  // 3. 링크: users/{userId}/links 조회
  const initialLinks = await getLinksFromFirestore(userProfile.uid);

  // 4. Server Component에서 Client Component로 전달 시 직렬화 에러 방지 (Plain Object 변환)
  const plainUserProfile = JSON.parse(JSON.stringify(userProfile));
  const plainInitialLinks = JSON.parse(JSON.stringify(initialLinks));

  return (
    <UserProfileClientView
      userProfile={plainUserProfile}
      initialLinks={plainInitialLinks}
    />
  );
}
