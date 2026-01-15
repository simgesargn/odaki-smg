import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Types
 */
export type FocusStats = {
  totalSeconds: number;
  streakDays: number;
  flowersEarned: number;
  lastCompletedAt?: number; // ms epoch
};

export type FocusSessionState = {
  isRunning: boolean;
  endsAt?: number; // ms epoch
  durationMinutes: number;
  startedAt?: number;
};

export type FlowerType = "default" | "lotus" | "sunflower" | "orchid";

export type Flower = {
  id: string;
  type: FlowerType;
  earnedAt: number; // ms
};

export type FocusSettingsLocal = {
  allowedApps: string[];
  blockedApps: string[];
  freeLimit: number;
};

/**
 * Storage keys
 */
const KEY_STATS = "odaki_focus_stats_v1";
const KEY_SESSION = "odaki_focus_session_v1";
const KEY_FLOWERS = "odaki_garden_flowers_v1";
const KEY_SETTINGS = "odaki_focus_settings_v1";

/**
 * Defaults
 */
export const DEFAULT_FOCUS_STATS: FocusStats = {
  totalSeconds: 0,
  streakDays: 0,
  flowersEarned: 0,
};

export const DEFAULT_FOCUS_SESSION: FocusSessionState = {
  isRunning: false,
  durationMinutes: 25,
};

export const DEFAULT_FOCUS_SETTINGS: FocusSettingsLocal = {
  allowedApps: ["Telefon", "Notlar", "Takvim"],
  blockedApps: ["Mesajlar", "Instagram", "TikTok", "YouTube", "X / Twitter", "Facebook", "WhatsApp", "Snapchat", "Telegram"],
  freeLimit: 3,
};

/**
 * Helpers
 */
function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatMMSS(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export function getTodayKey(ts: number = Date.now()): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Storage helpers (generic)
 */
async function safeGet<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

async function safeSet<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore write errors
  }
}

/**
 * Focus stats
 */
export async function loadFocusStats(): Promise<FocusStats> {
  return safeGet<FocusStats>(KEY_STATS, DEFAULT_FOCUS_STATS);
}

export async function saveFocusStats(s: FocusStats): Promise<void> {
  await safeSet<FocusStats>(KEY_STATS, s);
}

/**
 * When a focus session completes, update stats according to streak rule.
 * - If lastCompletedAt is same day => streak unchanged
 * - If lastCompletedAt was yesterday => streakDays += 1
 * - Else => streakDays = 1
 *
 * This helper both updates and persists FocusStats.
 */
export async function addCompletedFocusSession(minutes: number): Promise<FocusStats> {
  const stats = await loadFocusStats();
  const now = Date.now();
  const todayKey = getTodayKey(now);
  const lastKey = stats.lastCompletedAt ? getTodayKey(stats.lastCompletedAt) : null;

  let newStreak = 1;
  if (lastKey === todayKey) {
    newStreak = stats.streakDays || 1; // same day, unchanged (keep at least 1)
  } else if (lastKey) {
    // compute yesterday key
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = getTodayKey(yesterday.getTime());
    if (lastKey === yesterdayKey) {
      newStreak = (stats.streakDays || 0) + 1;
    } else {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  const addedSec = Math.round(Math.max(0, minutes) * 60);
  const newStats: FocusStats = {
    totalSeconds: (stats.totalSeconds || 0) + addedSec,
    streakDays: newStreak,
    flowersEarned: stats.flowersEarned || 0,
    lastCompletedAt: now,
  };

  await saveFocusStats(newStats);
  return newStats;
}

/**
 * Focus session state
 */
export async function loadFocusSession(): Promise<FocusSessionState> {
  return safeGet<FocusSessionState>(KEY_SESSION, DEFAULT_FOCUS_SESSION);
}

export async function saveFocusSession(s: FocusSessionState): Promise<void> {
  await safeSet<FocusSessionState>(KEY_SESSION, s);
}

export async function clearFocusSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY_SESSION);
  } catch {
    // ignore
  }
}

/**
 * Flowers store (garden)
 */
export async function loadFlowers(): Promise<Flower[]> {
  return safeGet<Flower[]>(KEY_FLOWERS, []);
}

export async function addFlower(f: Omit<Flower, "id">): Promise<Flower> {
  const list = await loadFlowers();
  const next: Flower = {
    id: uid(),
    type: f.type,
    earnedAt: f.earnedAt || Date.now(),
  };
  const updated = [next, ...list];
  await safeSet<Flower[]>(KEY_FLOWERS, updated);

  // also increment flowersEarned in stats
  try {
    const stats = await loadFocusStats();
    stats.flowersEarned = (stats.flowersEarned || 0) + 1;
    await saveFocusStats(stats);
  } catch {
    // ignore
  }

  return next;
}

/**
 * Focus settings
 */
export async function loadFocusSettings(): Promise<FocusSettingsLocal> {
  return safeGet<FocusSettingsLocal>(KEY_SETTINGS, DEFAULT_FOCUS_SETTINGS);
}

export async function saveFocusSettings(s: FocusSettingsLocal): Promise<void> {
  await safeSet<FocusSettingsLocal>(KEY_SETTINGS, s);
}
