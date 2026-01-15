import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Screen } from "../ui/Screen";
import { Text } from "../ui/Text";
import { useTheme } from "../ui/theme/ThemeProvider";

type Friend = { id: string; name: string; handle: string; score: number; streak: number; status?: string };

const MOCK_FRIENDS: Friend[] = [
  { id: "1", name: "Simge", handle: "@simgesargn", score: 120, streak: 3, status: "Online" },
  { id: "2", name: "Merve", handle: "@merve", score: 90, streak: 2, status: "Online" },
  { id: "3", name: "Semra", handle: "@semra", score: 70, streak: 1, status: "Offline" },
];

// Aktivite akışı başlangıçta boş olacak (Figma boş-state gösterimi için)
const MOCK_ACTIVITY: { id: string; text: string; when: string }[] = [];

export const FriendsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<"activity" | "leaderboard">("activity");
  const [query, setQuery] = useState("");
  const [friends] = useState<Friend[]>(MOCK_FRIENDS);
  const [activity] = useState(MOCK_ACTIVITY);
  const [addHandle, setAddHandle] = useState("");

  const filteredFriends = useMemo(
    () => friends.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()) || f.handle.toLowerCase().includes(query.toLowerCase())),
    [friends, query]
  );

  const onSendRequest = () => {
    if (!addHandle.trim()) {
      Alert.alert("Hata", "Lütfen kullanıcı adı girin.");
      return;
    }
    Alert.alert("İstek gönderildi (demo)", `@${addHandle.replace(/^@/, "")} için istek gönderildi.`);
    setAddHandle("");
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: "#F6F7FB" }]}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text variant="h2" style={{ marginBottom: 12 }}>Arkadaşlar</Text>

        {/* Sekmeler */}
        <View style={styles.segmentRow}>
          <Pressable
            style={[styles.pill, activeTab === "activity" ? styles.pillActive : null]}
            onPress={() => setActiveTab("activity")}
          >
            <Text style={activeTab === "activity" ? styles.pillTextActive : styles.pillText}>Aktivite Akışı</Text>
          </Pressable>

          <Pressable
            style={[styles.pill, activeTab === "leaderboard" ? styles.pillActive : null]}
            onPress={() => setActiveTab("leaderboard")}
          >
            <Text style={activeTab === "leaderboard" ? styles.pillTextActive : styles.pillText}>Lider Tablosu</Text>
          </Pressable>
        </View>

        <View style={{ height: 12 }} />

        {/* İçerik */}
        {activeTab === "activity" && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {activity.length === 0 ? (
              <View style={{ paddingVertical: 24, alignItems: "center" }}>
                <Text style={{ fontWeight: "700", fontSize: 16 }}>Henüz aktivite yok</Text>
                <Text variant="muted" style={{ marginTop: 8, textAlign: "center" }}>
                  Arkadaş ekleyerek odak ve görev aktivitelerini takip edebilirsin.
                </Text>
                <Pressable
                  style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 16 }]}
                  onPress={() => navigation.navigate("AddFriend" as any)}
                >
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Arkadaş Ekle</Text>
                </Pressable>
              </View>
            ) : (
              <View>
                <Text style={styles.sectionTitle}>Aktivite Akışı</Text>
                {activity.map((a) => (
                  <View key={a.id} style={styles.activityRow}>
                    <View style={styles.activityIcon}>
                      <Text>⟲</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text>{a.text}</Text>
                    </View>
                    <Text variant="muted">{a.when}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === "leaderboard" && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={styles.sectionTitle}>Lider Tablosu</Text>

            {filteredFriends.length === 0 ? (
              <View style={{ paddingVertical: 20, alignItems: "center" }}>
                <Text variant="muted">Lider tablosu boş</Text>
              </View>
            ) : (
              <FlatList
                data={filteredFriends.sort((a, b) => b.score - a.score)}
                keyExtractor={(i) => i.id}
                renderItem={({ item, index }) => (
                  <View style={styles.leaderRow}>
                    <View style={styles.rankWrap}>
                      <Text style={styles.rankText}>{index + 1}</Text>
                    </View>

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ fontWeight: "700" }}>{item.name}</Text>
                      <Text variant="muted" style={{ marginTop: 2 }}>{item.handle}</Text>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{ fontWeight: "700" }}>{item.score}</Text>
                      <Text variant="muted" style={{ marginTop: 4 }}>Seri: {item.streak}</Text>
                    </View>
                  </View>
                )}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Sağ altta sabit Arkadaş Ekle butonu */}
      <Pressable
        style={[styles.fab, { backgroundColor: "#6C5CE7" }]}
        onPress={() => navigation.navigate("AddFriend" as any)}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>Arkadaş Ekle</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  segmentRow: { flexDirection: "row", justifyContent: "space-between" },
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#fff",
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#eee",
  },
  pillActive: {
    backgroundColor: "#F0E9FF",
    borderColor: "#E5DBFF",
  },
  pillText: { color: "#111", fontWeight: "600" },
  pillTextActive: { color: "#6C5CE7", fontWeight: "700" },

  container: { padding: 16 },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },

  leaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  rankWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: { fontWeight: "700" },

  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f3f4f6",
  },
  activityIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: "#EEF0F6", alignItems: "center", justifyContent: "center" },

  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  primaryBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  linkBtn: { alignItems: "center", opacity: 0.6 },

  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    elevation: 6,
  },
});
