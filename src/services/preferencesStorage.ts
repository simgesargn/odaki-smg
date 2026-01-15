import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  LANG: "prefs_lang",
  THEME_DARK: "prefs_theme_dark",
  NOTIF_TASKS: "prefs_notif_tasks",
  NOTIF_FOCUS: "prefs_notif_focus",
  NOTIF_ODI: "prefs_notif_odi",
};

export const preferencesStorage = {
  async getLang(): Promise<"tr" | "en"> {
    const v = await AsyncStorage.getItem(KEYS.LANG);
    return (v as "tr" | "en") || "tr";
  },
  async setLang(l: "tr" | "en") {
    await AsyncStorage.setItem(KEYS.LANG, l);
  },

  async getThemeDark(): Promise<boolean> {
    const v = await AsyncStorage.getItem(KEYS.THEME_DARK);
    return v === "1";
  },
  async setThemeDark(b: boolean) {
    await AsyncStorage.setItem(KEYS.THEME_DARK, b ? "1" : "0");
  },

  async getNotifPrefs(): Promise<{ tasks: boolean; focus: boolean; odi: boolean }> {
    const t = await AsyncStorage.getItem(KEYS.NOTIF_TASKS);
    const f = await AsyncStorage.getItem(KEYS.NOTIF_FOCUS);
    const o = await AsyncStorage.getItem(KEYS.NOTIF_ODI);
    return {
      tasks: t !== "0",
      focus: f !== "0",
      odi: o !== "0",
    };
  },
  async setNotifPrefs(p: { tasks?: boolean; focus?: boolean; odi?: boolean }) {
    if (typeof p.tasks === "boolean") await AsyncStorage.setItem(KEYS.NOTIF_TASKS, p.tasks ? "1" : "0");
    if (typeof p.focus === "boolean") await AsyncStorage.setItem(KEYS.NOTIF_FOCUS, p.focus ? "1" : "0");
    if (typeof p.odi === "boolean") await AsyncStorage.setItem(KEYS.NOTIF_ODI, p.odi ? "1" : "0");
  },
};
