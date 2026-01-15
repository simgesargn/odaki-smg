import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "odaki_focus_state_v1";

export type FocusState = {
  totalSeconds: number; // toplam odak
  streak: number;       // şimdilik basit sayaç
  flowers: string[];    // kazanılan çiçek id’leri
};

const defaultState: FocusState = {
  totalSeconds: 0,
  streak: 0,
  flowers: [],
};

export async function loadFocusState(): Promise<FocusState> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return defaultState;
  try {
    const parsed = JSON.parse(raw);
    return {
      totalSeconds: Number(parsed.totalSeconds ?? 0),
      streak: Number(parsed.streak ?? 0),
      flowers: Array.isArray(parsed.flowers) ? parsed.flowers : [],
    };
  } catch {
    return defaultState;
  }
}

export async function saveFocusState(state: FocusState) {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}

export function pickRandomFlowerId(): string {
  const pool = ["lotus", "aycicegi", "orkide", "lale", "papatya", "gul"];
  return pool[Math.floor(Math.random() * pool.length)];
}
