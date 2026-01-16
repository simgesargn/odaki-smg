import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../ui/Text";
import { useNavigation } from "@react-navigation/native";

export const GardenScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const items = [
    { id: "g1", label: "Lotus", emoji: "🪷" },
    { id: "g2", label: "Ayçiçeği", emoji: "🌻" },
    { id: "g3", label: "Orkide", emoji: "🌸" },
    { id: "g4", label: "Tohum", emoji: "🌱" },
  ];
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => nav.goBack()} style={styles.back}><Text>Geri</Text></Pressable>
        <Text variant="h2">Bahçem</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={{ padding: 16 }}>
        {items.map((it) => (
          <View key={it.id} style={styles.card}>
            <Text style={{ fontSize: 28 }}>{it.emoji}</Text>
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontWeight: "700" }}>{it.label}</Text>
              <Text variant="muted">Kazandığın ödüller burada olacak.</Text>
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  back: { padding: 8 },
  card: { flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: "#fff", borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: "#eee" },
});
