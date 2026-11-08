import { getUserByUsername, getLinksFromFirestore } from "@/lib/firestoreLinks";
import { notFound } from "next/navigation";
import { UserProfileClientView } from "./UserProfileClientView";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
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
