import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeMode = "light" | "dark";

type ThemeColors = {
  background: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  danger: string;
};

type ThemeCtx = {
  mode: ThemeMode;
  colors: ThemeColors;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
};

const THEME_KEY = "odaki_theme_mode";

const lightColors: ThemeColors = {
  background: "#F6F7FB",
  card: "#FFFFFF",
  text: "#141416",
  muted: "#7A7F87",
  border: "#E6E8EE",
  primary: "#6C63FF",
  danger: "#E53935",
};

const darkColors: ThemeColors = {
  background: "#0F1115",
  card: "#171A21",
  text: "#F4F6FA",
  muted: "#A5ADBA",
  border: "#2A2F3A",
  primary: "#8C86FF",
  danger: "#FF5A5F",
};

const ThemeContext = createContext<ThemeCtx | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>("light");

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved === "light" || saved === "dark") setModeState(saved);
      } catch {
        // ignore
      }
    })();
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(THEME_KEY, m).catch(() => {});
  };

  const toggle = () => setMode(mode === "dark" ? "light" : "dark");

  const colors = useMemo(() => (mode === "dark" ? darkColors : lightColors), [mode]);

  const value = useMemo(() => ({ mode, colors, setMode, toggle }), [mode, colors]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
