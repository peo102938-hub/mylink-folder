import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  addDoc,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
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

export interface FirestoreLinkDoc {
  title: string;
  url: string;
  subtitle?: string;
  icon?: string;
  badge?: string | null;
  isActive?: boolean;
  createdAt?: Timestamp | FieldValue | null;
  updatedAt?: Timestamp | FieldValue | null;
}

export interface UserProfileDoc {
  uid: string;
  displayName: string;
  username?: string;
  email: string;
  photoURL?: string | null;
  bio?: string;
  role?: string;
  updatedAt?: Timestamp | FieldValue | null;
}

/**
 * 이메일 주소에서 @ 앞부분을 추출 (예: peo102938@gmail.com -> peo102938)
 */
export function extractEmailPrefix(email?: string | null): string {
  if (!email) return "user";
  const prefix = email.split("@")[0]?.trim();
  return prefix || "user";
}

/**
 * users/{uid} 문서 참조
 */
export function getUserDocRef(uid: string) {
  return doc(db, "users", uid);
}

/**
 * users/{uid} 문서 조회 (유저 정보)
 */
export async function getUserProfile(uid: string): Promise<UserProfileDoc | null> {
  try {
    const docSnap = await getDoc(getUserDocRef(uid));
    if (docSnap.exists()) {
      return docSnap.data() as UserProfileDoc;
    }
    return null;
  } catch (error) {
    console.error(`Failed to get user profile for ${uid}:`, error);
    return null;
  }
}

/**
 * users/{uid} 문서 저장/업데이트
 */
export async function saveUserProfile(
  uid: string,
  profile: Partial<UserProfileDoc>
): Promise<void> {
  try {
    const docRef = getUserDocRef(uid);
    await setDoc(
      docRef,
      {
        ...profile,
        uid,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error(`Failed to save user profile for ${uid}:`, error);
    throw error;
  }
}

/**
 * Firestore의 users/{uid}/links 서브컬렉션 참조
 */
export function getLinksCollection(uid: string = "anonymous") {
  return collection(db, "users", uid, "links");
}

/**
 * Firestore의 users/{uid}/links 서브컬렉션을 createdAt 기준 최신순(내림차순)으로 정렬하는 쿼리 생성
 */
export function getLinksQuery(uid: string = "anonymous") {
  return query(getLinksCollection(uid), orderBy("createdAt", "desc"));
}

/**
 * Firestore 스냅샷 문서를 LinkItem 배열로 변환 (createdAt 최신순 정렬 보장)
 */
function parseFirestoreLinksSnapshot(snapshot: QuerySnapshot<DocumentData>): LinkItem[] {
  const items: (LinkItem & { _createdAtMs: number })[] = [];

  snapshot.forEach((docSnap) => {
    const data = docSnap.data() as FirestoreLinkDoc;
    let createdAtMs = 0;
    let createdAtStr: string | null = null;
    if (
      data.createdAt &&
      "toMillis" in data.createdAt &&
      typeof data.createdAt.toMillis === "function"
    ) {
      createdAtMs = data.createdAt.toMillis();
      if ("toDate" in data.createdAt && typeof data.createdAt.toDate === "function") {
        createdAtStr = (data.createdAt as Timestamp).toDate().toISOString();
      }
    } else {
      // 로컬 낙관적 업데이트 중(서버 타임스탬프 대기)이거나 타임스탬프 필드가 아직 반영되지 않은 경우 최신으로 처리
      createdAtMs = Date.now();
    }

    let updatedAtStr: string | null = null;
    if (
      data.updatedAt &&
      "toDate" in data.updatedAt &&
      typeof data.updatedAt.toDate === "function"
    ) {
      updatedAtStr = (data.updatedAt as Timestamp).toDate().toISOString();
    } else if (typeof data.updatedAt === "string") {
      updatedAtStr = data.updatedAt;
    }

    items.push({
      id: docSnap.id,
      title: data.title || "",
      url: data.url || "",
      subtitle: data.subtitle || "",
      icon: data.icon || "🔗",
      badge: data.badge || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: createdAtStr,
      updatedAt: updatedAtStr,
      _createdAtMs: createdAtMs,
    });
  });

  // createdAt 최신순 (내림차순) 정렬
  items.sort((a, b) => b._createdAtMs - a._createdAtMs);

  return items.map(({ _createdAtMs, ...item }) => item);
}

/**
 * 링크 추가 시 Firestore(users/{uid}/links)에 저장
 */
export async function addLinkToFirestore(
  uid: string,
  newLink: Omit<LinkItem, "id"> | LinkItem
): Promise<LinkItem> {
  const linksCol = getLinksCollection(uid);

  const docPayload: FirestoreLinkDoc = {
    title: newLink.title.trim(),
    url: newLink.url.trim(),
    subtitle: newLink.subtitle?.trim() || "",
    icon: newLink.icon?.trim() || "🔗",
    badge: newLink.badge?.trim() || null,
    isActive: newLink.isActive !== undefined ? newLink.isActive : true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Firestore(users/{uid}/links)의 링크 목록을 createdAt 최신순으로 1회 조회
 */
export async function getLinksFromFirestore(uid: string = "anonymous"): Promise<LinkItem[]> {
  try {
    const q = getLinksQuery(uid);
    const snapshot = await getDocs(q);
    return parseFirestoreLinksSnapshot(snapshot);
  } catch (error) {
    console.warn(
      "getLinksQuery with orderBy failed, falling back to basic collection query:",
      error
    );
    const linksCol = getLinksCollection(uid);
    const snapshot = await getDocs(linksCol);
    return parseFirestoreLinksSnapshot(snapshot);
  }
}

/**
 * Firestore(users/{uid}/links) 실시간 구독 (createdAt 최신순 정렬)
 */
export function subscribeFirestoreLinks(
  uid: string,
  onUpdate: (links: LinkItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  try {
    const q = getLinksQuery(uid);

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
        const linksCol = getLinksCollection(uid);
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

/**
 * 링크 수정 시 Firestore(users/{uid}/links) 문서 업데이트
 */
export async function updateLinkInFirestore(
  uid: string,
  id: string,
  updatedFields: Partial<LinkItem>
): Promise<void> {
  const docRef = doc(db, "users", uid, "links", id);
  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (updatedFields.title !== undefined) payload.title = updatedFields.title.trim();
  if (updatedFields.url !== undefined) payload.url = updatedFields.url.trim();
  if (updatedFields.subtitle !== undefined) payload.subtitle = updatedFields.subtitle.trim();
  if (updatedFields.icon !== undefined) payload.icon = updatedFields.icon.trim();
  if (updatedFields.badge !== undefined) payload.badge = updatedFields.badge?.trim() || null;
  if (updatedFields.isActive !== undefined) payload.isActive = updatedFields.isActive;

  await setDoc(docRef, payload, { merge: true });
}

/**
 * 링크 삭제 시 Firestore(users/{uid}/links) 문서 삭제
 */
export async function deleteLinkFromFirestore(uid: string, id: string): Promise<void> {
  const docRef = doc(db, "users", uid, "links", id);
  await deleteDoc(docRef);
}
