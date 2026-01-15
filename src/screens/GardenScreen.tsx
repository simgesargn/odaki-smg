import React, { useCallback, useEffect, useState } from "react";
import { View, Pressable, FlatList, StyleSheet } from "react-native";
import { Screen } from "../ui/Screen";
import { Text } from "../ui/Text";
import { useTheme } from "../ui/theme/ThemeProvider";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Routes } from "../navigation/routes";
import { loadFlowers, Flower } from "../features/focus/focusStore";

export const GardenScreen: React.FC = () => {
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await loadFlowers();
      setFlowers(list || []);
    } catch {
      setFlowers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <Screen>
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <Text variant="h2">Bahçem</Text>
        <Text variant="muted" style={{ marginTop: 6 }}>
          Odak tamamladıkça çiçeklerin burada görünecek.
        </Text>

        <View style={{ height: 16 }} />

        {loading ? (
          <Text variant="muted">Yükleniyor...</Text>
        ) : flowers.length === 0 ? (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={{ fontWeight: "700", fontSize: 16 }}>Bahçeniz burada görünecek.</Text>
            <Text variant="muted" style={{ marginTop: 8 }}>
              Odak oturumu tamamladıkça çiçek kazanırsınız.
            </Text>
            <Pressable
              style={[styles.cta, { backgroundColor: colors.primary }]}
              onPress={() => nav.navigate(Routes.Focus as any)}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Odak Başlat</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={flowers}
            keyExtractor={(i) => i.id}
            numColumns={3}
            columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 12 }}
            contentContainerStyle={{ paddingBottom: 24 }}
            renderItem={({ item }) => (
              <View style={[styles.flowerBox, { backgroundColor: colors.card }]}>
                <Text style={{ fontSize: 28 }}>🌸</Text>
                <Text variant="muted" style={{ marginTop: 8, fontSize: 12 }}>
                  {new Date(item.earnedAt).toLocaleString()}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginTop: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    alignItems: "center",
  },
  cta: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  flowerBox: {
    flex: 1,
    minWidth: 0,
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
});
