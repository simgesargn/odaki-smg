import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text } from "../Text";

export const EmptyStateCard: React.FC<{ title: string; subtitle?: string; cta?: { label: string; onPress: () => void } }> = ({ title, subtitle, cta }) => (
  <View style={s.wrap}>
    <Text style={s.title}>{title}</Text>
    {subtitle ? <Text variant="muted" style={s.sub}>{subtitle}</Text> : null}
    {cta ? (
      <Pressable style={s.cta} onPress={cta.onPress}>
        <Text style={{ color: "#fff", fontWeight: "700" }}>{cta.label}</Text>
      </Pressable>
    ) : null}
  </View>
);

const s = StyleSheet.create({
  wrap: { padding: 20, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", borderWidth: 1, borderColor: "#eee" },
  title: { fontWeight: "700", marginBottom: 6 },
  sub: { textAlign: "center" },
  cta: { marginTop: 12, backgroundColor: "#6C5CE7", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
});
