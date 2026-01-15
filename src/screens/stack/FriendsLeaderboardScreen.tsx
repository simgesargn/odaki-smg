import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { useTheme } from "../../ui/theme/ThemeProvider";

export const FriendsLeaderboardScreen: React.FC = () => {
  const { colors } = useTheme();
  const [range, setRange] = useState<"weekly" | "monthly" | "all">("weekly");

  return (
    <Screen style={{ padding: 16 }}>
      {/* fake gradient header */}
      <View style={styles.gradientHeader}>
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 20 }}>Lider Tablosu</Text>
        <Text variant="muted" style={{ color: "#fff", marginTop: 6 }}>
          Arkadaşlarınla performans karşılaştırması
        </Text>
      </View>

      {/* segmented */}
      <View style={{ flexDirection: "row", marginTop: 14, gap: 8 }}>
        <Pressable
          style={[styles.segmentPill, range === "weekly" ? { backgroundColor: colors.primary } : { backgroundColor: "#F3F4F6" }]}
          onPress={() => setRange("weekly")}
        >
          <Text style={range === "weekly" ? styles.segmentTextActive : styles.segmentText}>Haftalık</Text>
        </Pressable>
        <Pressable
          style={[styles.segmentPill, range === "monthly" ? { backgroundColor: colors.primary } : { backgroundColor: "#F3F4F6" }]}
          onPress={() => setRange("monthly")}
        >
          <Text style={range === "monthly" ? styles.segmentTextActive : styles.segmentText}>Aylık</Text>
        </Pressable>
        <Pressable
          style={[styles.segmentPill, range === "all" ? { backgroundColor: colors.primary } : { backgroundColor: "#F3F4F6" }]}
          onPress={() => setRange("all")}
        >
          <Text style={range === "all" ? styles.segmentTextActive : styles.segmentText}>Tüm Zamanlar</Text>
        </Pressable>
      </View>

      {/* sample leader row */}
      <View style={[styles.card, { marginTop: 14, backgroundColor: colors.card }]}>
        <View style={styles.leaderRow}>
          <Text style={{ fontSize: 18 }}>👑</Text>
          <View style={{ width: 12 }} />
          <View style={[styles.avatar, { backgroundColor: "#F0E9FF" }]}>
            <Text style={{ fontWeight: "700" }}>S</Text>
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ fontWeight: "700" }}>Simge Sargın</Text>
            <Text variant="muted" style={{ marginTop: 4 }}>
              Sen
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontWeight: "700" }}>0 görev · 0.0 saat · 0 puan</Text>
          </View>
        </View>

        <View style={{ height: 12 }} />

        <View style={[styles.infoCard, { backgroundColor: "#fff" }]}>
          <Text style={{ fontWeight: "700" }}>Puan Hesaplama</Text>
          <Text variant="muted" style={{ marginTop: 8 }}>
            Puanlar odak süreleri ve tamamlanan görevlerden hesaplanır. (Detaylar yakında)
          </Text>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  gradientHeader: {
    padding: 18,
    borderRadius: 12,
    backgroundColor: "#7B2CBF",
    // faux gradient look by overlay
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    elevation: 3,
  },
  segmentPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  segmentText: { color: "#111", fontWeight: "600" },
  segmentTextActive: { color: "#fff", fontWeight: "700" },

  card: {
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    elevation: 2,
  },
  leaderRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },

  infoCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    marginTop: 8,
  },
});
