import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { Screen, Card, Chip, IconButton, StatCard } from "../../ui/Primitives";
import { Text } from "../../ui/Text";
import { auth, db } from "../../firebase/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Routes } from "../../navigation/routes";
import { useNavigation } from "@react-navigation/native";
import { TaskDoc } from "../../firebase/firestoreTypes";
import { onAuthStateChanged } from "firebase/auth";
import { theme } from "../../ui/theme";

export const HomeScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid || null);
  const [tasks, setTasks] = useState<TaskDoc[]>([]);
  const [filter, setFilter] = useState<"all" | "today" | "high">("all");
  const [todayFocusMinutes, setTodayFocusMinutes] = useState<number>(0);

  useLayoutEffect(() => {
    // temiz navigator başlığı, sadece iç header gösterilecek
    nav.setOptions?.({ headerTitle: "" });
  }, [nav]);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => setUid(u?.uid || null));
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!uid) {
      setTasks([]);
      setTodayFocusMinutes(0);
      return;
    }
    const qTasks = query(collection(db, "tasks"), where("userId", "==", uid));
    const unsubTasks = onSnapshot(
      qTasks,
      (snap) => {
        const items: TaskDoc[] = [];
        snap.forEach((d) => items.push({ ...(d.data() as any), id: d.id }));
        items.sort((a, b) => {
          const aTime = (a.createdAt as any)?.toMillis ? (a.createdAt as any).toMillis() : 0;
          const bTime = (b.createdAt as any)?.toMillis ? (b.createdAt as any).toMillis() : 0;
          if (aTime && bTime) return bTime - aTime;
          return (a.title || "").localeCompare(b.title || "");
        });
        setTasks(items);
      },
      () => setTasks([])
    );

    const qFocus = query(collection(db, "focusSessions"), where("userId", "==", uid));
    const unsubFocus = onSnapshot(
      qFocus,
      (snap) => {
        const now = new Date();
        const total = snap.docs.reduce((acc, d) => {
          const data = d.data() as any;
          if (data.status !== "completed") return acc;
          const ended = data.endedAt && data.endedAt.toDate ? data.endedAt.toDate() : data.endedAt ? new Date(data.endedAt) : null;
          if (!ended) return acc;
          if (ended.getFullYear() === now.getFullYear() && ended.getMonth() === now.getMonth() && ended.getDate() === now.getDate()) {
            return acc + (data.durationMinutes || 0);
          }
          return acc;
        }, 0);
        setTodayFocusMinutes(total);
      },
      () => setTodayFocusMinutes(0)
    );

    return () => {
      unsubTasks();
      unsubFocus();
    };
  }, [uid]);

  const priorityLabel = (p?: string) => {
    if (p === "high") return "Yüksek";
    if (p === "low") return "Düşük";
    return "Orta";
  };

  const filtered = tasks.filter((t) => {
    if (filter === "all") return true;
    if (filter === "high") return t.priority === "high";
    if (filter === "today") {
      if (!t.dueAt) return false;
      const due = (t.dueAt as any).toDate();
      const now = new Date();
      return due.getFullYear() === now.getFullYear() && due.getMonth() === now.getMonth() && due.getDate() === now.getDate();
    }
    return true;
  });

  const activeCount = tasks.filter((t) => !t.completed).length;
  const unreadBadge = activeCount > 0;

  return (
    <Screen>
      {/* Header */}
      <View style={styles.headerRow}>
        <IconButton icon={<Text>🔔</Text>} onPress={() => nav.navigate(Routes.Notifications as any)} badge={unreadBadge} />
        <Text style={[theme.textStyles.h2, { color: theme.colors.text }]}>{'Odaklan, Planla, Büyüt'}</Text>
        <IconButton icon={<Text>☰</Text>} onPress={() => nav.navigate("Menu" as any)} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard title="Görevler" value={activeCount} style={{ flex: 1, marginRight: theme.spacing.s12 / 2 }} />
        <StatCard title="Odak (dk)" value={todayFocusMinutes} style={{ flex: 1, marginLeft: theme.spacing.s12 / 2 }} />
      </View>

      {/* Section label */}
      <Text style={[theme.textStyles.caption, { color: theme.colors.muted, marginTop: theme.spacing.s16 }]}>Gündemdeki görevler</Text>

      {/* Chips */}
      <View style={styles.chipsRow}>
        <Chip label="Tümü" active={filter === "all"} onPress={() => setFilter("all")} style={{ marginRight: theme.spacing.s8 }} />
        <Chip label="Bugün" active={filter === "today"} onPress={() => setFilter("today")} style={{ marginRight: theme.spacing.s8 }} />
        <Chip label="Yüksek" active={filter === "high"} onPress={() => setFilter("high")} />
      </View>

      {/* List */}
      {filtered.length === 0 ? (
        <Card style={{ marginTop: theme.spacing.s16, alignItems: "center" }}>
          <Text variant="muted">Bugün görev yok</Text>
          <Text variant="muted" style={{ marginTop: theme.spacing.s8 }}>Yapılacak yeni bir görev ekleyebilirsin.</Text>
        </Card>
      ) : (
        <FlatList
          style={{ marginTop: theme.spacing.s16 }}
          data={filtered}
          keyExtractor={(i) => i.id || i.title}
          renderItem={({ item }) => (
            <Pressable onPress={() => nav.navigate(Routes.EditTask as any, { taskId: item.id })} style={{ marginBottom: theme.spacing.s12 }}>
              <Card style={{ padding: theme.spacing.s16 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flex: 1, paddingRight: theme.spacing.s12 }}>
                    <Text style={[theme.textStyles.h2, { color: theme.colors.text }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={[theme.textStyles.body, { color: theme.colors.muted, marginTop: theme.spacing.s8 }]}>
                      {item.categoryName} • {priorityLabel(item.priority)}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ color: theme.colors.primary }}>{item.completed ? "✓" : " "}</Text>
                  </View>
                </View>
              </Card>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.s12,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: theme.spacing.s16,
    gap: theme.spacing.s12,
  },
  chipsRow: {
    flexDirection: "row",
    marginTop: theme.spacing.s12,
  },
});
