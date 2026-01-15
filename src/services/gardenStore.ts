import AsyncStorage from "@react-native-async-storage/async-storage";

export type GardenItemType = "seed" | "flower";

export type GardenItem = {
  id: string;
  type: GardenItemType;
  earnedMinutes: number;
  createdAt: number; // ms
};

const KEY = "odaki:garden:v1";

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function getGardenItems(): Promise<GardenItem[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const items = JSON.parse(raw) as GardenItem[];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export async function setGardenItems(items: GardenItem[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
}

export async function addGardenReward(params: {
  earnedMinutes: number;
  type?: GardenItemType;
}) {
  const items = await getGardenItems();
  const next: GardenItem = {
    id: uid(),
    type: params.type ?? "flower",
    earnedMinutes: params.earnedMinutes,
    createdAt: Date.now(),
  };
  const updated = [next, ...items];
  await setGardenItems(updated);
  return next;
}

export async function clearGarden() {
  await AsyncStorage.removeItem(KEY);
}
