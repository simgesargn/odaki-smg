import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, FlatList, Alert } from "react-native";
import { Text } from "../../ui/Text";
import { Screen } from "../../ui/Screen";
import { auth, db } from "../../firebase/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  writeBatch,
  doc,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export const NotificationsScreen: React.FC = () => {
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid || null);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingMarkAll, setLoadingMarkAll] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => setUid(u?.uid || null));
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!uid) {
      setItems([]);
      return;
    }
    setError(null);
    const q = query(collection(db, "notifications"), where("userId", "==", uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr: any[] = [];
        snap.forEach((d) => {
          const data = d.data() as any;
          arr.push({
            id: d.id,
            title: data.title,
            body: data.body,
            isRead: data.isRead || data.read || false,
            createdAt: data.createdAt || null,
          });
        });
        // sort by createdAt desc if possible
        arr.sort((a, b) => {
          const at = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
          const bt = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
          return bt - at;
        });
        setItems(arr);
      },
      (e: any) => {
        setError("Firestore okuma hatası: " + (e?.message || e?.code || "bilinmeyen"));
        setItems([]);
      }
    );
    return () => unsub();
  }, [uid]);

  const markAllRead = async () => {
    if (!uid) return;
    setLoadingMarkAll(true);
    setError(null);
    try {
      // only unread notifications
      const qUnread = query(collection(db, "notifications"), where("userId", "==", uid), where("isRead", "==", false));
      const snaps = await getDocs(qUnread);
      if (snaps.empty) {
        Alert.alert("Bilgi", "Okunacak bildirim yok.");
        setLoadingMarkAll(false);
        return;
      }
      const batch = writeBatch(db);
      snaps.forEach((d) => {
        batch.update(doc(db, "notifications", d.id), { isRead: true });
      });
      await batch.commit();
    } catch (e: any) {
      const msg = e?.message || e?.code || "bilinmeyen";
      setError("Firestore yazma hatası: " + msg);
    } finally {
      setLoadingMarkAll(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View style={[styles.item, item.isRead ? styles.readItem : undefined]}>
        <Text variant="h2">{item.title}</Text>
        {item.body ? <Text variant="muted">{item.body}</Text> : null}
        <Text variant="muted" style={{ fontSize: 11, marginTop: 6 }}>
          {item.createdAt && item.createdAt.toDate ? item.createdAt.toDate().toLocaleString() : "-"}
        </Text>
      </View>
    );
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text variant="h1">Bildirimler</Text>
        <Pressable onPress={markAllRead} style={{ padding: 8 }}>
          <Text variant="muted">{loadingMarkAll ? "Bekleniyor..." : "Tümünü Oku"}</Text>
        </Pressable>
      </View>

      {error ? <View style={styles.error}><Text variant="muted" style={{ color: "red" }}>{error}</Text></View> : null}

      {items.length === 0 ? (
        <View style={styles.empty}><Text variant="muted">Henüz bildirim yok</Text></View>
      ) : (
        <FlatList data={items} keyExtractor={(i) => i.id} renderItem={renderItem} />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  item: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  readItem: { opacity: 0.5 },
  empty: { padding: 16, alignItems: "center" },
  error: { paddingVertical: 8 },
});
