import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { colors, theme } from "../theme";

type Props = { children: React.ReactNode; selected?: boolean; onPress?: () => void };

export const Chip: React.FC<Props> = ({ children, selected = false, onPress }) => {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected ? { backgroundColor: colors.primary, borderColor: colors.primary } : undefined]}>
      <Text style={selected ? { color: "#fff", fontWeight: "700" } : { color: colors.text }}>{children}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
