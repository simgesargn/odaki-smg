import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, SectionList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../ui/Text";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useUser } from "../../context/UserContext";
import { db } from "../../firebase/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";

type Msg = { id: string; text: string; sender: "user" | "odi" | string; ts?: number };
type Section = { title: string; data: Msg[] };

export function OdiChatHistoryScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useUser();
  const uid = user?.uid ?? null;
  const chatId = route.params?.chatId ?? null;

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setMsgs([]);
      setLoading(false);
      return;
    }

    const col = collection(db, "odiMessages");
    const q = chatId
      ? query(col, where("chatId", "==", chatId), orderBy("createdAt", "asc"))
      : query(col, where("userId", "==", uid), orderBy("createdAt", "asc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr: Msg[] = [];
        snap.forEach((d) => {
          const data: any = d.data();
          const ts = data?.createdAt?.toDate ? data.createdAt.toDate().getTime() : data?.createdAt ?? Date.now();
          arr.push({
            id: d.id,
            text: data?.text ?? data?.message ?? "",
            sender: data?.sender ?? data?.role ?? (data?.from === uid ? "user" : "odi"),
            ts,
          });
        });
        setMsgs(arr);
        setLoading(false);
      },
      () => {
        setMsgs([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [uid, chatId]);

  const sections: Section[] = useMemo(() => {
    const map = new Map<string, Msg[]>();
    for (const m of msgs) {
      const d = m.ts ? new Date(m.ts) : new Date();
      const key = d.toLocaleDateString("tr-TR", { year: "numeric", month: "short", day: "2-digit" });
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
  }, [msgs]);

  const renderMsg = (m: Msg) => {
    const isUser = m.sender === "user" || m.sender === uid;
    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowRight : styles.msgRowLeft]}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleOdi]}>
          <Text style={isUser ? styles.msgTextUser : styles.msgTextOdi}>{m.text}</Text>
          <Text variant="muted" style={styles.msgTs}>
            {m.ts ? new Date(m.ts).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : ""}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => nav.navigate("RootTabs" as any)} style={styles.back}><Text>Geri</Text></Pressable>
        <Text variant="h2">Odi — Sohbet Geçmişi</Text>
        <View style={{ width: 56 }} />
      </View>

      <View style={styles.listWrap}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}><Text variant="muted">{section.title}</Text></View>
          )}
          renderItem={({ item }) => renderMsg(item)}
          ListEmptyComponent={!loading ? <View style={styles.empty}><Text variant="muted">Henüz mesaj yok.</Text></View> : null}
          contentContainerStyle={{ padding: 12, paddingBottom: 28 }}
          inverted={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  back: { padding: 8 },
  listWrap: { flex: 1 },
  sectionHeader: { alignItems: "center", marginVertical: 8 },
  msgRow: { flexDirection: "row", marginVertical: 6 },
  msgRowLeft: { justifyContent: "flex-start" },
  msgRowRight: { justifyContent: "flex-end" },
  bubble: { maxWidth: "80%", padding: 10, borderRadius: 12 },
  bubbleUser: { backgroundColor: "#6C5CE7" },
  bubbleOdi: { backgroundColor: "#F3F4F6" },
  msgTextUser: { color: "#fff" },
  msgTextOdi: { color: "#111" },
  msgTs: { marginTop: 6, fontSize: 11, color: "#9ca3af", textAlign: "right" },
  empty: { padding: 24, alignItems: "center" },
});
