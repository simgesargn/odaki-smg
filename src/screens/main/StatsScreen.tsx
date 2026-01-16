import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Pressable, Dimensions, ScrollView } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { theme, colors } from "../../ui/theme";
import { auth, db } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";
import { loadFocusStats } from "../../features/focus/focusStore";
import { useUser } from "../../context/UserContext";
import { PremiumBanner } from "../../ui/components/PremiumBanner";
import { StatCard } from "../../ui/components/StatCard";
import { demoWeekly, demoUserStats } from "../../data/mockData";

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

  const navigation = useNavigation<any>();

  // load focus stats for streak / flowers
  const [focusStats, setFocusStats] = useState<{ streakDays: number; flowersEarned: number }>({ streakDays: 0, flowersEarned: 0 });
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await loadFocusStats();
        if (!mounted) return;
        setFocusStats({ streakDays: s.streakDays ?? s.streak ?? 0, flowersEarned: s.flowersEarned ?? 0 });
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

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
      <View style={{ marginHorizontal: 16, marginTop: 12 }}>
        <PremiumBanner onPress={() => navigation.navigate(Routes.Premium as any)} />
      </View>

      <View style={{ marginHorizontal: 16, marginTop: 16 }}>
        <Text variant="h2">İstatistikler</Text>
        <View style={styles.tabsWrap}>
          {(
            [
              { key: "today", label: "Bugün" },
              { key: "weekly", label: "Haftalık" },
              { key: "monthly", label: "Aylık" },
            ] as const
          ).map((t) => (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key as any)}
              style={[styles.tabBtn, tab === (t.key as any) ? styles.tabActive : styles.tabInactive]}
            >
              <Text style={tab === (t.key as any) ? styles.tabTextActive : styles.tabText}>{t.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <StatCard icon="⏱️" label="Toplam Odak (dk)" value={demoUserStats.totalFocusMinutes ?? currentMetrics.totalMinutes} />
          <StatCard icon="🔥" label="Tamamlanan oturum" value={demoUserStats.completedSessions ?? currentMetrics.completedSessions} />
          <StatCard icon="✅" label="Tamamlanan görev" value={demoUserStats.completedTasks ?? currentMetrics.completedTasks} />
        </View>

        {/* Son 7 Gün */}
        <View style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>Son 7 Gün</Text>
          {(function computeLast7() {
            const days = Array.from({ length: 7 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (6 - i));
              const label = d.toLocaleDateString("tr-TR", { weekday: "short", day: "numeric", month: "numeric" });
              const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
              const end = start + 24 * 60 * 60 * 1000;
              const minutes = sessions.reduce((acc: number, s: any) => {
                const sd = toDate(s.startedAt ?? s.createdAt ?? s.endedAt);
                if (!sd) return acc;
                const t = sd.getTime();
                if (t >= start && t < end) {
                  const dur = Number(s.durationSec ?? s.duration ?? 0);
                  return acc + Math.round((dur || 0) / 60);
                }
                return acc;
              }, 0);
              const completedTasks = tasks.reduce((cnt: number, t: any) => {
                const cd = toDate(t.completedAt ?? t.completed_at ?? t.updatedAt ?? t.updated_at ?? t.createdAt);
                if (!cd) return cnt;
                const ct = cd.getTime();
                if (ct >= start && ct < end) return cnt + 1;
                return cnt;
              }, 0);
              return { label, minutes, completedTasks };
            });
            return days.map((d, idx) => (
              <View key={d.label + idx} style={styles.dayRow}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "700" }}>{d.label}</Text>
                  <Text variant="muted" style={{ marginTop: 4 }}>{d.minutes} dk odak • {d.completedTasks} görev</Text>
                </View>
                <View style={{ justifyContent: "center", alignItems: "flex-end" }}>
                  <Text style={{ fontWeight: "700" }}>{d.minutes} dk</Text>
                </View>
              </View>
            ));
          })()}
        </View>

        {/* Mini özet: Seri ve Çiçek */}
        <View style={{ flexDirection: "row", marginTop: 12, gap: 12 }}>
          <View style={[styles.statMini, { flex: 1 }]}>
            <Text variant="muted">Seri</Text>
            <Text style={{ fontWeight: "800", fontSize: 20 }}>{focusStats.streakDays}</Text>
          </View>
          <View style={[styles.statMini, { flex: 1 }]}>
            <Text variant="muted">Çiçek</Text>
            <Text style={{ fontWeight: "800", fontSize: 20 }}>{focusStats.flowersEarned}</Text>
          </View>
        </View>

        {/* Bu hafta - küçük özet kartları */}
        <View style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>Bu hafta</Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={[styles.smallCard, { flex: 1 }]}>
              <Text variant="muted">En uzun oturum</Text>
              <Text style={{ fontWeight: "800", marginTop: 8 }}>0 dk</Text>
            </View>
            <View style={[styles.smallCard, { flex: 1 }]}>
              <Text variant="muted">En çok görev günü</Text>
              <Text style={{ fontWeight: "800", marginTop: 8 }}>-</Text>
            </View>
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

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  smallCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "flex-start",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  promoCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  promoBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: theme.colors.primary },
  tabsWrap: { flexDirection: "row", marginTop: 12, justifyContent: "center", gap: 8 },
  tabBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  tabActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  tabInactive: { backgroundColor: "#F3F4F6", borderColor: "#EEE" },
  tabText: { color: theme.colors.text },
  tabTextActive: { color: "#fff", fontWeight: "700" },

  kpiRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  kpiIcon: { fontSize: 20, marginBottom: 6, textAlign: "center" },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: "#eee",
  },
  statLabel: { fontSize: 12, color: "#6b7280", marginBottom: 6, textAlign: "center" },
  statBig: { fontSize: 20, fontWeight: "800", color: theme.colors.text },

  dayRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 12, marginBottom: 8, borderWidth: 1, borderColor: "#f3f3f3" },

  statMini: { backgroundColor: "#fff", borderRadius: 12, padding: 12, alignItems: "center", borderWidth: 1, borderColor: "#eee" },
});
