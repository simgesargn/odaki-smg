import { doc, setDoc, serverTimestamp, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";

export async function ensureUserDoc(uid: string, data: { email?: string | null; name?: string; username?: string; avatarEmoji?: string }) {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid || currentUid !== uid) throw new Error("Not authenticated");
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid,
      email: data.email ?? null,
      name: data.name ?? null,
      username: data.username ?? null,
      avatarEmoji: data.avatarEmoji ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    await updateDoc(ref, {
      email: data.email ?? null,
      name: data.name ?? null,
      username: data.username ?? null,
      avatarEmoji: data.avatarEmoji ?? null,
      updatedAt: serverTimestamp(),
    } as any);
  }
}
