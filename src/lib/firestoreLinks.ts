import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  where,
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
  username: string;
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
 * users/{uid}/profile/profile 서브컬렉션 문서 참조
 */
export function getUserProfileSubDocRef(uid: string) {
  return doc(db, "users", uid, "profile", "profile");
}

/**
 * username 중복 여부 확인
 * - 본인의 현재 username과 동일하면 통과 (currentUid 또는 currentUsername과 일치)
 * - 다른 유저가 사용 중이면 false 반환 및 에러 메시지 제공
 */
export async function checkUsernameAvailability(
  username: string,
  currentUid?: string | null,
  currentUsername?: string | null
): Promise<{ available: boolean; message?: string }> {
  const cleanUsername = username.trim();
  if (!cleanUsername) {
    return { available: false, message: "아이디(username)를 입력해주세요." };
  }

  // 본인의 기존 아이디와 동일하다면 중복 아님
  if (currentUsername && cleanUsername.toLowerCase() === currentUsername.trim().toLowerCase()) {
    return { available: true };
  }

  // 형식 검사: 영문, 숫자, 밑줄, 하이픈, 2~30자
  const usernameRegex = /^[a-zA-Z0-9._-]+$/;
  if (!usernameRegex.test(cleanUsername)) {
    return {
      available: false,
      message: "아이디는 영문, 숫자, 특수문자(._-)만 사용할 수 있습니다.",
    };
  }

  if (cleanUsername.length < 2 || cleanUsername.length > 30) {
    return {
      available: false,
      message: "아이디는 2자 이상 30자 이하로 입력해주세요.",
    };
  }

  try {
    // 1. usernames 컬렉션(인덱싱/선점용) 확인
    try {
      const usernameDocRef = doc(db, "usernames", cleanUsername.toLowerCase());
      const usernameSnap = await getDoc(usernameDocRef);
      if (usernameSnap.exists()) {
        const data = usernameSnap.data();
        if (data && data.uid && data.uid !== currentUid) {
          return { available: false, message: "이미 사용 중인 아이디(username)입니다." };
        }
      }
    } catch (e) {
      console.warn("usernames collection check skipped:", e);
    }

    // 2. users 컬렉션 전체에서 username 필드 중복 확인
    try {
      const usersCol = collection(db, "users");
      const q = query(usersCol, where("username", "==", cleanUsername));
      const querySnap = await getDocs(q);
      for (const docSnap of querySnap.docs) {
        if (docSnap.id !== currentUid) {
          return { available: false, message: "이미 사용 중인 아이디(username)입니다." };
        }
      }
    } catch (e) {
      console.warn("users collection username query skipped:", e);
    }

    return { available: true };
  } catch (error) {
    console.warn("checkUsernameAvailability error:", error);
    // 조회 권한이 제한되는 경우 차단하지 않고 사용 허용
    return { available: true };
  }
}

/**
 * users/{uid} 및 users/{uid}/profile 문서 조회 (유저 정보)
 */
export async function getUserProfile(uid: string): Promise<UserProfileDoc | null> {
  try {
    // 1. users/{uid}/profile/profile 서브문서 조회
    let subData: Partial<UserProfileDoc> | null = null;
    try {
      const subSnap = await getDoc(getUserProfileSubDocRef(uid));
      if (subSnap.exists()) {
        subData = subSnap.data() as Partial<UserProfileDoc>;
      }
    } catch (e) {
      console.warn("Failed to fetch sub-profile document:", e);
    }

    // 2. users/{uid} 기본 문서 조회
    const mainSnap = await getDoc(getUserDocRef(uid));
    const mainData = mainSnap.exists() ? (mainSnap.data() as Partial<UserProfileDoc> & { profile?: Partial<UserProfileDoc> }) : null;

    if (!mainData && !subData) {
      return null;
    }

    const embeddedProfile = (mainData?.profile as Partial<UserProfileDoc>) || {};

    return {
      uid,
      displayName: subData?.displayName || embeddedProfile.displayName || mainData?.displayName || "",
      username: subData?.username || embeddedProfile.username || mainData?.username || "",
      email: subData?.email || embeddedProfile.email || mainData?.email || mainData?.email || "",
      photoURL: subData?.photoURL || embeddedProfile.photoURL || mainData?.photoURL || null,
      bio: subData?.bio !== undefined ? subData.bio : (embeddedProfile.bio !== undefined ? embeddedProfile.bio : mainData?.bio || ""),
      role: subData?.role || embeddedProfile.role || mainData?.role || "Creator",
      updatedAt: subData?.updatedAt || mainData?.updatedAt || null,
    };
  } catch (error) {
    console.error(`Failed to get user profile for ${uid}:`, error);
    return null;
  }
}

/**
 * users/{uid}/profile 및 users/{uid} 문서 저장/업데이트
 */
export async function saveUserProfile(
  uid: string,
  profile: Partial<UserProfileDoc>
): Promise<void> {
  try {
    const cleanUsername = profile.username?.trim();
    const cleanDisplayName = profile.displayName?.trim();
    const cleanBio = profile.bio !== undefined ? profile.bio : "";

    const payload = {
      ...profile,
      uid,
      ...(cleanUsername !== undefined ? { username: cleanUsername } : {}),
      ...(cleanDisplayName !== undefined ? { displayName: cleanDisplayName } : {}),
      bio: cleanBio,
      updatedAt: serverTimestamp(),
    };

    // 1. users/{uid}/profile/profile 서브컬렉션 문서 저장
    try {
      const subDocRef = getUserProfileSubDocRef(uid);
      await setDoc(
        subDocRef,
        {
          uid,
          ...(cleanUsername !== undefined ? { username: cleanUsername } : {}),
          ...(cleanDisplayName !== undefined ? { displayName: cleanDisplayName } : {}),
          bio: cleanBio,
          role: profile.role || "Creator",
          photoURL: profile.photoURL || null,
          email: profile.email || "",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn("Failed to set users/{uid}/profile/profile:", e);
    }

    // 2. users/{uid}/profile/info 호환 저장
    try {
      const subInfoRef = doc(db, "users", uid, "profile", "info");
      await setDoc(
        subInfoRef,
        {
          uid,
          username: cleanUsername,
          displayName: cleanDisplayName,
          bio: cleanBio,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn("Failed to set users/{uid}/profile/info:", e);
    }

    // 3. users/{uid} 메인 문서 저장 (profile 맵 필드 포함)
    const docRef = getUserDocRef(uid);
    await setDoc(
      docRef,
      {
        ...payload,
        profile: {
          username: cleanUsername,
          displayName: cleanDisplayName,
          bio: cleanBio,
          role: profile.role || "Creator",
          photoURL: profile.photoURL || null,
          email: profile.email || "",
          updatedAt: serverTimestamp(),
        },
      },
      { merge: true }
    );

    // 4. usernames 컬렉션에 username 예약 등록 (중복 방지용)
    if (cleanUsername) {
      try {
        const usernameDocRef = doc(db, "usernames", cleanUsername.toLowerCase());
        await setDoc(
          usernameDocRef,
          {
            uid,
            username: cleanUsername,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn("Failed to record in usernames collection:", err);
      }
    }
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
