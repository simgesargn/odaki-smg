import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Pressable, FlatList } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";
import { theme, colors } from "../../ui/theme";
import { priorityLabel, priorityColors } from "../../ui/priority";
import { loadFocusStats } from "../../features/focus/focusStore";
import { auth, db } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, updateDoc, doc, serverTimestamp } from "firebase/firestore";

type TaskItem = {
  id: string;
  title: string;
  priority?: "Yüksek" | "Orta" | "Düşük";
  due?: string;
  done?: boolean;
};

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid ?? null);

  const [filter, setFilter] = useState<"Tümü" | "Bugün" | "Yüksek">("Tümü");

  const [focusStats, setFocusStats] = useState<{ totalMinutes: number }>({ totalMinutes: 0 });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const st = await loadFocusStats();
        if (!mounted) return;
        const minutes = Math.round((st.totalSeconds ?? 0) / 60);
        setFocusStats({ totalMinutes: minutes });
      } catch {
        setFocusStats({ totalMinutes: 0 });
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Subscribe auth -> tasks realtime
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null));
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!uid) {
      setTasks([]);
      return;
    }
    const q = query(collection(db, "tasks"), where("userId", "==", uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items: TaskItem[] = [];
        snap.forEach((d) => {
          const data = d.data() as any;
          items.push({
            id: d.id,
            title: data.title ?? "Unnamed",
            priority: data.priority ?? "Orta",
            due: data.due ?? "",
            done: Boolean(data.completed ?? data.done ?? false),
          });
        });
        setTasks(items);
      },
      () => {
        setTasks([]);
      }
    );
    return () => unsub();
  }, [uid]);

  const filteredTasks = useMemo(() => {
    if (filter === "Tümü") return tasks;
    if (filter === "Bugün") return tasks.filter((t) => t.due?.toLowerCase().includes("bugün"));
    if (filter === "Yüksek") return tasks.filter((t) => t.priority === "Yüksek");
    return tasks;
  }, [tasks, filter]);

  // toggle completed (optimistic + persist)
  const toggleTask = async (taskId: string, current: boolean) => {
    // optimistic update
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, done: !current } : t)));
    try {
      const ref = doc(db, "tasks", taskId);
      await updateDoc(ref, { completed: !current, completedAt: serverTimestamp() });
    } catch {
      // revert on failure
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, done: current } : t)));
    }
  };

  return (
    <Screen>
      <View style={{ padding: 16, paddingTop: 18 }}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.navigate(Routes.Notifications as any)} style={styles.topIcon}>
            <Text style={{ fontSize: 18 }}>🔔</Text>
          </Pressable>

          <View style={styles.topTitleWrap}>
            <Text style={styles.topTitle}>Odaklan, Planla, Büyüt</Text>
            <Text style={styles.topSubtitle}>Günlük hedeflerine odaklan.</Text>
          </View>

          <Pressable onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.topIcon}>
            <Text style={{ fontSize: 18 }}>☰</Text>
          </Pressable>
        </View>

        {/* Statistik kartları */}
        <View style={{ height: 12 }} />

        <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
          <View style={[styles.kpiCard, { backgroundColor: colors.primarySoft }]}>
            <Text style={styles.kpiIcon}>🗂️</Text>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={styles.kpiValue}>{tasks.length}</Text>
              <Text style={styles.kpiLabel}>Görevler</Text>
            </View>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: "#F0F7FF" }]}>
            <Text style={styles.kpiIcon}>⏱️</Text>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={styles.kpiValue}>{focusStats.totalMinutes}</Text>
              <Text style={styles.kpiLabel}>Odak (dk)</Text>
            </View>
          </View>
        </View>

        {/* Filtreler */}
        <View style={{ marginTop: 22 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontWeight: "700" }}>Gündemdeki görevler</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(["Tümü", "Bugün", "Yüksek"] as const).map((f) => (
                <Pressable
                  key={f}
                  onPress={() => setFilter(f)}
                  style={[
                    styles.filterPill,
                    filter === f
                      ? { backgroundColor: colors.primarySoft, borderColor: colors.primary }
                      : { backgroundColor: "#F3F4F6", borderColor: "#EEE" },
                  ]}
                >
                  <Text style={filter === f ? { color: colors.primary, fontWeight: "700" } : { fontWeight: "600", color: colors.text }}>
                    {f}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={{ height: 12 }} />

          {filteredTasks.length === 0 ? (
            <View style={[styles.card, { padding: 16, alignItems: "center" }]}>
              <Text style={{ color: colors.muted }}>Bugün için görev yok 🎉</Text>
            </View>
          ) : (
            <FlatList
              data={filteredTasks}
              keyExtractor={(i) => i.id}
              renderItem={({ item }) => {
                const c = priorityColors(item.priority);
                return (
                  <View style={[styles.card, styles.taskCard]} key={item.id}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.taskTitle}>{item.title}</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                        <View style={[styles.priorityBadge, { backgroundColor: c.bg }]}>
                          <View style={[styles.priorityDot, { backgroundColor: c.dot }]} />
                          <Text style={[styles.priorityText, { color: c.fg }]}>{priorityLabel(item.priority)}</Text>
                        </View>
                        <Text style={{ marginLeft: 10, color: colors.muted }}>{item.due ?? ""}</Text>
                      </View>
                    </View>

                    <View style={{ marginLeft: 12 }}>
                      <Pressable onPress={() => toggleTask(item.id, !!item.done)} hitSlop={8} style={{ padding: 6 }}>
                        <Text style={{ fontSize: 18 }}>{item.done ? "✅" : "◻️"}</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>
      </View>
    </Screen>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  topIcon: { padding: 8 },
  topTitleWrap: { flex: 1, alignItems: "center" },
  topTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
  topSubtitle: { marginTop: 4, fontSize: 13, color: colors.muted, textAlign: "center" },

  kpiCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    // subtle shadow
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  kpiIcon: { fontSize: 20, marginRight: 8 },
  kpiValue: { fontSize: 22, fontWeight: "800", color: colors.text },
  kpiLabel: { fontSize: 12, color: colors.muted, marginTop: 4 },

  filterPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    marginBottom: 10,
  },

  taskCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  taskTitle: { fontSize: 16, fontWeight: "700", color: colors.text },

  priorityBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 6, borderRadius: 999 },
  priorityDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  priorityText: { fontSize: 12, fontWeight: "700" },
});
