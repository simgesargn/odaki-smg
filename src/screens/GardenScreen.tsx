import React, { useCallback, useState } from "react";
import { View, Pressable, FlatList, StyleSheet, ScrollView } from "react-native";
import { Screen } from "../ui/Screen";
import { Text } from "../ui/Text";
import { useTheme } from "../ui/theme/ThemeProvider";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Routes } from "../navigation/routes";
import { loadFocusState } from "../focus/focusStore";
import { FLOWERS, normalizeFlowerId, formatFlowerTitle, flowerEmoji, type FlowerId } from "../focus/flowers";

export const GardenScreen: React.FC = () => {
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const [flowers, setFlowers] = useState<Array<{ id: string; name: string; type: FlowerId; earnedAt?: number }>>([]);

  const refresh = useCallback(() => {
    (async () => {
      try {
        const state = await loadFocusState();
        const raw = Array.isArray(state.flowers) ? state.flowers : [];

        // normalize entries to objects: { id, name, type, earnedAt? }
        const normalized = raw.map((f: any, idx: number) => {
          if (!f) return { id: `f_missing_${idx}`, name: "Çiçek", type: "default" as FlowerId };
          if (typeof f === "string") {
            const fid = normalizeFlowerId(f);
            return { id: `f_${idx}_${fid}`, name: formatFlowerTitle(fid), type: fid, earnedAt: undefined };
          }
          if (typeof f === "object") {
            const name = typeof f.name === "string" ? f.name : (typeof f.title === "string" ? f.title : "Çiçek");
            const type = normalizeFlowerId(f.type ?? name);
            const id = typeof f.id === "string" && f.id.length > 0 ? f.id : `f_${idx}_${type}`;
            return { id, name, type, earnedAt: f.earnedAt };
          }
          return { id: `f_${idx}`, name: "Çiçek", type: "default" as FlowerId };
        });

        setFlowers(normalized);
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

  // group by type/name
  const counts = flowers.reduce<Record<string, { item: any; count: number }>>((acc, it) => {
    const key = it.name || it.type || "Çiçek";
    if (!acc[key]) acc[key] = { item: it, count: 0 };
    acc[key].count += 1;
    return acc;
  }, {});

  const entries = Object.keys(counts).map((k) => ({ key: k, item: counts[k].item, count: counts[k].count }));

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text variant="h2">Bahçem</Text>
        <Text variant="muted" style={{ marginTop: 6 }}>
          Odak tamamladıkça çiçeklerin burada görünecek.
        </Text>

        <View style={{ height: 16 }} />

        {entries.length === 0 ? (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={{ fontWeight: "700", fontSize: 16 }}>Bahçeniz burada görünecek.</Text>
            <Text variant="muted" style={{ marginTop: 8 }}>
              Odak oturumu tamamladıkça çiçek kazanırsınız.
            </Text>
            <Pressable style={[styles.cta, { backgroundColor: colors.primary, marginTop: 12 }]} onPress={() => nav.navigate(Routes.Focus as any)}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Odak Başlat</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ marginTop: 8 }}>
            {entries.map((e, idx) => {
              const it = e.item;
              const emoji = flowerEmoji(normalizeFlowerId(it.type ?? it.name));
              const title = typeof it.name === "string" ? it.name : formatFlowerTitle(normalizeFlowerId(it.type));
              return (
                <View key={`${it.id ?? title}-${idx}`} style={[styles.card, { backgroundColor: colors.card, marginBottom: 12 }]}>
                  <Text style={styles.emoji}>{emoji}</Text>
                  <Text style={styles.name}>{title}</Text>
                  <Text style={styles.count}>x{e.count}</Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  cta: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  emoji: { fontSize: 36, marginBottom: 8 },
  name: { fontWeight: "800", marginBottom: 4 },
  count: { color: "#666" },
});
