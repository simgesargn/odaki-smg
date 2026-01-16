import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Text } from "../Text";

export const PremiumBanner: React.FC<{ onPress?: () => void }> = ({ onPress }) => (
  <View style={s.wrap}>
    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
      <Text style={{ fontSize: 20, marginRight: 10 }}>⭐</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: "700" }}>Gelişmiş istatistikler Premium'da</Text>
        <Text variant="muted" style={{ marginTop: 4 }}>Detaylı analizler ve özel çiçekler.</Text>
      </View>
    </View>
    <Pressable onPress={onPress} style={s.btn}>
      <Text style={{ color: "#fff", fontWeight: "700" }}>Premium</Text>
    </Pressable>
  </View>
);

const s = StyleSheet.create({
  wrap: { backgroundColor: "#fff", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#eee", flexDirection: "row", alignItems: "center" },
  btn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: "#6C5CE7" },
});
