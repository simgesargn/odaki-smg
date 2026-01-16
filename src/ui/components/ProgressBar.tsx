import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "../theme";

export const ProgressBar: React.FC<{ value: number; height?: number }> = ({ value, height = 6 }) => {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  return (
    <View style={[styles.bg, { height }]}>
      <View style={[styles.fg, { width: `${pct}%`, height, backgroundColor: colors.primary }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  bg: { backgroundColor: "#F1F5F9", borderRadius: 8, overflow: "hidden" },
  fg: { borderRadius: 8 },
});
