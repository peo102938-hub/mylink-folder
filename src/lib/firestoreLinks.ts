import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  onSnapshot,
  Timestamp,
  FieldValue,
  type Unsubscribe,
} from "firebase/firestore";
import { LinkItem } from "@/types/profile";

export const FIRESTORE_LINKS_PATH = "users/anonymous/links";

export interface FirestoreLinkDoc {
  title: string;
  url: string;
  subtitle?: string;
  icon?: string;
  badge?: string | null;
  isActive?: boolean;
  createdAt?: Timestamp | FieldValue | null;
}

/**
 * Firestore의 users/anonymous/links 서브컬렉션 참조
 */
export function getLinksCollection() {
  return collection(db, "users", "anonymous", "links");
}

/**
 * 링크 추가 시 Firestore(users/anonymous/links)에 저장
 */
export async function addLinkToFirestore(
  newLink: Omit<LinkItem, "id"> | LinkItem
): Promise<LinkItem> {
  const linksCol = getLinksCollection();

  const docPayload: FirestoreLinkDoc = {
    title: newLink.title.trim(),
    url: newLink.url.trim(),
    subtitle: newLink.subtitle?.trim() || "",
    icon: newLink.icon?.trim() || "🔗",
    badge: newLink.badge?.trim() || null,
    isActive: newLink.isActive !== undefined ? newLink.isActive : true,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(linksCol, docPayload);

  return {
    id: docRef.id,
    title: docPayload.title,
    url: docPayload.url,
    subtitle: docPayload.subtitle || "",
    icon: docPayload.icon || "🔗",
    badge: docPayload.badge || null,
    isActive: docPayload.isActive ?? true,
  };
}

/**
 * Firestore(users/anonymous/links)의 링크 목록을 1회 조회
 */
export async function getLinksFromFirestore(): Promise<LinkItem[]> {
  const linksCol = getLinksCollection();
  const snapshot = await getDocs(linksCol);

  const items: (LinkItem & { _createdAtMs: number })[] = [];

  snapshot.forEach((docSnap) => {
    const data = docSnap.data() as FirestoreLinkDoc;
    let createdAtMs = 0;
    if (
      data.createdAt &&
      "toMillis" in data.createdAt &&
      typeof data.createdAt.toMillis === "function"
    ) {
      createdAtMs = data.createdAt.toMillis();
    }

    items.push({
      id: docSnap.id,
      title: data.title || "",
      url: data.url || "",
      subtitle: data.subtitle || "",
      icon: data.icon || "🔗",
      badge: data.badge || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      _createdAtMs: createdAtMs,
    });
  });

  // 최신순(createdAt 내림차순) 정렬
  items.sort((a, b) => b._createdAtMs - a._createdAtMs);

  return items.map(({ _createdAtMs, ...item }) => item);
}

/**
 * Firestore(users/anonymous/links) 실시간 구독 (onSnapshot)
 */
export function subscribeFirestoreLinks(
  onUpdate: (links: LinkItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const linksCol = getLinksCollection();

  return onSnapshot(
    linksCol,
    (snapshot) => {
      const items: (LinkItem & { _createdAtMs: number })[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as FirestoreLinkDoc;
        let createdAtMs = 0;
        if (
          data.createdAt &&
          "toMillis" in data.createdAt &&
          typeof data.createdAt.toMillis === "function"
        ) {
          createdAtMs = data.createdAt.toMillis();
        } else {
          // 로컬 낙관적 업데이트 중(서버 타임스탬프 대기)에는 최신으로 처리
          createdAtMs = Date.now();
        }

        items.push({
          id: docSnap.id,
          title: data.title || "",
          url: data.url || "",
          subtitle: data.subtitle || "",
          icon: data.icon || "🔗",
          badge: data.badge || null,
          isActive: data.isActive !== undefined ? data.isActive : true,
          _createdAtMs: createdAtMs,
        });
      });

      // 최신순(createdAt 내림차순) 정렬
      items.sort((a, b) => b._createdAtMs - a._createdAtMs);

      const links = items.map(({ _createdAtMs, ...item }) => item);
      onUpdate(links);
    },
    (error) => {
      console.error("Firestore onSnapshot error (users/anonymous/links):", error);
      if (onError) onError(error);
    }
  );
}
