import React from "react";
import { TextInput, StyleSheet, View } from "react-native";
import { useTheme } from "./ThemeProvider";
// getTheme importu kaldırıldı; useTheme ile tek kaynak kullanılacak

export const Input: React.FC<
  React.ComponentProps<typeof TextInput> & { containerStyle?: any }
> = ({ containerStyle, style, ...rest }) => {
  const themeCtx = useTheme();
  const theme = (themeCtx as any).theme ?? (themeCtx as any);
  const safeTheme = theme;
  const pad = safeTheme.spacing?.md ?? 12;

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        style={[
          styles.input,
          {
            padding: pad,
            borderRadius: safeTheme.radius?.sm ?? 10,
            backgroundColor: safeTheme.card,
            color: safeTheme.text,
          },
          style,
        ]}
        {...rest}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 6 },
  input: {
    fontSize: 15,
    elevation: 1,
  },
});
