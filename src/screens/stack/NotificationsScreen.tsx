import React, { useEffect, useState } from "react";
import { View, Pressable, StyleSheet, ActivityIndicator, Switch, Alert, ScrollView } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text } from "../../ui/Text";
import { useUser } from "../../context/UserContext";
import { db } from "../../firebase/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Routes } from "../../navigation/routes";
import { demoNotifications } from "../../data/mockData";
import { useTheme } from "../../ui/ThemeProvider";

const KEY_PUSH = "odaki_push_enabled_v1";
const BUTTON_HEIGHT = 52;

export function NotificationsScreen() {
  const nav = useNavigation<any>();
  const { user } = useUser();
  const uid = user?.uid ?? null;
  const themeCtx = useTheme();
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pushEnabled, setPushEnabled] = useState<boolean>(true);
  const [dndEnabled, setDndEnabled] = useState(false);
  const [summary, setSummary] = useState<"none" | "daily" | "weekly">("daily");

  const summaryText = summary === "none" ? "Özet kapalı." : summary === "daily" ? "Her akşam gün özeti gönderilir." : "Her Pazar haftalık özet gönderilir.";

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

  // Content padding bottom to avoid overlapping with the fixed Save bar
  const contentPaddingBottom = BUTTON_HEIGHT + insets.bottom + 24;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: themeCtx.colors.background }]}>
      <View style={styles.header}>
        <Text style={{ fontSize: 22, fontWeight: "700", color: themeCtx.colors.text }}>Bildirimler</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: contentPaddingBottom }}>
        <View style={[styles.card, { borderColor: themeCtx.colors.border }]}>
          <Text style={{ fontWeight: "700", marginBottom: 8, color: themeCtx.colors.text }}>Özet Bildirim</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {(["none","daily","weekly"] as const).map((s) => (
              <Pressable
                key={s}
                onPress={() => setSummary(s)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 999,
                  backgroundColor: summary === s ? themeCtx.colors.primary : themeCtx.colors.primarySoft,
                  marginRight: 8,
                }}
              >
                <Text style={{ color: summary === s ? "#fff" : themeCtx.colors.text }}>{s === "none" ? "Kapalı" : s === "daily" ? "Günlük" : "Haftalık"}</Text>
              </Pressable>
            ))}
          </View>
          <Text variant="muted" style={{ marginTop: 8 }}>{summaryText}</Text>
        </View>

        <View style={[styles.card, { borderColor: themeCtx.colors.border }]}>
          <Text style={{ fontWeight: "700", color: themeCtx.colors.text }}>Odak Hatırlatmaları</Text>
          <View style={styles.row}>
            <Text>Odak başlatmayı hatırlat</Text>
            <Switch value={pushEnabled} onValueChange={togglePush} />
          </View>
          <View style={styles.row}>
            <Text>Molayı hatırlat</Text>
            <Switch value={dndEnabled} onValueChange={setDndEnabled} />
          </View>
          <View style={styles.row}>
            <Text>Hedefe yaklaşınca kutla</Text>
            <Switch value={true} onValueChange={() => Alert.alert("Bilgi", "Özellik demo modunda")} />
          </View>
        </View>

        <View style={[styles.card, { borderColor: themeCtx.colors.border }]}>
          <Text style={{ fontWeight: "700", color: themeCtx.colors.text }}>Sessiz Saatler</Text>
          <View style={styles.row}>
            <Text>Sessiz saatler</Text>
            <Switch value={false} onValueChange={() => {}} />
          </View>
          <View style={{ marginTop: 8 }}>
            <Text variant="muted">Başlangıç: 22:00</Text>
            <Text variant="muted">Bitiş: 08:00</Text>
          </View>
        </View>

        <View style={[styles.card, { borderColor: themeCtx.colors.border }]}>
          <Text style={{ fontWeight: "700", color: themeCtx.colors.text }}>Bildirim Stili</Text>
          <View style={styles.row}>
            <Text>Ses</Text>
            <Switch value={true} onValueChange={() => {}} />
          </View>
          <View style={styles.row}>
            <Text>Titreşim</Text>
            <Switch value={false} onValueChange={() => {}} />
          </View>
          <View style={{ flexDirection: "row", marginTop: 8 }}>
            {[
              { key: "m", color: themeCtx.colors.primary },
              { key: "p", color: themeCtx.colors.accent },
              { key: "g", color: themeCtx.colors.success },
            ].map((c) => (
              <Pressable key={c.key} style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: c.color, marginRight: 8 }} onPress={() => Alert.alert("Seçildi", "Vurgu rengi değişti (demo)")}/>
            ))}
          </View>
        </View>

        <Text style={{ fontWeight: "700", marginBottom: 8, marginTop: 12, color: themeCtx.colors.text }}>Son Bildirimler</Text>

        {/* render notifications */}
        {loading ? (
          <View style={{ padding: 24, alignItems: "center" }}>
            <ActivityIndicator />
          </View>
        ) : (
          notifications.map((item) => (
            <View key={item.id} style={[styles.card, { borderColor: themeCtx.colors.border }]}>
              <Text style={{ fontWeight: "700", color: themeCtx.colors.text }}>{item.title}</Text>
              <Text variant="muted" style={{ marginTop: 6 }}>{item.body}</Text>
              <Text variant="muted" style={{ marginTop: 6, fontSize: 11 }}>{new Date(item.time ?? Date.now()).toLocaleString("tr-TR")}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Fixed bottom Save bar */}
      <View style={{ paddingBottom: insets.bottom, backgroundColor: themeCtx.colors.background }}>
        <View style={{ height: 12 }} />
        <Pressable
          onPress={() => Alert.alert("Kaydedildi", "Ayarlar (demo) kaydedildi")}
          style={{
            marginHorizontal: 16,
            height: BUTTON_HEIGHT,
            borderRadius: 12,
            backgroundColor: themeCtx.colors.primary,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Kaydet</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8, paddingHorizontal: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  card: { backgroundColor: "#fff", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#eee", marginBottom: 10 },
});
