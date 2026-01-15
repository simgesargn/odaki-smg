import { getItem, setItem } from "../storage/local";

export type FlowerType = "normal" | "lotus" | "sunflower" | "orchid";

export type Flower = {
  id: string;
  name: string;      // human readable, e.g. "Çiçek", "Lotus" (string)
  type: FlowerType;  // canonical type
  earnedAt: number;  // ms
  minutes: number;
};

export type FocusStats = {
  totalSeconds: number;
  streak: number;
  flowersEarned: number;
};

type FocusState = {
  stats: FocusStats;
  flowers: Flower[];
  selectedMinutes: number;
  session: {
    running: boolean;
    startedAt: number | null;
    durationSec: number;
    remainingSec: number;
    warningsUsed: number; // settings simülasyonu için
  };
};

const KEY_STATE = "focus_state_v1";

const defaultState = (): FocusState => ({
  stats: { totalSeconds: 0, streak: 0, flowersEarned: 0 },
  flowers: [],
  selectedMinutes: 25,
  session: {
    running: false,
    startedAt: null,
    durationSec: 25 * 60,
    remainingSec: 25 * 60,
    warningsUsed: 0,
  },
});

let mem: FocusState | null = null;

export async function loadFocusState(): Promise<FocusState> {
  if (mem) return mem;
  const raw = await getItem(KEY_STATE);
  if (!raw) {
    mem = defaultState();
    await setItem(KEY_STATE, JSON.stringify(mem));
    return mem;
  }
  try {
    mem = JSON.parse(raw) as FocusState;
    // küçük normalize
    if (!mem.session) mem = defaultState();
    return mem!;
  } catch {
    mem = defaultState();
    await setItem(KEY_STATE, JSON.stringify(mem));
    return mem;
  }
}

async function save(state: FocusState) {
  mem = state;
  await setItem(KEY_STATE, JSON.stringify(state));
}

export async function setSelectedMinutes(minutes: number) {
  const st = await loadFocusState();
  const next: FocusState = {
    ...st,
    selectedMinutes: minutes,
    session: {
      ...st.session,
      durationSec: minutes * 60,
      remainingSec: minutes * 60,
      startedAt: st.session.running ? st.session.startedAt : null,
      running: st.session.running,
    },
  };
  await save(next);
  return next;
}

export async function startSession() {
  const st = await loadFocusState();
  const dur = st.selectedMinutes * 60;
  const next: FocusState = {
    ...st,
    session: {
      running: true,
      startedAt: Date.now(),
      durationSec: dur,
      remainingSec: dur,
      warningsUsed: 0,
    },
  };
  await save(next);
  return next;
}

export async function tickSession(nowMs: number) {
  const st = await loadFocusState();
  if (!st.session.running || !st.session.startedAt) return st;

  const elapsed = Math.max(0, Math.floor((nowMs - st.session.startedAt) / 1000));
  const remaining = Math.max(0, st.session.durationSec - elapsed);

  let next = st;
  if (remaining !== st.session.remainingSec) {
    next = { ...st, session: { ...st.session, remainingSec: remaining } };
    await save(next);
  }

  // otomatik bitiş
  if (remaining === 0) {
    next = await completeSession("tohum");
  }
  return next;
}

export async function addWarningOrFail(maxWarnings: number) {
  const st = await loadFocusState();
  if (!st.session.running) return st;

  const used = st.session.warningsUsed + 1;

  if (used >= maxWarnings) {
    return failSession();
  }

  const next: FocusState = {
    ...st,
    session: { ...st.session, warningsUsed: used },
  };
  await save(next);
  return next;
}

export async function failSession() {
  const st = await loadFocusState();
  const next: FocusState = {
    ...st,
    stats: { ...st.stats, streak: 0 },
    session: {
      running: false,
      startedAt: null,
      durationSec: st.selectedMinutes * 60,
      remainingSec: st.selectedMinutes * 60,
      warningsUsed: 0,
    },
  };
  await save(next);
  return next;
}

export async function completeSession(type: string = "normal") {
  const st = await loadFocusState();
  const minutes = st.selectedMinutes;

  // map incoming type to canonical
  let canonical: FlowerType = "normal";
  if (typeof type === "string") {
    const t = type.toLowerCase();
    if (t.includes("lotus")) canonical = "lotus";
    else if (t.includes("ayçi") || t.includes("ayci") || t.includes("sunflower")) canonical = "sunflower";
    else if (t.includes("orkide") || t.includes("orchid")) canonical = "orchid";
    else canonical = "normal";
  }

  // For non-premium flows we force "normal" (so premium won't be auto-added)
  const finalType: FlowerType = canonical === "lotus" || canonical === "sunflower" || canonical === "orchid" ? canonical : "normal";
  const name = finalType === "lotus" ? "Lotus" : finalType === "sunflower" ? "Ayçiçeği" : finalType === "orchid" ? "Orkide" : "Çiçek";

  const flower: Flower = {
    id: `f_${Date.now()}`,
    name,
    type: finalType,
    earnedAt: Date.now(),
    minutes,
  };

  const addSeconds = minutes * 60;

  const next: FocusState = {
    ...st,
    flowers: [flower, ...st.flowers],
    stats: {
      totalSeconds: st.stats.totalSeconds + addSeconds,
      streak: st.stats.streak + 1,
      flowersEarned: st.stats.flowersEarned + 1,
    },
    session: {
      running: false,
      startedAt: null,
      durationSec: minutes * 60,
      remainingSec: minutes * 60,
      warningsUsed: 0,
    },
  };
  await save(next);
  return next;
}

export async function resetAllFocus() {
  const next = defaultState();
  await save(next);
  return next;
}
