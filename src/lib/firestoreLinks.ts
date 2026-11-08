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
  updatedAt?: Timestamp | FieldValue | string | null;
}

/**
 * Firestore Timestamp / FieldValue / Date 객체를 직렬화 가능한 ISO 문자열로 안전하게 변환
 */
export function serializeTimestamp(val: unknown): string | null {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (typeof val === "object" && val !== null) {
    if ("toDate" in val && typeof (val as Timestamp).toDate === "function") {
      return (val as Timestamp).toDate().toISOString();
    }
    if ("seconds" in val && typeof (val as { seconds: number }).seconds === "number") {
      return new Date((val as { seconds: number }).seconds * 1000).toISOString();
    }
  }
  return null;
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
 * displayName으로 유저 검색 (users 컬렉션 조회)
 * - displayName 또는 profile.displayName 일치 유저 검색
 * - 일치하는 유저의 uid로 전체 프로필 반환
 * @deprecated username 기반 라우팅으로 전환됨. getUserByUsername()을 사용하세요.
 */
export async function getUserByDisplayName(displayName: string): Promise<UserProfileDoc | null> {
  const cleanName = displayName.trim();
  if (!cleanName) return null;

  try {
    const usersCol = collection(db, "users");

    // 1. displayName 필드로 direct query
    try {
      const q1 = query(usersCol, where("displayName", "==", cleanName));
      const snap1 = await getDocs(q1);
      if (!snap1.empty) {
        const uid = snap1.docs[0].id;
        return await getUserProfile(uid);
      }
    } catch (e) {
      console.warn("Direct query by displayName failed:", e);
    }

    // 2. profile.displayName 필드로 query
    try {
      const q2 = query(usersCol, where("profile.displayName", "==", cleanName));
      const snap2 = await getDocs(q2);
      if (!snap2.empty) {
        const uid = snap2.docs[0].id;
        return await getUserProfile(uid);
      }
    } catch (e) {
      console.warn("Direct query by profile.displayName failed:", e);
    }

    // 3. users 컬렉션 스캔 (대소문자 무시 매칭)
    try {
      const allSnap = await getDocs(usersCol);
      for (const docSnap of allSnap.docs) {
        const data = docSnap.data();
        const docDisplayName = data.displayName || data.profile?.displayName;
        if (
          docDisplayName &&
          typeof docDisplayName === "string" &&
          docDisplayName.trim().toLowerCase() === cleanName.toLowerCase()
        ) {
          return await getUserProfile(docSnap.id);
        }
      }
    } catch (e) {
      console.warn("Scan users collection failed:", e);
    }

    return null;
  } catch (error) {
    console.error(`getUserByDisplayName failed for ${displayName}:`, error);
    return null;
  }
}

/**
 * username으로 유저 검색 (고유 식별자 기반 조회)
 * - usernames/{username} 컬렉션으로 O(1) uid 조회 (인덱스 활용)
 * - 없으면 users 컬렉션 username 필드로 fallback 쿼리
 */
export async function getUserByUsername(username: string): Promise<UserProfileDoc | null> {
  const cleanUsername = username.trim().toLowerCase();
  if (!cleanUsername) return null;

  try {
    // 1. usernames 선점 컬렉션으로 uid 조회 (O(1), 인덱스 활용)
    try {
      const usernameDocRef = doc(db, "usernames", cleanUsername);
      const usernameSnap = await getDoc(usernameDocRef);
      if (usernameSnap.exists()) {
        const data = usernameSnap.data();
        if (data?.uid) {
          return await getUserProfile(data.uid);
        }
      }
    } catch (e) {
      console.warn("getUserByUsername: usernames collection lookup failed:", e);
    }

    // 2. users 컬렉션 username 필드 쿼리 (fallback)
    try {
      const usersCol = collection(db, "users");
      const q = query(usersCol, where("username", "==", cleanUsername));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return await getUserProfile(snap.docs[0].id);
      }
    } catch (e) {
      console.warn("getUserByUsername: users collection query failed:", e);
    }

    // 3. profile.username 필드 쿼리 (fallback)
    try {
      const usersCol = collection(db, "users");
      const q = query(usersCol, where("profile.username", "==", cleanUsername));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return await getUserProfile(snap.docs[0].id);
      }
    } catch (e) {
      console.warn("getUserByUsername: profile.username query failed:", e);
    }

    return null;
  } catch (error) {
    console.error(`getUserByUsername failed for ${username}:`, error);
    return null;
  }
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
    const rawUpdatedAt = subData?.updatedAt || mainData?.updatedAt || null;

    return {
      uid,
      displayName: subData?.displayName || embeddedProfile.displayName || mainData?.displayName || "",
      username: subData?.username || embeddedProfile.username || mainData?.username || "",
      email: subData?.email || embeddedProfile.email || mainData?.email || mainData?.email || "",
      photoURL: subData?.photoURL || embeddedProfile.photoURL || mainData?.photoURL || null,
      bio: subData?.bio !== undefined ? subData.bio : (embeddedProfile.bio !== undefined ? embeddedProfile.bio : mainData?.bio || ""),
      role: subData?.role || embeddedProfile.role || mainData?.role || "Creator",
      updatedAt: serializeTimestamp(rawUpdatedAt),
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
