import React from "react";
import {
  Text as RNText,
  TextProps,
  StyleSheet,
  Platform,
} from "react-native";
import { useTheme } from "../theme/ThemeProvider";

type Variant = "h1" | "h2" | "body" | "muted";

export const Text: React.FC<TextProps & { variant?: Variant }> = ({
  children,
  style,
  variant = "body",
  ...rest
}) => {
  const { colors } = useTheme();

  const baseStyles = {
    h1: { fontSize: 22, fontWeight: "700", color: colors.text },
    h2: { fontSize: 18, fontWeight: "600", color: colors.text },
    body: { fontSize: 14, color: colors.text },
    muted: { fontSize: 13, color: colors.muted },
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
