import React from "react";
import {
  Text as RNText,
  TextProps,
  StyleSheet,
  Platform,
} from "react-native";
import { useTheme } from "./ThemeProvider";

type Variant = "h1" | "h2" | "body" | "muted";

export const Text: React.FC<TextProps & { variant?: Variant }> = ({
  children,
  style,
  variant = "body",
  ...rest
}) => {
  // theme is the ThemeShape returned by useTheme()
  const theme = useTheme();
  const safeTheme = theme;

  const baseStyles = {
    h1: { fontSize: 22, fontWeight: "700", color: safeTheme.text },
    h2: { fontSize: 18, fontWeight: "600", color: safeTheme.text },
    body: { fontSize: 14, color: safeTheme.text },
    muted: { fontSize: 13, color: safeTheme.subtext },
  }[variant];

  //  FONT SIZE NEYSE LINE HEIGHT OTOMATİK BÜYÜR
  const flattened = StyleSheet.flatten([baseStyles, style]);
  const fontSize = typeof flattened?.fontSize === "number" ? flattened.fontSize : 14;
  const lineHeight = Math.ceil(fontSize * 1.3);

  return (
    <RNText
      {...rest}
      style={[flattened, { lineHeight }]}
      includeFontPadding={false}
      {...(Platform.OS === "android"
        ? { textAlignVertical: "center" as const }
        : {})}
    >
      {children}
    </RNText>
  );
};
