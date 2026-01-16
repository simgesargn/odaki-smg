import React from "react";
import { SafeAreaView, View, StyleSheet, ScrollView, ViewProps } from "react-native";
import { theme, colors } from "./theme";

type Props = React.PropsWithChildren<{ scroll?: boolean; header?: React.ReactNode } & ViewProps>;

export const Screen: React.FC<Props> = ({ children, scroll = false, header, style, ...rest }) => {
  const Container: any = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      {header ? <View style={styles.headerSlot}>{header}</View> : null}
      <Container style={[styles.container, style]} contentContainerStyle={scroll ? { padding: theme.spacing.lg } : undefined} {...rest}>
        {children}
      </Container>
    </SafeAreaView>
  );
};

export default Screen;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerSlot: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    backgroundColor: colors.bg,
  },
});
