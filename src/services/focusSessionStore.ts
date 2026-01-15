import AsyncStorage from "@react-native-async-storage/async-storage";

export type FocusSession = {
  id: string;
  minutes: number;
  completedAt: number; // ms
};

const KEY = "odaki:focusSessions:v1";

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function getFocusSessions(): Promise<FocusSession[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const items = JSON.parse(raw) as FocusSession[];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export async function addCompletedFocusSession(minutes: number) {
  const sessions = await getFocusSessions();
  const next: FocusSession = {
    id: uid(),
    minutes,
    completedAt: Date.now(),
  };
  const updated = [next, ...sessions];
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  return next;
}
