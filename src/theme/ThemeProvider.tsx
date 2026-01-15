import React, { createContext, useContext } from "react";
import { StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "./tokens";

type Theme = {
  colors: typeof colors;
};

const ThemeContext = createContext<Theme>({ colors });

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ colors }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
