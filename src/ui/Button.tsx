import React from "react";
import { Pressable, Text as RNText, StyleSheet, ActivityIndicator } from "react-native";
import { theme } from "./theme";

type Props = {
  title: string;
  variant?: "primary" | "secondary" | "ghost";
  onPress?: () => void;
  full?: boolean;
  loading?: boolean;
  disabled?: boolean;
};

export const Button: React.FC<Props> = ({ title, variant = "primary", onPress, full = false, loading, disabled }) => {
  const bg =
    variant === "primary" ? theme.colors.primary : variant === "secondary" ? theme.colors.primary2 : "transparent";
  const txtColor = variant === "ghost" ? theme.colors.primary : "#fff";
  return (
    <Pressable onPress={onPress} style={[styles.btn, { backgroundColor: bg }, full ? styles.full : undefined, disabled ? styles.disabled : undefined]}>
      {loading ? <ActivityIndicator color={txtColor} /> : <RNText style={[styles.title, { color: txtColor }]}>{title}</RNText>}
    </Pressable>
  );
};

export default Button;

const styles = StyleSheet.create({
  btn: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontWeight: "700" },
  full: { alignSelf: "stretch" },
  disabled: { opacity: 0.6 },
});
