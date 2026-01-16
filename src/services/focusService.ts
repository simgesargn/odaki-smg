import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";

export async function startFocusSession(uid: string, payload: { targetSec: number }) {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid || currentUid !== uid) throw new Error("Not authenticated");
  const ref = await addDoc(collection(db, "focusSessions"), {
    userId: uid,
    targetSec: payload.targetSec,
    durationSec: 0,
    status: "running",
    startedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function endFocusSession(uid: string, sessionId: string, durationSec: number, endedAt?: number) {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid || currentUid !== uid) throw new Error("Not authenticated");
  const ref = doc(db, "focusSessions", sessionId);
  await updateDoc(ref, {
    durationSec,
    endedAt: endedAt ? endedAt : serverTimestamp(),
    status: "completed",
    updatedAt: serverTimestamp(),
  });
}
