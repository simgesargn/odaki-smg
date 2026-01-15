import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text as RNText,
  FlatList,
} from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";
import { useTheme } from "../../ui/theme/ThemeProvider";

import {
  loadFocusSession,
  saveFocusSession,
  clearFocusSession,
  loadFocusStats,
  addCompletedFocusSession,
  addFlower,
  loadFlowers,
  FocusSessionState,
  FocusStats,
  Flower,
} from "../../features/focus/focusStore";

const DURATIONS = [15, 25, 45, 60];

export const FocusScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const [durationMin, setDurationMin] = useState<number>(25);
  const [session, setSession] = useState<FocusSessionState | null>(null);
  const [remainingSec, setRemainingSec] = useState<number>(0);
  const [stats, setStats] = useState<FocusStats | null>(null);
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // load initial data
  useEffect(() => {
    let mounted = true;
    (async () => {
      const s = await loadFocusSession();
      if (!mounted) return;
      setSession(s);
      if (s.isRunning && s.endsAt) {
        const rem = Math.max(0, Math.ceil((s.endsAt - Date.now()) / 1000));
        setRemainingSec(rem);
        startInterval();
      } else {
        setRemainingSec(s.durationMinutes * 60);
      }

      const st = await loadFocusStats();
      if (!mounted) return;
      setStats(st);

      const fl = await loadFlowers();
      if (!mounted) return;
      setFlowers(fl);
    })();

    return () => {
      mounted = false;
      stopInterval();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // interval helpers
  const startInterval = () => {
    stopInterval();
    intervalRef.current = setInterval(() => {
      setRemainingSec((r) => {
        if (r <= 1) {
          // finish
          stopInterval();
          handleComplete();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  };

  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const formatMMSS = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  const getStage = (progressPercent: number) => {
    if (progressPercent < 25) return "Tohum";
    if (progressPercent < 60) return "Filiz";
    if (progressPercent < 90) return "Tomurcuk";
    return "Çiçek";
  };

  const handleStart = async () => {
    const now = Date.now();
    const endsAt = now + durationMin * 60 * 1000;
    const s: FocusSessionState = { isRunning: true, startedAt: now, endsAt, durationMinutes: durationMin };
    await saveFocusSession(s);
    setSession(s);
    setRemainingSec(durationMin * 60);
    startInterval();
  };

  const handleStop = async () => {
    stopInterval();
    await clearFocusSession();
    setSession({ isRunning: false, durationMinutes: durationMin });
    setRemainingSec(durationMin * 60);
  };

  const handleComplete = async () => {
    // called when remainingSec reaches 0
    const minutes = session?.durationMinutes ?? durationMin;
    try {
      await addCompletedFocusSession(minutes);
      await addFlower({ type: "default", earnedAt: Date.now() });
    } catch {
      // ignore
    } finally {
      await clearFocusSession();
      setSession({ isRunning: false, durationMinutes });
      // refresh stats and flowers
      try {
        const st = await loadFocusStats();
        const fl = await loadFlowers();
        setStats(st);
        setFlowers(fl);
      } catch {
        // ignore
      }
      setSuccessMsg("Çiçek kazandın! 🌸");
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const onSelectDuration = (m: number) => {
    if (session?.isRunning) return; // don't change while running
    setDurationMin(m);
    setRemainingSec(m * 60);
  };

  const totalHoursText = () => {
    const totalSec = stats?.totalSeconds ?? 0;
    const hours = (totalSec / 3600) || 0;
    return `${hours.toFixed(1)} saat`;
  };

  const visibleFlowers = flowers.slice(0, 8);

  const progressPercent =
    ((session?.isRunning ? (1 - remainingSec / (session.durationMinutes * 60)) : ((durationMin * 60 - remainingSec) / (durationMin * 60))) * 100) || 0;

  const stage = getStage(Math.max(0, Math.min(100, progressPercent)));

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <SafeAreaView style={[styles.safe, { backgroundColor: "#F6F7FB" }]}>
        <Screen>
          <View style={styles.headerRow}>
            <Text variant="h2">Odak</Text>
            <Pressable onPress={() => navigation.navigate(Routes.Garden as any)} style={{ padding: 8 }}>
              <Text>Bahçem</Text>
            </Pressable>
          </View>

          {/* Top stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text variant="muted">Toplam</Text>
              <Text style={{ fontWeight: "700" }}>{totalHoursText()}</Text>
            </View>
            <View style={styles.statCard}>
              <Text variant="muted">Seri</Text>
              <Text style={{ fontWeight: "700" }}>{stats?.streakDays ?? 0}</Text>
            </View>
            <View style={styles.statCard}>
              <Text variant="muted">Çiçek</Text>
              <Text style={{ fontWeight: "700" }}>{stats?.flowersEarned ?? 0}</Text>
            </View>
          </View>

          {/* Big seed/flower area */}
          <View style={styles.seedArea}>
            <Text style={{ fontSize: 18, fontWeight: "800" }}>{stage}</Text>
            <Text variant="muted" style={{ marginTop: 8 }}>
              {session?.isRunning ? `Kalan: ${formatMMSS(remainingSec)}` : `Hedef: ${durationMin} dk`}
            </Text>
            {session?.isRunning ? (
              <View style={{ marginTop: 12 }}>
                <Pressable style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={handleStop}>
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Durdur</Text>
                </Pressable>
              </View>
            ) : (
              <View style={{ marginTop: 12 }}>
                <Pressable style={[styles.primaryButton, { backgroundColor: "#FF8A3D" }]} onPress={handleStart}>
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Çiçeği Büyütmeye Başla</Text>
                </Pressable>
              </View>
            )}
            {successMsg ? <Text style={{ marginTop: 8, color: "#16A34A" }}>{successMsg}</Text> : null}
          </View>

          {/* duration selector */}
          <View style={styles.durationRow}>
            {DURATIONS.map((d) => (
              <Pressable
                key={d}
                onPress={() => onSelectDuration(d)}
                style={[
                  styles.durationPill,
                  durationMin === d ? { backgroundColor: colors.primary } : { backgroundColor: "#fff", borderWidth: 1, borderColor: "#EEE" },
                ]}
              >
                <Text style={durationMin === d ? { color: "#fff", fontWeight: "700" } : { fontWeight: "600" }}>{d} dk</Text>
              </Pressable>
            ))}
          </View>

          {/* Flower collection */}
          <View style={{ marginTop: 16 }}>
            <Text style={{ fontWeight: "700", marginBottom: 8 }}>Çiçek Koleksiyonum</Text>
            <FlatList
              data={visibleFlowers.length ? visibleFlowers : Array.from({ length: 4 })}
              keyExtractor={(_, i) => String(i)}
              numColumns={4}
              columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 12 }}
              renderItem={({ item, index }) =>
                item ? (
                  <View style={[styles.flowerBox, { backgroundColor: "#fff" }]}>
                    <Text style={{ fontSize: 24 }}>🌸</Text>
                    <Text variant="muted" style={{ marginTop: 6, fontSize: 12 }}>
                      {new Date((item as Flower).earnedAt).toLocaleDateString()}
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.flowerBox, { backgroundColor: "#F3F4F6" }]} key={`empty-${index}`}>
                    <Text variant="muted">—</Text>
                  </View>
                )
              }
            />
          </View>
        </Screen>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 8 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", padding: 16, gap: 8 },
  statCard: { flex: 1, borderRadius: 12, padding: 12, backgroundColor: "#fff", alignItems: "center" },

  seedArea: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },

  primaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },

  durationRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, marginTop: 12, gap: 8 },
  durationPill: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: "center" },

  card: {
    borderRadius: 16,
    padding: 16,
    marginTop: 6,
    backgroundColor: "#fff",
  },

  mainButton: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  flowerBox: {
    flex: 1,
    minWidth: 0,
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
});
