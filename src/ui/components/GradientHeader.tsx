import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import theme from "../theme";

type Props = {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  style?: any;
};

export const GradientHeader: React.FC<Props> = ({ title, subtitle, left, right, style }) => {
  return (
    <LinearGradient colors={[theme.colors.primary, theme.colors.primary2]} style={[styles.wrap, style]}>
      <View style={styles.inner}>
        <View style={styles.side}>{left ?? null}</View>
        <View style={styles.center}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.side}>{right ?? null}</View>
      </View>
    </LinearGradient>
  );
};

export default GradientHeader;

const styles = StyleSheet.create({
  wrap: { paddingVertical: 18, paddingHorizontal: 16, borderRadius: theme.radius.md },
  inner: { flexDirection: "row", alignItems: "center" },
  side: { width: 44, alignItems: "center" },
  center: { flex: 1, alignItems: "center" },
  title: { color: "#fff", fontSize: 18, fontWeight: "800" },
  subtitle: { color: "rgba(255,255,255,0.9)", fontSize: 12, marginTop: 4 },
});
