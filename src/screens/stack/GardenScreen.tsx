import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../ui/Text";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../../context/UserContext";
import { db } from "../../firebase/firebase";
import { collection, query, orderBy, onSnapshot, getDoc, doc } from "firebase/firestore";
import { useTheme } from "../../ui/ThemeProvider";

type FlowerRow = { id: string; type: string; earnedAt?: number };

export const GardenScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { user } = useUser();
  const theme = useTheme();

  const uid = user?.uid ?? null;

  const [flowers, setFlowers] = useState<FlowerRow[] | null>(null);
  const [streakDays, setStreakDays] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!uid) {
      setFlowers([]);
      setStreakDays(null);
      setLoading(false);
      return;
    }

    let unsubFlowers: (() => void) | null = null;
    let mounted = true;

    (async () => {
      try {
        // Try listening to users/{uid}/flowers subcollection
        const colRef = collection(db, "users", uid, "flowers");
        const q = query(colRef, orderBy("earnedAt", "desc"));
        unsubFlowers = onSnapshot(
          q,
          (snap) => {
            if (!mounted) return;
            const items: FlowerRow[] = [];
            snap.forEach((d) => {
              const data: any = d.data();
              items.push({
                id: d.id,
                type: data?.type ?? "default",
                earnedAt: data?.earnedAt ?? null,
              });
            });
            if (items.length > 0) {
              setFlowers(items);
              setLoading(false);
            } else {
              // fallback to user doc if no subcollection items
              fetchUserDocFallback();
            }
          },
          () => {
            // on error fallback to user doc
            fetchUserDocFallback();
          }
        );
      } catch {
        await fetchUserDocFallback();
      }
    })();

    async function fetchUserDocFallback() {
      try {
        const uref = doc(db, "users", uid);
        const snap = await getDoc(uref);
        if (!mounted) return;
        if (snap.exists()) {
          const data: any = snap.data();
          // try user.flowers (array) or flowersEarned + maybe flowersMeta
          if (Array.isArray(data?.flowers) && data.flowers.length > 0) {
            const arr = (data.flowers as any[]).map((f: any, idx: number) => ({
              id: f.id ?? `f-${idx}`,
              type: f.type ?? "default",
              earnedAt: f.earnedAt ?? null,
            }));
            setFlowers(arr);
          } else {
            // no per-item data, set null/empty but use flowersEarned/streak for summary
            setFlowers([]);
          }
          if (typeof data?.streakDays === "number") setStreakDays(data.streakDays);
          else if (typeof data?.streak === "number") setStreakDays(data.streak);
          if (typeof data?.flowersEarned === "number") {
            // if only count present, synthesize empty array but keep count via flowers.length fallback
            if (!Array.isArray(data?.flowers) || data.flowers.length === 0) {
              // set empty array but we'll use count from data.flowersEarned
              setFlowers([]);
            }
          }
        } else {
          setFlowers([]);
        }
      } catch {
        setFlowers([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    return () => {
      mounted = false;
      if (unsubFlowers) unsubFlowers();
    };
  }, [uid]);

  const totalCount = flowers ? flowers.length : 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      {/* native stack header will show back button */}
      <View style={styles.header}>
        <Text variant="h2">Bahçem</Text>
      </View>

      <View style={styles.container}>
        {loading ? (
          <View style={{ padding: 20, alignItems: "center" }}>
            <ActivityIndicator />
          </View>
        ) : (
          <>
            <View style={styles.summary}>
              <View style={styles.summaryCol}>
                <Text style={{ fontWeight: "700", fontSize: 18, color: theme.text }}>{totalCount}</Text>
                <Text variant="muted">Toplam Çiçek</Text>
              </View>
              <View style={styles.summaryCol}>
                <Text style={{ fontWeight: "700", fontSize: 18, color: theme.text }}>{streakDays ?? "—"}</Text>
                <Text variant="muted">Seri (gün)</Text>
              </View>
            </View>

            {/* Yeni: Demo Premium olmayan çiçek grid (silik / kilitli) */}
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontWeight: "700", marginBottom: 8, color: theme.text }}>Çiçek Koleksiyonum</Text>
              <View style={styles.grid}>
                {[
                  "Tohum","Papatya","Lale","Gül",
                  "Menekşe","Sümbül","Orkide","Kaktüs",
                ].map((label, i) => (
                  <View key={label + i} style={[styles.gridItem, { backgroundColor: theme.card }]}>
                    <Text style={{ fontSize: 26, opacity: 0.45 }}>
                      {["🌱","🌼","🌷","🌹","💜","🌸","🪷","🌵"][i] ?? "🌱"}
                    </Text>
                    <Text variant="muted" style={{ marginTop: 6, opacity: 0.6 }}>{label}</Text>
                    <Text style={styles.lock}>🔒</Text>
                  </View>
                ))}
              </View>
            </View>

            {flowers && flowers.length > 0 ? (
              <FlatList
                data={flowers}
                keyExtractor={(f) => f.id}
                contentContainerStyle={{ paddingVertical: 12 }}
                renderItem={({ item }) => (
                  <View style={styles.card}>
                    <Text style={{ fontSize: 28 }}>{item.type === "lotus" ? "🪷" : item.type === "sunflower" ? "🌻" : item.type === "orchid" ? "🌸" : "🌱"}</Text>
                    <View style={{ marginLeft: 12 }}>
                      <Text style={{ fontWeight: "700" }}>{item.type}</Text>
                      <Text variant="muted">{item.earnedAt ? new Date(item.earnedAt).toLocaleDateString("tr-TR") : "Tarih yok"}</Text>
                    </View>
                  </View>
                )}
              />
            ) : (
              <View style={{ padding: 24, alignItems: "center" }}>
                <Text variant="muted">Henüz çiçeğin yok. Odak oturumlarını tamamladıkça çiçek kazanacaksın.</Text>
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  back: { padding: 8 },
  container: { paddingHorizontal: 16, paddingBottom: 24, flex: 1 },
  summary: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#fff", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#eee", marginBottom: 12 },
  summaryCol: { alignItems: "center", flex: 1 },
  card: { flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: "#fff", borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: "#eee" },

  // grid styles
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 8 },
  gridItem: {
    width: "23%",
    aspectRatio: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    marginBottom: 12,
    opacity: 0.45,
    borderWidth: 1,
    borderColor: "#eee",
  },
  lock: { position: "absolute", right: 8, bottom: 8, fontSize: 12, opacity: 0.9 },
});
