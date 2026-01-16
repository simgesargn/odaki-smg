import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, FlatList, Modal, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../ui/Text";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";
import { useUser } from "../../context/UserContext";
import { db } from "../../firebase/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { demoFriends } from "../../data/mockData";

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
    <SafeAreaView style={styles.safe}>
      {/* native stack header will show back when opened from menu; tab root screens won't show header */}
      <View style={styles.header}>
        <Text variant="h2">Arkadaşlar</Text>
        <Pressable onPress={() => setAddModal(true)} style={styles.addBtn}>
          <Text style={{ fontWeight: "700", color: "#6C5CE7" }}>Arkadaş Ekle</Text>
        </Pressable>
      </View>

      <FlatList
        data={friends}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => nav.navigate(Routes.FriendProfile as any, { friendId: item.id })} style={styles.card}>
            <Text style={{ fontSize: 24 }}>{item.emoji ?? "🙂"}</Text>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontWeight: "700" }}>{item.name}</Text>
              <Text variant="muted">{item.status ?? "Durum yok"}</Text>
            </View>
          </Pressable>
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

      {/* Add Friend Modal */}
      {addModal && (
        <Modal transparent animationType="slide" onRequestClose={() => setAddModal(false)}>
          <View style={{ flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.35)" }}>
            <View style={{ margin: 20, backgroundColor: "#fff", borderRadius: 12, padding: 16 }}>
              <Text style={{ fontWeight: "700", marginBottom: 8 }}>Yeni Arkadaş Ekle</Text>
              <TextInput placeholder="Kullanıcı adı ara" value={query} onChangeText={setQuery} style={{ borderWidth: 1, borderColor: "#eee", padding: 8, borderRadius: 8 }} />
              <View style={{ marginTop: 12 }}>
                {(demoFriends.filter(f => f.name.toLowerCase().includes(query.toLowerCase()) || f.username.includes(query.toLowerCase()))).map(f => (
                  <View key={f.id} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 }}>
                    <View><Text style={{ fontWeight: "700" }}>{f.name}</Text><Text variant="muted">{f.status}</Text></View>
                    <Pressable onPress={() => setSentRequests(prev => prev.concat(f.id))} style={{ padding: 8, backgroundColor: sentRequests.includes(f.id) ? "#ccc" : "#6C5CE7", borderRadius: 8 }}>
                      <Text style={{ color: "#fff" }}>{sentRequests.includes(f.id) ? "İstek Gönderildi" : "İstek Gönder"}</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
              <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
                <Pressable onPress={() => setAddModal(false)} style={{ padding: 8 }}><Text>Kapat</Text></Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  addBtn: { padding: 8 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
});
