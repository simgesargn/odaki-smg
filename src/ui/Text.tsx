import React from "react";
import { Text as RNText, TextProps, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeProvider";

export const Text: React.FC<TextProps & { variant?: "h1" | "h2" | "body" | "muted" }> = ({
  children,
  style,
  variant = "body",
  ...rest
}) => {
  const { colors } = useTheme();
  const stylesVar = {
    h1: { fontSize: 22, fontWeight: "700", color: colors.card === "#fff" ? colors.text : colors.text },
    h2: { fontSize: 18, fontWeight: "600", color: colors.text },
    body: { fontSize: 14, color: colors.text },
    muted: { fontSize: 13, color: colors.muted },
  } as any;
  return (
    <RNText style={[styles.base, stylesVar[variant], style]} {...rest}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: { lineHeight: 20 },
});
