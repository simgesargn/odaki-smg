import React, { useLayoutEffect, useMemo, useState } from "react";
import { View, StyleSheet, Pressable, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { useTheme } from "../../ui/theme/ThemeProvider";
import { Routes } from "../../navigation/routes";

type Leader = { id: string; name: string; handle: string; minutes: number; rank: number };
type Activity = { id: string; text: string; when: string };
type Friend = { id: string; name: string; handle: string; score: number; level: number };

export const FriendsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<"leaderboard" | "activity">("leaderboard");

  const leaders: Leader[] = useMemo(
    () => [
      { id: "l1", name: "Simge", handle: "@simgesargn", minutes: 150, rank: 1 },
      { id: "l2", name: "Merve", handle: "@merve", minutes: 110, rank: 2 },
      { id: "l3", name: "Semra", handle: "@semra", minutes: 60, rank: 3 },
    ],
    []
  );

  const activities: Activity[] = useMemo(
    () => [
      { id: "a1", text: "Simge 25 dk odak yaptı", when: "2s önce" },
      { id: "a2", text: "Merve görev tamamladı", when: "1g önce" },
      { id: "a3", text: "Semra 15 dk odak yaptı", when: "2g önce" },
    ],
    []
  );

  const friends: Friend[] = useMemo(
    () => [
      { id: "f1", name: "Simge", handle: "@simgesargn", score: 120, level: 3 },
      { id: "f2", name: "Merve", handle: "@merve", score: 90, level: 2 },
      { id: "f3", name: "Semra", handle: "@semra", score: 70, level: 1 },
    ],
    []
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate(Routes.AddFriend as any)} style={{ paddingHorizontal: 12 }}>
          <Text style={{ color: colors.primary, fontWeight: "700" }}>+ Arkadaş Ekle</Text>
        </Pressable>
      ),
    });
  }, [navigation, colors.primary]);

  return (
    <Screen style={{ padding: 16 }}>
      <Text variant="h2" style={{ marginBottom: 12 }}>
        Arkadaşlar
      </Text>

      {/* Üst aksiyon kartları */}
      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.actionCard, { backgroundColor: "#FFEDD5" }]}
          onPress={() => navigation.navigate(Routes.FriendsActivity as any)}
        >
          <Text style={styles.actionIcon}>⟲</Text>
          <Text style={styles.actionTitle}>Aktivite Akışı</Text>
        </Pressable>

        <Pressable
          style={[styles.actionCard, { backgroundColor: "#DBEAFE" }]}
          onPress={() => navigation.navigate(Routes.FriendsRequests as any)}
        >
          <Text style={styles.actionIcon}>📨</Text>
          <Text style={styles.actionTitle}>Arkadaşlık İstekleri</Text>
        </Pressable>

        <Pressable
          style={[styles.actionCard, { backgroundColor: "#F3E8FF" }]}
          onPress={() => navigation.navigate(Routes.FriendsLeaderboard as any)}
        >
          <Text style={styles.actionIcon}>👑</Text>
          <Text style={styles.actionTitle}>Lider Tablosu</Text>
        </Pressable>
      </View>

      <View style={{ height: 14 }} />

      {/* Eğer arkadaş yoksa yardımcı alt metin */}
      {(!friends || friends.length === 0) ? (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={{ fontWeight: "700" }}>Henüz arkadaşın yok</Text>
          <Text variant="muted" style={{ marginTop: 8 }}>
            Arkadaş ekleyerek başlayabilirsin.
          </Text>

          <Pressable
            style={[styles.mainButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate(Routes.AddFriend as any)}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Arkadaş Ekle</Text>
          </Pressable>
        </View>
      ) : (
        // Arkadaş listesi kısa gösterim (örnek)
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>Takip Ettiklerin</Text>
          <FlatList
            data={friends}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View style={[styles.avatar, { backgroundColor: "#F0E9FF" }]}><Text style={{ fontWeight: "700" }}>{item.name[0]}</Text></View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ fontWeight: "700" }}>{item.name}</Text>
                  <Text variant="muted" style={{ marginTop: 2 }}>{item.handle}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontWeight: "700" }}>{item.score} puan</Text>
                </View>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />

          <View style={{ height: 12 }} />
          <Pressable
            style={[styles.mainButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate(Routes.AddFriend as any)}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Arkadaş Ekle</Text>
          </Pressable>
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  actionsRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  actionCard: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: { fontSize: 22 },
  actionTitle: { marginTop: 8, fontWeight: "700", textAlign: "center" },

  card: {
    borderRadius: 16,
    padding: 16,
    marginTop: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  mainButton: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
});
