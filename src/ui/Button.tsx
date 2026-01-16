import React from "react";
import { Pressable, Text as RNText, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme } from "./ThemeProvider";

type Props = {
  title: string;
  variant?: "primary" | "secondary" | "ghost";
  onPress?: () => void;
  full?: boolean;
  loading?: boolean;
  disabled?: boolean;
};

export const Button: React.FC<Props> = ({ title, variant = "primary", onPress, full = false, loading, disabled }) => {
  const safeTheme = useTheme();
  const bg = variant === "primary" ? safeTheme.primary : "transparent";
  const fg = variant === "primary" ? "#fff" : safeTheme.primary;
  const bordered = variant === "secondary";
  return (
    <Pressable
      onPress={onPress}
      style={[
        { paddingVertical: safeTheme.spacing.sm, paddingHorizontal: safeTheme.spacing.md, alignItems: "center", justifyContent: "center", backgroundColor: bg, borderColor: bordered ? safeTheme.primary : "transparent", borderWidth: bordered ? 1 : 0, borderRadius: safeTheme.radius.md },
        full ? { alignSelf: "stretch" } : undefined,
        disabled ? { opacity: 0.6 } : undefined,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : <RNText style={{ color: fg, fontWeight: "700" }}>{title}</RNText>}
    </Pressable>
  );
};

export default Button;

// styles minimal; dynamic parts applied inline in render
const styles = StyleSheet.create({});
