import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../ui/Text";
import { useUser } from "../../context/UserContext";
import { db } from "../../firebase/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";

type Row = { id: string; name: string; email?: string; emoji?: string };

export function FriendsListScreen() {
  const nav = useNavigation<any>();
  const { user } = useUser();
  const uid = user?.uid ?? null;

  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    setLoading(true);
    try {
      const col = collection(db, "users");
      unsub = onSnapshot(
        col,
        (snap) => {
          const arr: Row[] = [];
          snap.forEach((d) => {
            const data: any = d.data();
            if (data?.uid && uid && data.uid === uid) return;
            arr.push({
              id: d.id,
              name: data?.username ?? data?.displayName ?? data?.email?.split?.("@")?.[0] ?? "Kullanıcı",
              email: data?.email ?? undefined,
              emoji: data?.profileEmoji ?? data?.avatarEmoji ?? "🙂",
            });
          });
          setItems(arr);
          setLoading(false);
        },
        () => {
          setItems([]);
          setLoading(false);
        }
      );
    } catch {
      setItems([]);
      setLoading(false);
    }
    return () => {
      if (unsub) unsub();
    };
  }, [uid]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => nav.navigate(Routes.RootTabs as any)} style={styles.back}><Text>Geri</Text></Pressable>
        <Text variant="h2">Arkadaş Listesi</Text>
        <Pressable onPress={() => nav.navigate(Routes.AddFriend as any)} style={styles.add}><Text>Ekle</Text></Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontWeight: "700" }}>{item.name}</Text>
              {item.email ? <Text variant="muted">{item.email}</Text> : null}
            </View>
            <Pressable onPress={() => nav.navigate(Routes.FriendsActivity as any, { friendId: item.id })} style={styles.viewBtn}>
              <Text>Gör</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={<View style={{ padding: 24, alignItems: "center" }}><Text variant="muted">{loading ? "Yükleniyor..." : "Henüz arkadaş yok."}</Text></View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  back: { padding: 8 },
  add: { padding: 8 },
  row: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 12, backgroundColor: "#fff", marginBottom: 12, borderWidth: 1, borderColor: "#eee" },
  viewBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: "#eee" },
});
