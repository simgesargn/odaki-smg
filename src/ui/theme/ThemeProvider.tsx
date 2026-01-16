import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme as themeObj, light, dark, ThemeColors } from "../theme";

const KEY_THEME_MODE = "odaki_theme_mode_v1"; // "light" | "dark"
type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeColors;
  spacing: any;
  space: any;
  radius: any;
  radii: any;
  shadow: any;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
};

const DEFAULT: ThemeContextValue = {
  mode: "light",
  colors: light.colors,
  spacing: light.spacing,
  space: light.space,
  radius: light.radius,
  radii: light.radii,
  shadow: light.shadow ?? light.shadows?.md,
  setMode: () => {},
  toggle: () => {},
};

const ThemeContext = createContext<ThemeContextValue>(DEFAULT);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>("light");
  const [colors, setColors] = useState<ThemeColors>(light.colors);
  const [spacing, setSpacing] = useState<any>(light.spacing);
  const [space, setSpace] = useState<any>(light.space);
  const [radius, setRadius] = useState<any>(light.radius);
  const [radii, setRadii] = useState<any>(light.radii);
  const [shadow, setShadow] = useState<any>(light.shadow ?? light.shadows?.md);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY_THEME_MODE);
        const m = (raw === "dark" ? "dark" : "light") as ThemeMode;
        if (!mounted) return;
        setModeState(m);
        const src = m === "dark" ? dark : light;
        setColors(src.colors);
        setSpacing(src.spacing);
        setSpace(src.space);
        setRadius(src.radius);
        setRadii(src.radii);
        setShadow(src.shadow ?? src.shadows?.md);
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setMode = async (m: ThemeMode) => {
    setModeState(m);
    const src = m === "dark" ? dark : light;
    setColors(src.colors);
    setSpacing(src.spacing);
    setSpace(src.space);
    setRadius(src.radius);
    setRadii(src.radii);
    setShadow(src.shadow ?? src.shadows?.md);
    try {
      await AsyncStorage.setItem(KEY_THEME_MODE, m);
    } catch {
      // ignore
    }
  };

  const toggle = () => setMode(mode === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ mode, colors, spacing, space, radius, radii, shadow, setMode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  return useContext(ThemeContext);
}
