import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
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
import { useNavigation, useFocusEffect } from "@react-navigation/native";
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
import { loadFocusState, saveFocusState, pickRandomFlowerId } from "../../focus/focusStore";

const DURATIONS = [15, 25, 45, 60];

export const FocusScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate(Routes.FocusSettings as any)} style={{ paddingRight: 12 }}>
          <Text style={{ fontSize: 20 }}>⚙️</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  const [selectedMinutes, setSelectedMinutes] = useState<number>(25);
  const [running, setRunning] = useState<boolean>(false);
  const [remainingSec, setRemainingSec] = useState<number>(selectedMinutes * 60);

  const [localTotalSeconds, setLocalTotalSeconds] = useState<number>(0);
  const [localStreak, setLocalStreak] = useState<number>(0);
  const [localFlowers, setLocalFlowers] = useState<string[]>([]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          const s = await loadFocusState();
          if (!mounted) return;
          setLocalTotalSeconds(s.totalSeconds || 0);
          setLocalStreak(s.streak || 0);
          setLocalFlowers(Array.isArray(s.flowers) ? s.flowers : []);
        } catch {
          // ignore
        }
      })();
      return () => {
        mounted = false;
      };
    }, [])
  );

  useEffect(() => {
    setRemainingSec(selectedMinutes * 60);
  }, [selectedMinutes]);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemainingSec((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          finishSession();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [running]);

  const formatMMSS = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const getStage = (progressPercent: number) => {
    if (progressPercent < 25) return "Tohum";
    if (progressPercent < 60) return "Filiz";
    if (progressPercent < 90) return "Tomurcuk";
    return "Çiçek";
  };

  const startSession = async () => {
    setRunning(true);
    const now = Date.now();
    const endsAt = now + selectedMinutes * 60 * 1000;
    const s: FocusSessionState = { isRunning: true, startedAt: now, endsAt, durationMinutes: selectedMinutes };
    await saveFocusSession(s);
  };

  const finishSession = async () => {
    setRunning(false);
    const addedSec = selectedMinutes * 60;
    const newTotal = (localTotalSeconds || 0) + addedSec;
    const newStreak = (localStreak || 0) + 1;
    const flowerId = pickRandomFlowerId();
    const newFlowers = [flowerId, ...localFlowers];

    setLocalTotalSeconds(newTotal);
    setLocalStreak(newStreak);
    setLocalFlowers(newFlowers);

    try {
      await saveFocusState({ totalSeconds: newTotal, streak: newStreak, flowers: newFlowers });
    } catch {
      // ignore
    }

    try {
      await addCompletedFocusSession(selectedMinutes);
      await addFlower({ type: "default", earnedAt: Date.now() });
    } catch {
      // ignore
    }

    Alert.alert("Tebrikler 🎉", "Oturumu tamamladın! Yeni bir çiçek kazandın.");
  };

  const debugFinish = () => {
    if (running) {
      setRemainingSec(0);
    } else {
      Alert.alert("Oturum çalışmıyor", "Önce oturumu başlatın.");
    }
  };

  const onSelectDuration = (m: number) => {
    if (running) return;
    setSelectedMinutes(m);
    setRemainingSec(m * 60);
  };

  const totalHoursText = () => {
    const totalSec = localTotalSeconds ?? 0;
    const hours = totalSec / 3600;
    return `${hours.toFixed(1)} saat`;
  };

  const progressPercent = ((selectedMinutes * 60 - remainingSec) / (selectedMinutes * 60)) * 100;
  const stage = getStage(Math.max(0, Math.min(100, progressPercent)));

  const emojiForId = (id: string) => {
    switch (id) {
      case "lotus": return "🪷";
      case "aycicegi": return "🌻";
      case "orkide": return "🌸";
      case "lale": return "🌷";
      case "papatya": return "🌼";
      case "gul": return "🌹";
      default: return "🌸";
    }
  };

  const collectionSlots = Array.from({ length: 10 }).map((_, i) => localFlowers[i]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <SafeAreaView style={[styles.safe, { backgroundColor: "#F6F7FB" }]}>
        <Screen>
          <View style={styles.headerRow}>
            <Text variant="h2">Odak</Text>
            <Pressable onPress={() => navigation.navigate(Routes.Garden as any)} style={{ paddingRight: 8 }}>
              <Text>🌿 Bahçem</Text>
            </Pressable>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text variant="muted">Toplam</Text>
              <Text style={{ fontWeight: "700" }}>{totalHoursText()}</Text>
            </View>
            <View style={styles.statCard}>
              <Text variant="muted">Seri</Text>
              <Text style={{ fontWeight: "700" }}>{localStreak}</Text>
            </View>
            <View style={styles.statCard}>
              <Text variant="muted">Çiçek</Text>
              <Text style={{ fontWeight: "700" }}>{localFlowers.length}</Text>
            </View>
          </View>

          <View style={[styles.card, { marginHorizontal: 16 }]}>
            <Text style={{ fontWeight: "700" }}>Bahçem</Text>
            <Text variant="muted" style={{ marginTop: 6 }}>
              Bahçeni ziyaret et ve ödüllerini gör.
            </Text>
            <Pressable
              style={[styles.mainButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate(Routes.Garden as any)}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Bahçeye Git</Text>
            </Pressable>
          </View>

          <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
            <Text style={{ fontWeight: "700", marginBottom: 8 }}>Premium Çiçekler</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
              {[
                { id: "p1", icon: "🪷", label: "Lotus" },
                { id: "p2", icon: "🌻", label: "Ayçiçeği" },
                { id: "p3", icon: "🪻", label: "Orkide" },
              ].map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => Alert.alert("Premium yakında", "Bu özellik yakında sunulacak.")}
                  style={{
                    flex: 1,
                    marginHorizontal: 6,
                    borderRadius: 12,
                    padding: 12,
                    alignItems: "center",
                    backgroundColor: "#fff",
                    opacity: 0.6,
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{p.icon}</Text>
                  <Text variant="muted" style={{ marginTop: 8 }}>
                    {p.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.seedArea}>
            <Text style={{ fontSize: 18, fontWeight: "800" }}>{stage}</Text>
            <Text variant="muted" style={{ marginTop: 8 }}>
              {running ? `Kalan: ${formatMMSS(remainingSec)}` : `Hedef: ${selectedMinutes} dk`}
            </Text>
            <View style={{ marginTop: 12 }}>
              <Pressable
                style={[styles.primaryButton, { backgroundColor: "#FF8A3D" }]}
                onPress={() => (running ? setRunning(false) : startSession())}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>{running ? "Durdur" : "Çiçeği Büyütmeye Başla"}</Text>
              </Pressable>
              <View style={{ height: 8 }} />
              <Pressable onPress={debugFinish} style={{ alignItems: "center" }}>
                <Text variant="muted">Bitir (Test)</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.durationRow}>
            {DURATIONS.map((d) => (
              <Pressable
                key={d}
                onPress={() => onSelectDuration(d)}
                style={[
                  styles.durationPill,
                  selectedMinutes === d ? { backgroundColor: colors.primary } : { backgroundColor: "#fff", borderWidth: 1, borderColor: "#EEE" },
                ]}
              >
                <Text style={selectedMinutes === d ? { color: "#fff", fontWeight: "700" } : { fontWeight: "600" }}>{d} dk</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={{ fontWeight: "700", marginBottom: 8 }}>Çiçek Koleksiyonum</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {collectionSlots.map((id, idx) => (
                <View
                  key={`${id ?? "empty"}-${idx}`}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 20,
                    backgroundColor: "#fff",
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontWeight: "700" }}>{id ? emojiForId(id) : "—"}</Text>
                </View>
              ))}
            </View>
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
