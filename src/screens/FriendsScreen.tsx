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
import { Screen } from "../ui/Screen";
import { Text } from "../ui/Text";
import { useTheme } from "../ui/theme/ThemeProvider";

type Friend = { id: string; name: string; handle: string; score: number; streak: number; status?: string };

const MOCK_FRIENDS: Friend[] = [
  { id: "1", name: "Simge", handle: "@simgesargn", score: 120, streak: 3, status: "Online" },
  { id: "2", name: "Merve", handle: "@merve", score: 90, streak: 2, status: "Online" },
  { id: "3", name: "Semra", handle: "@semra", score: 70, streak: 1, status: "Offline" },
];

const MOCK_ACTIVITY = [
  { id: "a1", text: "Simge 25 dk odak yaptı", when: "Bugün" },
  { id: "a2", text: "Merve görev tamamladı", when: "Dün" },
  { id: "a3", text: "Semra 15 dk odak yaptı", when: "2 gün önce" },
];

export const FriendsScreen: React.FC = () => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<"leaderboard" | "activity" | "add">("leaderboard");
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

        {/* Segmented pills */}
        <View style={styles.segmentRow}>
          <Pressable
            style={[styles.pill, activeTab === "leaderboard" ? styles.pillActive : null]}
            onPress={() => setActiveTab("leaderboard")}
          >
            <Text style={activeTab === "leaderboard" ? styles.pillTextActive : styles.pillText}>Liderlik</Text>
          </Pressable>

          <Pressable
            style={[styles.pill, activeTab === "activity" ? styles.pillActive : null]}
            onPress={() => setActiveTab("activity")}
          >
            <Text style={activeTab === "activity" ? styles.pillTextActive : styles.pillText}>Aktivite</Text>
          </Pressable>

          <Pressable
            style={[styles.pill, activeTab === "add" ? styles.pillActive : null]}
            onPress={() => setActiveTab("add")}
          >
            <Text style={activeTab === "add" ? styles.pillTextActive : styles.pillText}>Ekle</Text>
          </Pressable>
        </View>

        <View style={{ height: 12 }} />

        {/* CONTENT */}
        {activeTab === "leaderboard" && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={styles.sectionTitle}>Liderlik Tablosu</Text>

            {filteredFriends.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text variant="muted">Henüz arkadaşın yok</Text>
                <Pressable style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 12 }]} onPress={() => setActiveTab("add")}>
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Arkadaş Ekle</Text>
                </Pressable>
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
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <View style={[styles.avatar, { backgroundColor: "#F0E9FF" }]}>
                          <Text style={{ fontWeight: "700" }}>{item.name[0]}</Text>
                        </View>
                        <View style={{ marginLeft: 10 }}>
                          <Text style={{ fontWeight: "700" }}>{item.name}</Text>
                          <Text variant="muted" style={{ marginTop: 2 }}>{item.handle}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{ fontWeight: "700" }}>{item.score}</Text>
                      <Text variant="muted" style={{ marginTop: 4 }}>Seri: {item.streak}</Text>
                    </View>
                  </View>
                )}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                scrollEnabled={false}
              />
            )}
          </View>
        )}

        {activeTab === "activity" && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={styles.sectionTitle}>Son Aktiviteler</Text>
            <View style={{ height: 8 }} />
            {activity.map((a) => (
              <View key={a.id} style={styles.activityRow}>
                <View style={styles.activityIcon}>
                  <Text style={{ fontWeight: "700" }}>⟲</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text>{a.text}</Text>
                </View>
                <Text variant="muted">{a.when}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === "add" && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={styles.sectionTitle}>Arkadaş Ekle</Text>
            <View style={{ height: 8 }} />
            <TextInput
              placeholder="Kullanıcı adı (örn: @simgesargn)"
              placeholderTextColor="#999"
              value={addHandle}
              onChangeText={setAddHandle}
              style={[styles.input, { borderColor: colors.border, backgroundColor: "#fff" }]}
            />
            <Pressable style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 12 }]} onPress={onSendRequest}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>İstek Gönder</Text>
            </Pressable>

            <Pressable style={[styles.linkBtn, { marginTop: 10 }]} onPress={() => Alert.alert("QR ile ekle", "Yakında")}>
              <Text variant="muted">QR ile ekle (yakında)</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  segmentRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
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
  emptyWrap: { alignItems: "center", paddingVertical: 20 },

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
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },

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
});
