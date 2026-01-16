import React, { useEffect, useState } from "react";
import { View, Pressable, StyleSheet, FlatList, ActivityIndicator, Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text } from "../../ui/Text";
import { useUser } from "../../context/UserContext";
import { db } from "../../firebase/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Routes } from "../../navigation/routes";
import { demoNotifications } from "../../data/mockData";

const KEY_PUSH = "odaki_push_enabled_v1";

export function NotificationsScreen() {
  const nav = useNavigation<any>();
  const { user } = useUser();
  const uid = user?.uid ?? null;

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pushEnabled, setPushEnabled] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY_PUSH);
        if (mounted) setPushEnabled(raw === null ? true : raw === "1");
      } catch {
        /* ignore */
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!uid) {
      setNotifications(demoNotifications);
      setLoading(false);
      return;
    }
    const q = query(collection(db, "notifications"), where("userId", "==", uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items: any[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...(d.data() as any) }));
        setNotifications(items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
        setLoading(false);
      },
      () => {
        setNotifications(demoNotifications);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [uid]);

  const togglePush = async (v: boolean) => {
    setPushEnabled(v);
    try {
      await AsyncStorage.setItem(KEY_PUSH, v ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => nav.navigate(Routes.RootTabs as any)} style={styles.back}><Text>Geri</Text></Pressable>
        <Text variant="h2">Bildirimler</Text>
        <View style={{ width: 56 }} />
      </View>

      <View style={styles.container}>
        <View style={styles.row}>
          <Text>Push Bildirimleri</Text>
          <Switch value={pushEnabled} onValueChange={togglePush} />
        </View>

        {loading ? (
          <View style={{ padding: 20, alignItems: "center" }}><ActivityIndicator /></View>
        ) : notifications.length === 0 ? (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text variant="muted">Henüz bildirim yok.</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={{ fontWeight: "700" }}>{item.title ?? "Bildirim"}</Text>
                <Text variant="muted" style={{ marginTop: 6 }}>{item.body ?? ""}</Text>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  back: { padding: 8 },
  container: { paddingHorizontal: 16, flex: 1 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  card: { backgroundColor: "#fff", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#eee", marginBottom: 10 },
});
