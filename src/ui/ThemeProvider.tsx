import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTheme, ThemeShape } from "./theme";

const KEY_THEME = "odaki_theme_mode_v1";

type ThemeActions = {
  modeName: "light" | "dark";
  setMode: (m: "light" | "dark") => void;
  toggle: () => void;
};

const defaultMode: "light" | "dark" = "light";
const defaultThemeObj = getTheme(defaultMode);

// Contexts:
// - ThemeContext: provides ThemeShape (colors, spacing, radius, shadow, ...)
const ThemeContext = createContext<ThemeShape>(defaultThemeObj);
// - ThemeActionsContext: provides controls (modeName, setMode, toggle)
const ThemeActionsContext = createContext<ThemeActions>({
  modeName: defaultMode,
  setMode: () => {},
  toggle: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modeName, setModeName] = useState<"light" | "dark">(defaultMode);
  const [themeObj, setThemeObj] = useState<ThemeShape>(getTheme(defaultMode));

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY_THEME);
        const m = raw === "dark" ? "dark" : "light";
        if (!mounted) return;
        setModeName(m);
        setThemeObj(getTheme(m));
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setMode = async (m: "light" | "dark") => {
    setModeName(m);
    const next = getTheme(m);
    setThemeObj(next);
    try {
      await AsyncStorage.setItem(KEY_THEME, m);
    } catch {
      // ignore
    }
  };

  const toggle = () => setMode(modeName === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={themeObj}>
      <ThemeActionsContext.Provider value={{ modeName, setMode, toggle }}>
        {children}
      </ThemeActionsContext.Provider>
    </ThemeContext.Provider>
  );
};

// Hooks for consumers
export function useTheme(): ThemeShape {
  // always returns a theme object (never undefined)
  return useContext(ThemeContext) ?? defaultThemeObj;
}
export function useThemeActions() {
  return useContext(ThemeActionsContext);
}
