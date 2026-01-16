import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { theme, colors } from "./theme";

type Props = {
  children: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
};

export const Chip: React.FC<Props> = ({ children, selected = false, onPress }) => {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected ? { backgroundColor: theme.colors.primary2, borderColor: theme.colors.primary } : undefined]}>
      <Text style={selected ? { color: "#fff", fontWeight: "700" } : { color: theme.colors.text }}>{children}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
