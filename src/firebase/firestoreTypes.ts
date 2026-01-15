import { Timestamp } from "firebase/firestore";

export type UserDoc = {
  uid: string;
  name: string;
  username: string;
  email: string;
  avatarEmoji?: string;
  createdAt?: Timestamp;
};

export type TaskDoc = {
  userId: string;
  title: string;
  description?: string;
  categoryName: string;
  categoryColor: string;
  priority: "low" | "medium" | "high";
  dueAt?: Timestamp | null;
  completed: boolean;
  createdAt: Timestamp;
  id?: string;
};

export type NotificationDoc = {
  userId: string;
  type: "reminder" | "completed" | "daily" | string;
  title: string;
  body?: string;
  read?: boolean;
  createdAt?: Timestamp;
  id?: string;
};
