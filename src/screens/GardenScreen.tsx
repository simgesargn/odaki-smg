import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { loadFocusState } from "../focus/focusStore";

function titleFor(id: string) {
  switch (id) {
    case "lotus":
      return "Lotus";
    case "aycicegi":
      return "Ayçiçeği";
    case "orkide":
      return "Orkide";
    case "lale":
      return "Lale";
    case "papatya":
      return "Papatya";
    case "gul":
      return "Gül";
    default:
      return id;
  }
}

function emojiFor(id: string) {
  switch (id) {
    case "lotus":
      return "🪷";
    case "aycicegi":
      return "🌻";
    case "orkide":
      return "🌸";
    case "lale":
      return "🌷";
    case "papatya":
      return "🌼";
    case "gul":
      return "🌹";
    default:
      return "🌱";
  }
}

export const GardenScreen: React.FC = () => {
  const [flowers, setFlowers] = useState<string[]>([]);

  const refresh = useCallback(() => {
    (async () => {
      try {
        const state = await loadFocusState();
        setFlowers(state.flowers ?? []);
      } catch {
        setFlowers([]);
      }
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // aynı çiçeklerden çok olursa “kümelenmiş” göstermek için count map
  const counts = flowers.reduce<Record<string, number>>((acc, id) => {
    acc[id] = (acc[id] ?? 0) + 1;
    return acc;
  }, {});

  const uniqueIds = Object.keys(counts);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.h1}>Bahçem</Text>
      <Text style={styles.sub}>Kazandığın çiçekler burada görünür.</Text>

      <View style={styles.grid}>
        {uniqueIds.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyTitle}>Henüz çiçeğin yok</Text>
            <Text style={styles.emptySub}>
              Odak oturumu tamamlayınca burada çiçeklerin birikecek.
            </Text>
          </View>
        ) : (
          uniqueIds.map((id) => (
            <View key={id} style={styles.card}>
              <Text style={styles.emoji}>{emojiFor(id)}</Text>
              <Text style={styles.name}>{titleFor(id)}</Text>
              <Text style={styles.count}>x{counts[id]}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 28 },
  h1: { fontSize: 28, fontWeight: "800", marginBottom: 6 },
  sub: { color: "#666", marginBottom: 16 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  card: {
    width: "47%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEE",
    marginBottom: 12,
  },
  emoji: { fontSize: 36, marginBottom: 8 },
  name: { fontWeight: "800", marginBottom: 4 },
  count: { color: "#666" },

  empty: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#EEE",
    alignItems: "center",
  },
  emptyEmoji: { fontSize: 44, marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "800", marginBottom: 6 },
  emptySub: { color: "#666", textAlign: "center" },
});
