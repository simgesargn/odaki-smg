import AsyncStorage from "@react-native-async-storage/async-storage";

export async function setItem<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getItem<T>(key: string, defaultValue?: T): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return defaultValue === undefined ? null : defaultValue;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function removeItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export async function setString(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(key, value);
}

export async function getString(key: string, defaultValue?: string): Promise<string | null> {
  const v = await AsyncStorage.getItem(key);
  if (v === null) return defaultValue === undefined ? null : defaultValue;
  return v;
}

export async function setBool(key: string, value: boolean): Promise<void> {
  await AsyncStorage.setItem(key, value ? "1" : "0");
}

export async function getBool(key: string, defaultValue?: boolean): Promise<boolean> {
  const v = await AsyncStorage.getItem(key);
  if (v === null) return defaultValue === undefined ? false : defaultValue;
  return v === "1";
}

export async function remove(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}
