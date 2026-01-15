import React, { useState } from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { Screen } from "../ui/Screen";
import { Text } from "../ui/Text";
import { useTheme } from "../ui/theme/ThemeProvider";

export const GardenScreen: React.FC = () => {
  const { colors } = useTheme();
  const [level, setLevel] = useState<number>(1);
  const [xp, setXp] = useState<number>(0);

  const plants = [
    { id: "p1", name: "Tohum", locked: false },
    { id: "p2", name: "Fidan", locked: true },
    { id: "p3", name: "Çiçek", locked: true },
  ];

  const addXp = () => {
    setXp((prev) => {
      const next = prev + 10;
      if (next >= 100) {
        setLevel((l) => l + 1);
        return next - 100;
      }
      return next;
    });
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text variant="h2" style={{ marginBottom: 8 }}>Bahçe</Text>
        <Text variant="muted" style={{ marginBottom: 12 }}>Odak yaptıkça bahçen büyür.</Text>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={styles.smallLabel}>Seviye</Text>
          <Text style={styles.levelText}>Seviye {level}</Text>
          <Text variant="muted" style={{ marginTop: 6 }}>{`XP ${xp}/100`}</Text>
        </View>

        <View style={{ height: 12 }} />

        <View style={styles.cardRow}>
          {plants.map((p) => (
            <View key={p.id} style={[styles.plantCard, { backgroundColor: colors.card }]}>
              <Text style={{ fontWeight: "700" }}>{p.name}</Text>
              <Text variant="muted" style={{ marginTop: 8 }}>{p.locked ? "Kilidi açık değil" : "Erişilebilir"}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 16 }} />

        <Pressable
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            addXp();
            Alert.alert("XP kazanıldı", "+10 XP");
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Odakla XP kazan</Text>
        </Pressable>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  smallLabel: { fontSize: 13, color: "#6b7280" },
  levelText: { fontSize: 28, fontWeight: "800", marginTop: 6 },
  cardRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  plantCard: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  primaryBtn: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
});
