import { collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";

export type StoredMsg = { id: string; role: "user" | "assistant"; text: string; createdAt: number };

export async function saveMessage(uid: string, msg: { role: "user" | "assistant"; text: string; createdAt?: number }) {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid || currentUid !== uid) throw new Error("Auth user mismatch or not signed in");

  // create a new chat doc and add message under root aiChats
  const chatRef = await addDoc(collection(db, "aiChats"), {
    userId: uid,
    title: "Odi Sohbeti",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const msgRef = await addDoc(collection(db, "aiChats", chatRef.id, "messages"), {
    userId: uid,
    role: msg.role,
    text: msg.text,
    createdAt: serverTimestamp(),
    createdAtNumber: msg.createdAt ?? Date.now(),
  });
  await updateDoc(doc(db, "aiChats", chatRef.id), { updatedAt: serverTimestamp() });
  return { chatId: chatRef.id, messageId: msgRef.id };
}

export async function loadRecent(uid: string, limitN = 30): Promise<StoredMsg[]> {
  // query root aiChats for user's most recent chat
  const chatsQ = query(collection(db, "aiChats"), where("userId", "==", uid), orderBy("updatedAt", "desc"), limit(1));
  const chatSnap = await getDocs(chatsQ);
  if (chatSnap.empty) return [];
  const chatId = chatSnap.docs[0].id;

  // messages: prefer createdAtNumber if present, fallback to createdAt
  const msgsCollection = collection(db, "aiChats", chatId, "messages");
  let msgsQ = query(msgsCollection, orderBy("createdAtNumber", "asc"), limit(limitN));
  let msgsSnap = await getDocs(msgsQ);
  if (msgsSnap.empty) {
    const msgsQ2 = query(msgsCollection, orderBy("createdAt", "asc"), limit(limitN));
    msgsSnap = await getDocs(msgsQ2);
  }
  const out: StoredMsg[] = msgsSnap.docs.map((d) => {
    const data: any = d.data();
    return {
      id: d.id,
      role: data.role || "assistant",
      text: data.text || "",
      createdAt: data.createdAtNumber || Date.now(),
    };
  });
  return out;
}
