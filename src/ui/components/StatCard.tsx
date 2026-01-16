import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "../Text";

export const StatCard: React.FC<{ icon?: string; label: string; value: string | number }> = ({ icon, label, value }) => {
  return (
    <View style={s.card}>
      {icon ? <Text style={s.icon}>{icon}</Text> : null}
      <Text numberOfLines={2} style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  );
};

const s = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 12, alignItems: "center", borderWidth: 1, borderColor: "#eee" },
  icon: { fontSize: 20, marginBottom: 6 },
  label: { fontSize: 12, color: "#6b7280", textAlign: "center" },
  value: { fontSize: 18, fontWeight: "800", marginTop: 6 },
});
