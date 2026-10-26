import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  getDocs,
  onSnapshot,
  Timestamp,
  FieldValue,
  type Unsubscribe,
  type QuerySnapshot,
  type DocumentData,
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
 * Firestore의 users/anonymous/links 서브컬렉션을 createdAt 기준 최신순(내림차순)으로 정렬하는 쿼리 생성
 */
export function getLinksQuery() {
  return query(getLinksCollection(), orderBy("createdAt", "desc"));
}

/**
 * Firestore 스냅샷 문서를 LinkItem 배열로 변환 (createdAt 최신순 정렬 보장)
 */
function parseFirestoreLinksSnapshot(snapshot: QuerySnapshot<DocumentData>): LinkItem[] {
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
      // 로컬 낙관적 업데이트 중(서버 타임스탬프 대기)이거나 타임스탬프 필드가 아직 반영되지 않은 경우 최신으로 처리
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

  // createdAt 최신순 (내림차순) 정렬
  items.sort((a, b) => b._createdAtMs - a._createdAtMs);

  return items.map(({ _createdAtMs, ...item }) => item);
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
 * Firestore(users/anonymous/links)의 링크 목록을 createdAt 최신순으로 1회 조회
 */
export async function getLinksFromFirestore(): Promise<LinkItem[]> {
  try {
    const q = getLinksQuery();
    const snapshot = await getDocs(q);
    return parseFirestoreLinksSnapshot(snapshot);
  } catch (error) {
    console.warn(
      "getLinksQuery with orderBy failed, falling back to basic collection query:",
      error
    );
    const linksCol = getLinksCollection();
    const snapshot = await getDocs(linksCol);
    return parseFirestoreLinksSnapshot(snapshot);
  }
}

/**
 * Firestore(users/anonymous/links) 실시간 구독 (createdAt 최신순 정렬)
 */
export function subscribeFirestoreLinks(
  onUpdate: (links: LinkItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  try {
    const q = getLinksQuery();

    return onSnapshot(
      q,
      (snapshot) => {
        const links = parseFirestoreLinksSnapshot(snapshot);
        onUpdate(links);
      },
      (error) => {
        console.warn(
          "Firestore onSnapshot query error, falling back to collection listener:",
          error
        );
        const linksCol = getLinksCollection();
        const fallbackUnsubscribe = onSnapshot(
          linksCol,
          (fallbackSnapshot) => {
            const links = parseFirestoreLinksSnapshot(fallbackSnapshot);
            onUpdate(links);
          },
          (fallbackError) => {
            console.error("Firestore onSnapshot fallback error:", fallbackError);
            if (onError) onError(fallbackError);
          }
        );

        if (onError) onError(error);
        return fallbackUnsubscribe;
      }
    );
  } catch (error) {
    console.error("Failed to subscribe to Firestore links:", error);
    if (onError && error instanceof Error) onError(error);
    return () => {};
  }
}
