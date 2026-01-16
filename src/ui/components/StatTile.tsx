import React from "react";
import { View, Text, StyleSheet } from "react-native";
import theme from "../theme";

type Props = { icon?: string; label: string; value: string | number; style?: any };

export const StatTile: React.FC<Props> = ({ icon, label, value, style }) => (
  <View style={[styles.wrap, style]}>
    <View style={styles.left}>{icon ? <Text style={styles.icon}>{icon}</Text> : null}</View>
    <View style={styles.right}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: theme.radius.md, backgroundColor: theme.colors.card, ...theme.shadow.card },
  left: { marginRight: 12 },
  icon: { fontSize: 22 },
  right: {},
  value: { fontSize: 18, fontWeight: "800", color: theme.colors.text },
  label: { fontSize: 12, color: theme.colors.muted, marginTop: 4 },
});
