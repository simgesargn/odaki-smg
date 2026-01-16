import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";

// create task
export async function createTask(uid: string, payload: { title: string; description?: string; priority?: "low" | "medium" | "high"; dueAt?: number | null }) {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid || currentUid !== uid) throw new Error("Not authenticated");
  const ref = await addDoc(collection(db, "tasks"), {
    userId: uid,
    title: payload.title,
    description: payload.description ?? null,
    priority: payload.priority ?? "medium",
    dueAt: payload.dueAt ?? null,
    completed: false,
    completedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTask(uid: string, taskId: string, updates: Partial<{ title: string; completed: boolean; dueAt?: number | null; description?: string; priority?: "low" | "medium" | "high" }>) {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid || currentUid !== uid) throw new Error("Not authenticated");
  const taskRef = doc(db, "tasks", taskId);
  const payload: any = { updatedAt: serverTimestamp() };
  if (typeof updates.title === "string") payload.title = updates.title;
  if (typeof updates.dueAt !== "undefined") payload.dueAt = updates.dueAt ?? null;
  if (typeof updates.description !== "undefined") payload.description = updates.description ?? null;
  if (typeof updates.priority !== "undefined") payload.priority = updates.priority;
  if (typeof updates.completed === "boolean") {
    payload.completed = updates.completed;
    payload.completedAt = updates.completed ? serverTimestamp() : null;
  }
  await updateDoc(taskRef, payload);
}
