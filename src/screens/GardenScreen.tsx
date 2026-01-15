import React, { useCallback, useEffect, useState } from "react";
import { View, Text as RNText, Pressable, FlatList, RefreshControl } from "react-native";
import { Screen } from "../ui/Screen";
import { Text } from "../ui/Text";
import { getGardenItems, clearGarden, GardenItem } from "../services/gardenStore";
import { useTheme } from "../ui/theme/ThemeProvider";

function emojiFor(item: GardenItem) {
  if (item.type === "seed") return "🌱";
  return "🌸";
}

export const GardenScreen: React.FC = () => {
  const { colors } = useTheme();
  const [items, setItems] = useState<GardenItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const list = await getGardenItems();
    setItems(list);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <Screen>
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <Text variant="h2" style={{ color: colors.text }}>Bahçem</Text>
        <Text variant="muted" style={{ marginTop: 6 }}>Odak tamamladıkça çiçek kazanırsın. 🌸</Text>

        <View style={{ marginTop: 14, flexDirection: "row" }}>
          <Pressable
            onPress={onRefresh}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 12,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              marginRight: 10,
            }}
          >
            <Text style={{ fontWeight: "600", color: colors.text }}>Yenile</Text>
          </Pressable>

          <Pressable
            onPress={async () => {
              await clearGarden();
              await load();
            }}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 12,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontWeight: "600", color: colors.danger }}>Temizle</Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 16 }}>
          <FlatList
            data={items}
            keyExtractor={(x) => x.id}
            numColumns={3}
            columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 12 }}
            contentContainerStyle={{ paddingBottom: 30 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <View
                style={{
                  marginTop: 20,
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontWeight: "700", fontSize: 16, color: colors.text }}>Henüz çiçek yok</Text>
                <Text variant="muted" style={{ marginTop: 6 }}>
                  Odak ekranında bir oturum tamamla, bahçen dolsun.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View
                style={{
                  flex: 1,
                  minWidth: 0,
                  aspectRatio: 1,
                  borderRadius: 18,
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 34 }}>{emojiFor(item)}</Text>
                <Text style={{ marginTop: 6, fontWeight: "700", color: colors.text }}>{item.earnedMinutes} dk</Text>
              </View>
            )}
          />
        </View>
      </View>
    </Screen>
  );
};
