import React from "react";
import { SafeAreaView, View, StyleSheet, ScrollView, ViewProps } from "react-native";
import { useTheme } from "./ThemeProvider";

type Props = React.PropsWithChildren<{ scroll?: boolean; header?: React.ReactNode } & ViewProps>;

export const Screen: React.FC<Props> = ({ children, scroll = false, header, style, ...rest }) => {
  const safeTheme = useTheme();

  const Container: any = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: safeTheme.bg }]}>
      {header ? <View style={{ paddingHorizontal: safeTheme.spacing.lg, paddingTop: safeTheme.spacing.lg }}>{header}</View> : null}
      <Container
        style={[{ flex: 1, paddingHorizontal: safeTheme.spacing.lg, paddingTop: safeTheme.spacing.md, backgroundColor: safeTheme.bg }, style]}
        contentContainerStyle={scroll ? { padding: safeTheme.spacing.lg } : undefined}
        {...rest}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
};

export default Screen;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  // dynamic spacing/bg applied inline in render to avoid module-scope theme access
});
