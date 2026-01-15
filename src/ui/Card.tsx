import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeProvider";

export const Card: React.FC<{ children?: React.ReactNode; style?: any }> = ({ children, style }) => {
  const { colors } = useTheme();
  return <View style={[styles.card, { backgroundColor: colors.card }, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
});
