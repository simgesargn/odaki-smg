import React from "react";
import { Pressable, Text as RNText, StyleSheet, ActivityIndicator } from "react-native";
import { colors, theme } from "../theme";

type Props = {
  title: string;
  variant?: "primary" | "secondary" | "ghost";
  onPress?: () => void;
  pill?: boolean;
  loading?: boolean;
  full?: boolean;
};

export const Button: React.FC<Props> = ({ title, variant = "primary", onPress, pill = true, loading, full }) => {
  const bg = variant === "primary" ? colors.primary : variant === "secondary" ? "transparent" : "transparent";
  const fg = variant === "primary" ? "#fff" : colors.primary;
  const bordered = variant === "secondary";
  return (
    <Pressable onPress={onPress} style={[
      styles.btn,
      { backgroundColor: bg, borderColor: bordered ? colors.primary : "transparent", borderWidth: bordered ? 1 : 0, borderRadius: pill ? 999 : theme.radius.md },
      full ? styles.full : undefined
    ]}>
      {loading ? <ActivityIndicator color={fg} /> : <RNText style={{ color: fg, fontWeight: "700" }}>{title}</RNText>}
    </Pressable>
  );
};

export default Button;

const styles = StyleSheet.create({
  btn: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  full: { alignSelf: "stretch" },
});
