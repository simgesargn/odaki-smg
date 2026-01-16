import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../ui/Text";
import { db } from "../../firebase/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";

type Row = { id: string; name: string; score: number };

const SAMPLE: Row[] = [
  { id: "s1", name: "Ayşe", score: 120 },
  { id: "s2", name: "Mehmet", score: 98 },
  { id: "s3", name: "Ece", score: 75 },
];

export function FriendsLeaderboardScreen() {
  const nav = useNavigation<any>();
  const [rows, setRows] = useState<Row[]>(SAMPLE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    try {
      const col = collection(db, "users");
      unsub = onSnapshot(
        col,
        (snap) => {
          const arr: Row[] = [];
          snap.forEach((d) => {
            const data: any = d.data();
            arr.push({ id: d.id, name: data?.username ?? data?.displayName ?? data?.email?.split?.("@")?.[0] ?? "Kullanıcı", score: Number(data?.score ?? 0) });
          });
          arr.sort((a, b) => b.score - a.score);
          setRows(arr.slice(0, 50));
          setLoading(false);
        },
        () => {
          setRows(SAMPLE);
          setLoading(false);
        }
      );
    } catch {
      setRows(SAMPLE);
      setLoading(false);
    }
    return () => { if (unsub) unsub(); };
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => nav.navigate(Routes.RootTabs as any)} style={styles.back}><Text>Geri</Text></Pressable>
        <Text variant="h2">Lider Tablosu</Text>
        <View style={{ width: 56 }} />
      </View>

      <FlatList
        data={rows}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={{ fontWeight: "700" }}>{index + 1}. {item.name}</Text>
            <Text variant="muted">{item.score} pts</Text>
          </View>
        )}
        ListEmptyComponent={<View style={{ padding: 24, alignItems: "center" }}><Text variant="muted">Veri yok.</Text></View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  back: { padding: 8 },
  row: { padding: 12, borderRadius: 12, backgroundColor: "#fff", marginBottom: 10, borderWidth: 1, borderColor: "#eee", flexDirection: "row", justifyContent: "space-between" },
});
