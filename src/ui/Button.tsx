import React from "react";
import { Pressable, Text as RNText, StyleSheet, ActivityIndicator } from "react-native";
import { theme, colors } from "./theme";

type Props = {
  title: string;
  variant?: "primary" | "secondary" | "ghost";
  onPress?: () => void;
  full?: boolean;
  loading?: boolean;
  disabled?: boolean;
};

export const Button: React.FC<Props> = ({ title, variant = "primary", onPress, full = false, loading, disabled }) => {
  const bg = variant === "primary" ? colors.primary : variant === "secondary" ? "transparent" : "transparent";
  const fg = variant === "primary" ? "#fff" : colors.primary;
  const bordered = variant === "secondary";
  return (
    <Pressable onPress={onPress} style={[
      styles.btn,
      { backgroundColor: bg, borderColor: bordered ? colors.primary : "transparent", borderWidth: bordered ? 1 : 0, borderRadius: theme.radius.md },
      full ? styles.full : undefined,
      disabled ? styles.disabled : undefined
    ]}>
      {loading ? <ActivityIndicator color={fg} /> : <RNText style={{ color: fg, fontWeight: "700" }}>{title}</RNText>}
    </Pressable>
  );
};

export default Button;

const styles = StyleSheet.create({
  btn: { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md, alignItems: "center", justifyContent: "center" },
  full: { alignSelf: "stretch" },
  disabled: { opacity: 0.6 },
});
