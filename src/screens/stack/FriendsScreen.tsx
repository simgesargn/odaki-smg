import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Text as RNText } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../ui/Text";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";
import { useUser } from "../../context/UserContext";
import { db } from "../../firebase/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { demoFriends } from "../../data/mockData";
import { useTheme } from "../../ui/ThemeProvider";

type FriendRow = { id: string; name: string; status?: string; emoji?: string };

const SAMPLE: FriendRow[] = [
  { id: "f1", name: "Ayşe", status: "Çevrimiçi", emoji: "🙂" },
  { id: "f2", name: "Mehmet", status: "Son aktif 2s önce", emoji: "😎" },
  { id: "f3", name: "Ece", status: "Çevrimdışı", emoji: "🌱" },
];

export function FriendsScreen() {
  const nav = useNavigation<any>();
  const { user } = useUser();
  const uid = user?.uid ?? null;
  const theme = useTheme();

  const [friends, setFriends] = useState<FriendRow[]>(SAMPLE);
  const [loading, setLoading] = useState<boolean>(true);
  const [addModal, setAddModal] = useState(false);
  const [query, setQuery] = useState("");
  const [sentRequests, setSentRequests] = useState<string[]>([]);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    setLoading(true);

    try {
      // subscribe to users root collection; filter self client-side
      const col = collection(db, "users");
      unsub = onSnapshot(
        col,
        (snap) => {
          const items: FriendRow[] = [];
          snap.forEach((d) => {
            const data: any = d.data();
            const id = d.id;
            // skip self
            if (data?.uid && uid && data.uid === uid) return;
            items.push({
              id,
              name: data?.name ?? data?.username ?? data?.displayName ?? "Kullanıcı",
              status: data?.status ?? undefined,
              emoji: data?.avatarEmoji ?? data?.profileEmoji ?? "🙂",
            });
          });
          // if no users found, keep SAMPLE as fallback
          if (items.length === 0) {
            setFriends(SAMPLE);
          } else {
            setFriends(items.slice(0, 50)); // limit client-side
          }
          setLoading(false);
        },
        () => {
          // on error fallback to sample
          setFriends(SAMPLE);
          setLoading(false);
        }
      );
    } catch {
      setFriends(SAMPLE);
      setLoading(false);
    }

    return () => {
      if (unsub) unsub();
    };
  }, [uid]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      {/* native stack header will show back when opened from menu; tab root screens won't show header */}
      <View style={[styles.header, { paddingHorizontal: theme.spacing.lg }]}>
        <Text variant="h2">Arkadaşlar</Text>
        <RNText style={{ fontWeight: "700", color: theme.primary }}>Arkadaş Ekle</RNText>
      </View>

      {/* Arkadaş özeti */}
      <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontWeight: "700" }}>Toplam</Text>
            <Text style={{ marginTop: 6 }}>{friends.length}</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontWeight: "700" }}>Çevrimiçi</Text>
            <Text style={{ marginTop: 6 }}>1</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontWeight: "700" }}>Son aktif</Text>
            <Text variant="muted" style={{ marginTop: 6 }}>2 sn önce</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={friends}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={[styles.friendCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.avatarBox}>
              <Text style={{ fontSize: 20 }}>{item.emoji ?? "🙂"}</Text>
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontWeight: "700" }}>{item.name}</Text>
              <Text variant="muted">{item.status ?? "Durum yok"}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <View style={{ padding: 24, alignItems: "center" }}>
              <Text variant="muted">Yükleniyor...</Text>
            </View>
          ) : (
            <View style={{ padding: 24, alignItems: "center" }}>
              <Text variant="muted">Henüz arkadaş yok.</Text>
            </View>
          )
        }
      />

      {/* Add Friend Modal removed from UI (kept elsewhere) */}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  addBtn: { padding: 8 },
  summaryCard: { marginHorizontal: 16, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#eee", backgroundColor: "#fff", marginBottom: 12 },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  avatarBox: { width: 36, height: 36, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.03)" },
});
