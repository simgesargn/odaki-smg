import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "./theme";
const colors = theme.colors;

type Props = { icon?: string; value: string | number; label?: string };

export const StatPill: React.FC<Props> = ({ icon, value, label }) => {
  return (
    <View style={styles.wrap}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <View style={{ marginLeft: icon ? 8 : 0 }}>
        <Text style={styles.value}>{value}</Text>
        {label ? <Text style={styles.label}>{label}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center" },
  icon: { fontSize: 18 },
  value: { fontSize: 18, fontWeight: "800", color: theme.colors.text },
  label: { fontSize: 12, color: theme.colors.muted },
});
