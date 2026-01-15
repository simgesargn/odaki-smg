import React from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../theme/ThemeProvider";

export const Screen: React.FC<{ children?: React.ReactNode; gradient?: boolean; style?: any }> = ({
  children,
  gradient,
  style,
}) => {
  const { colors } = useTheme();
  if (gradient) {
    return (
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={[styles.flex, style]}>
        <SafeAreaView style={styles.flex}>{children}</SafeAreaView>
      </LinearGradient>
    );
  }
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }, style]}>
      <View style={styles.inner}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  inner: { flex: 1, padding: 16 },
});
