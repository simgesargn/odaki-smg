import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, FlatList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../ui/Text";
import { useUser } from "../../context/UserContext";
import { db } from "../../firebase/firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";

type Req = { id: string; fromUid?: string; fromEmail?: string; toIdentifier?: string; status?: string; createdAt?: any };

export function FriendRequestsScreen() {
  const nav = useNavigation<any>();
  const { user } = useUser();
  const uid = user?.uid ?? null;
  const myEmail = user?.email ?? null;

  const [incoming, setIncoming] = useState<Req[]>([]);
  const [outgoing, setOutgoing] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid && !myEmail) {
      setIncoming([]); setOutgoing([]); setLoading(false); return;
    }
    const col = collection(db, "friendRequests");
    const unsub = onSnapshot(col, (snap) => {
      const inc: Req[] = [];
      const out: Req[] = [];
      snap.forEach((d) => {
        const data = d.data() as any;
        const r: Req = { id: d.id, ...data };
        const toMatch = String(data?.toIdentifier ?? "").toLowerCase();
        if ((data?.toUid && data.toUid === uid) || (myEmail && toMatch === myEmail.toLowerCase())) inc.push(r);
        if (data?.fromUid === uid) out.push(r);
      });
      setIncoming(inc);
      setOutgoing(out);
      setLoading(false);
    }, () => { setIncoming([]); setOutgoing([]); setLoading(false); });
    return () => unsub();
  }, [uid, myEmail]);

  const respond = async (id: string, accept: boolean) => {
    try {
      const ref = doc(db, "friendRequests", id);
      await updateDoc(ref, { status: accept ? "accepted" : "rejected", respondedAt: Date.now() });
      Alert.alert("İşlem", accept ? "Kabul edildi." : "Reddedildi.");
    } catch {
      Alert.alert("Hata", "İşlem başarısız.");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => nav.navigate(Routes.Friends as any)} style={styles.back}><Text>Geri</Text></Pressable>
        <Text variant="h2">İstekler</Text>
        <View style={{ width: 56 }} />
      </View>

      <View style={{ padding: 16 }}>
        <Text style={{ fontWeight: "700", marginBottom: 8 }}>Gelen İstekler</Text>
        <FlatList data={incoming} keyExtractor={(i) => i.id} renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "700" }}>{item.fromEmail ?? item.fromUid ?? "Bilinmiyor"}</Text>
              <Text variant="muted">{item.status}</Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Pressable onPress={() => respond(item.id, true)} style={styles.accept}><Text>Kabul</Text></Pressable>
              <Pressable onPress={() => respond(item.id, false)} style={styles.reject}><Text>Reddet</Text></Pressable>
            </View>
          </View>
        )} ListEmptyComponent={<Text variant="muted">Gelen istek yok.</Text>} />

        <View style={{ height: 16 }} />
        <Text style={{ fontWeight: "700", marginBottom: 8 }}>Gönderilen İstekler</Text>
        <FlatList data={outgoing} keyExtractor={(i) => i.id} renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "700" }}>{item.toIdentifier}</Text>
              <Text variant="muted">{item.status}</Text>
            </View>
            <View />
          </View>
        )} ListEmptyComponent={<Text variant="muted">Gönderilen istek yok.</Text>} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  back: { padding: 8 },
  row: { padding: 12, borderRadius: 12, backgroundColor: "#fff", marginBottom: 10, borderWidth: 1, borderColor: "#eee", flexDirection: "row", alignItems: "center" },
  accept: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#4ade80", borderRadius: 8, marginRight: 8 },
  reject: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#ef4444", borderRadius: 8 },
});
