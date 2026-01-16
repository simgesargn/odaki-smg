import React, { createContext, useContext } from "react";
import { theme as defaultTheme, Theme } from "../ui/theme";

type ContextValue = { theme: Theme };

const ThemeContext = createContext<ContextValue | null>({ theme: defaultTheme });

export const ThemeProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return <ThemeContext.Provider value={{ theme: defaultTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): Theme => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // uygulama doğru sarılmadıysa daha açıklayıcı hata ver
    throw new Error("useTheme must be used within ThemeProvider. Wrap your app with <ThemeProvider>.");
  }
  return ctx.theme;
};
