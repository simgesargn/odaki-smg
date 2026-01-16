import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../ui/Text";
import { useUser } from "../../context/UserContext";
import { db } from "../../firebase/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";

type Activity = { id: string; userId?: string; title?: string; detail?: string; createdAt?: any };

export function FriendsActivityScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const friendId = route.params?.friendId ?? null;
  const { user } = useUser();
  const uid = user?.uid ?? null;

  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    try {
      const col = collection(db, "friendsActivity");
      const q = friendId ? query(col, where("userId", "==", friendId), orderBy("createdAt", "desc")) : query(col, orderBy("createdAt", "desc"));
      unsub = onSnapshot(q, (snap) => {
        const arr: Activity[] = [];
        snap.forEach((d) => arr.push({ id: d.id, ...(d.data() as any) }));
        setItems(arr);
        setLoading(false);
      }, () => { setItems([]); setLoading(false); });
    } catch {
      setItems([]);
      setLoading(false);
    }
    return () => { if (unsub) unsub(); };
  }, [friendId]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => nav.goBack()} style={styles.back}><Text>Geri</Text></Pressable>
        <Text variant="h2">Aktivite Akışı</Text>
        <View style={{ width: 56 }} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={{ fontWeight: "700" }}>{item.title ?? "Aktivite"}</Text>
            <Text variant="muted" style={{ marginTop: 6 }}>{item.detail ?? ""}</Text>
          </View>
        )}
        ListEmptyComponent={<View style={{ padding: 24, alignItems: "center" }}><Text variant="muted">{loading ? "Yükleniyor..." : "Aktivite yok."}</Text></View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  back: { padding: 8 },
  card: { padding: 12, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#eee", marginBottom: 10 },
});
