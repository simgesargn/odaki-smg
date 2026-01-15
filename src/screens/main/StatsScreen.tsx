import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Pressable, Dimensions, ScrollView } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { theme } from "../../ui/theme";
import { auth, db } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";

type SessionDoc = {
  userId: string;
  durationSec?: number;
  status?: string;
  startedAt?: any;
  endedAt?: any;
  createdAt?: any;
  id?: string;
};

type TaskDoc = {
  userId: string;
  completed?: boolean;
  status?: string;
  completedAt?: any;
  updatedAt?: any;
  createdAt?: any;
  id?: string;
};

const { width } = Dimensions.get("window");

export const StatsScreen: React.FC = () => {
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid || null);
  const [sessions, setSessions] = useState<SessionDoc[]>([]);
  const [tasks, setTasks] = useState<TaskDoc[]>([]);
  const [tab, setTab] = useState<"today" | "weekly" | "monthly">("today");

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => setUid(u?.uid || null));
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!uid) {
      setSessions([]);
      setTasks([]);
      return;
    }

    const qS = query(collection(db, "focusSessions"), where("userId", "==", uid));
    const unsubS = onSnapshot(
      qS,
      (snap) => {
        const items: SessionDoc[] = [];
        snap.forEach((d) => items.push({ ...(d.data() as any), id: d.id }));
        setSessions(items);
      },
      () => setSessions([])
    );

    const qT = query(collection(db, "tasks"), where("userId", "==", uid));
    const unsubT = onSnapshot(
      qT,
      (snap) => {
        const items: TaskDoc[] = [];
        snap.forEach((d) => items.push({ ...(d.data() as any), id: d.id }));
        setTasks(items);
      },
      () => setTasks([])
    );

    return () => {
      unsubS();
      unsubT();
    };
  }, [uid]);

  // Helper: parse firestore timestamp-like to Date
  const toDate = (v: any): Date | null => {
    if (!v) return null;
    if (v instanceof Date) return v;
    if (typeof v === "number") return new Date(v);
    if (v?.toDate && typeof v.toDate === "function") return v.toDate();
    try {
      return new Date(v);
    } catch {
      return null;
    }
  };

  // Sabit dummy metrikler (istenen değerler)
  const dummyStats = {
    today: { totalMinutes: 0, completedSessions: 0, completedTasks: 2 },
    weekly: { totalMinutes: 120, completedSessions: 5, completedTasks: 12 },
    monthly: { totalMinutes: 540, completedSessions: 18, completedTasks: 44 },
  };

  const currentMetrics = tab === "today" ? dummyStats.today : tab === "weekly" ? dummyStats.weekly : dummyStats.monthly;

  if (!uid) {
    return (
      <Screen>
        <View style={{ padding: 16 }}>
          <Text variant="h2">İstatistikler</Text>
          <Text variant="muted" style={{ marginTop: 12 }}>
            Giriş gerekli.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Text variant="h2">İstatistikler</Text>
        <View style={styles.tabsRow}>
          <Pressable style={[styles.tab, tab === "today" && styles.tabActive]} onPress={() => setTab("today")}>
            <Text style={tab === "today" ? styles.tabTextActive : styles.tabText}>Bugün</Text>
          </Pressable>
          <Pressable style={[styles.tab, tab === "weekly" && styles.tabActive]} onPress={() => setTab("weekly")}>
            <Text style={tab === "weekly" ? styles.tabTextActive : styles.tabText}>Haftalık</Text>
          </Pressable>
          <Pressable style={[styles.tab, tab === "monthly" && styles.tabActive]} onPress={() => setTab("monthly")}>
            <Text style={tab === "monthly" ? styles.tabTextActive : styles.tabText}>Aylık</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Tek yapı: sekmeye göre dummy metrikler gösterilir */}
        <View style={styles.row}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Toplam Odak (dk)</Text>
            <Text style={styles.statBig}>{currentMetrics.totalMinutes}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Tamamlanan oturum</Text>
            <Text style={styles.statBig}>{currentMetrics.completedSessions}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Tamamlanan görev</Text>
            <Text style={styles.statBig}>{currentMetrics.completedTasks}</Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  headerRow: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tabsRow: { flexDirection: "row" },
  tab: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginLeft: 8, backgroundColor: "transparent" },
  tabActive: { backgroundColor: "#F3F0FF" },
  tabText: { color: "#374151" },
  tabTextActive: { color: "#6C5CE7", fontWeight: "700" },

  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 14,
    alignItems: "center",
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  statLabel: { fontSize: 13, color: "#6b7280", marginBottom: 6 },
  statBig: { fontSize: 28, fontWeight: "800", color: theme.colors.text },

  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  chartTitle: { fontSize: 14, fontWeight: "700", marginBottom: 12, color: theme.colors.text },
  chartRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", paddingHorizontal: 6, height: 140 },
  chartBarWrap: { flex: 1, alignItems: "center", marginHorizontal: 4 },
  chartBar: { width: Math.max(8, Math.round((width - 64) / 20)), backgroundColor: theme.colors.primary, borderRadius: 6 },
  chartLabel: { marginTop: 6, fontSize: 12, color: "#6b7280" },

  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  summaryCard: { flex: 1, backgroundColor: "#fff", marginHorizontal: 6, borderRadius: 10, padding: 12, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  summaryLabel: { fontSize: 12, color: "#6b7280" },
  summaryValue: { fontSize: 16, fontWeight: "700", marginTop: 6 },

  // reuse existing styles for other components if needed
});
