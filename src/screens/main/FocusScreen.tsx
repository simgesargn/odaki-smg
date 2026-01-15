import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Pressable, Alert, KeyboardAvoidingView, Platform, SafeAreaView, Text as RNText } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { auth, db } from "../../firebase/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { theme } from "../../ui/theme";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";
import { addCompletedFocusSession } from "../../services/focusSessionStore";
import { addGardenReward } from "../../services/gardenStore";

const PRESETS = [15, 25, 50]; // dakikalar

export const FocusScreen: React.FC = () => {
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid || null);
  const [targetMin, setTargetMin] = useState<number>(25);
  const [running, setRunning] = useState(false);
  const [elapsedBefore, setElapsedBefore] = useState<number>(0); // saniye, önceki aralıklarda birikmiyor (her aralık ayrı kaydediliyor)
  const startRef = useRef<number | null>(null); // ms cinsinden epoch
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [tick, setTick] = useState(0); // UI refresh tetikleyici
  const [todayMinutes, setTodayMinutes] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => setUid(u?.uid || null));
    return () => unsubAuth();
  }, []);

  // Bugünün odak toplamı (dakika)
  useEffect(() => {
    if (!uid) {
      setTodayMinutes(0);
      return;
    }
    setError(null);
    const q = query(collection(db, "focusSessions"), where("userId", "==", uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        try {
          const now = new Date();
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          let totalSec = 0;
          snap.forEach((d) => {
            const data: any = d.data();
            const ended =
              data?.endedAt && typeof data.endedAt.toDate === "function"
                ? data.endedAt.toDate()
                : data?.endedAt
                ? new Date(data.endedAt)
                : null;
            const created =
              data?.createdAt && typeof data.createdAt.toDate === "function"
                ? data.createdAt.toDate()
                : data?.startedAt && typeof data.startedAt.toDate === "function"
                ? data.startedAt.toDate()
                : null;
            // tercih: ended zamanı veya created/started zamanı ile filtreleme
            const refTime = ended || created;
            if (!refTime) return;
            if (refTime >= startOfToday) {
              totalSec += Number(data.durationSec || 0);
            }
          });
          setTodayMinutes(Math.floor(totalSec / 60));
        } catch (e: any) {
          setError("Firestore işleme hatası: " + (e?.message || e?.code || "bilinmeyen"));
          setTodayMinutes(0);
        }
      },
      (e: any) => {
        setError("Firestore okuma hatası: " + (e?.message || e?.code || "bilinmeyen"));
        setTodayMinutes(0);
      }
    );
    return () => unsub();
  }, [uid]);

  // helper: geçen süre (saniye)
  const getElapsedSec = () => {
    const now = Date.now();
    const runningElapsed = startRef.current ? Math.floor((now - startRef.current) / 1000) : 0;
    return elapsedBefore + runningElapsed;
  };
  const getRemainingSec = () => {
    const targetSec = targetMin * 60;
    const rem = targetSec - getElapsedSec();
    return rem > 0 ? rem : 0;
  };

  // UI interval: sadece görüntü güncelleme
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setTick((t) => t + 1), 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running]);

  // otomatik tamamlanma kontrolü
  useEffect(() => {
    if (!running) return;
    const rem = getRemainingSec();
    if (rem <= 0) {
      handleComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const formatMMSS = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  const start = () => {
    if (!uid) {
      setError("Giriş gerekli.");
      return;
    }
    setError(null);
    if (!running) {
      startRef.current = Date.now();
      setRunning(true);
    }
  };

  const pauseAndRecord = async () => {
    if (!uid) {
      setError("Giriş gerekli.");
      return;
    }
    if (!running && getElapsedSec() <= 0) return; // kayıt yok
    setSaving(true);
    try {
      // bu aralığın geçen süresi
      const elapsed = getElapsedSec();
      if (elapsed <= 0) {
        setSaving(false);
        setRunning(false);
        startRef.current = null;
        return;
      }
      // Firestore dokümanı: startedAt/endedAt serverTimestamp, durationSec gerçek geçen süre, targetSec hedef
      await addDoc(collection(db, "focusSessions"), {
        userId: uid,
        startedAt: serverTimestamp(),
        endedAt: serverTimestamp(),
        durationSec: Math.round(Math.max(0, elapsed)),
        targetSec: targetMin * 60,
        createdAt: serverTimestamp(),
        status: "stopped",
      });
      // reset sadece bu aralık için
      setElapsedBefore(0);
      startRef.current = null;
      setRunning(false);
      setError(null);
    } catch (e: any) {
      setError("Firestore yazma hatası: " + (e?.message || e?.code || "bilinmeyen"));
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setRunning(false);
    setElapsedBefore(0);
    startRef.current = null;
    setError(null);
  };

  const handleComplete = async () => {
    // tamamlanma: hedef süresince tamamlandı
    setRunning(false);
    const totalSec = targetMin * 60;
    setSaving(true);
    try {
      if (!uid) {
        setError("Giriş gerekli.");
        setSaving(false);
        return;
      }
      // Firestore kaydı
      await addDoc(collection(db, "focusSessions"), {
        userId: uid,
        startedAt: serverTimestamp(),
        endedAt: serverTimestamp(),
        durationSec: totalSec,
        targetSec: totalSec,
        createdAt: serverTimestamp(),
        status: "completed",
      });

      // Local storage: tamamlanan oturum ve bahçe ödülü (hata yutulur)
      try {
        await addCompletedFocusSession(targetMin);
        await addGardenReward({ earnedMinutes: targetMin, type: "flower" });
      } catch {
        // ignore local store errors
      }

      // Kullanıcıya tebrik bildirimi; Bahçeyi Gör seçilirse Garden ekranına git
      Alert.alert("Harika!", "Tebrikler! +1 Çiçek 🌸", [
        { text: "Bahçeyi Gör", onPress: () => navigation.navigate(Routes.Garden as any) },
        { text: "Tamam", style: "default" },
      ]);

      reset();
    } catch (e: any) {
      setError("Firestore yazma hatası: " + (e?.message || e?.code || "bilinmeyen"));
    } finally {
      setSaving(false);
    }
  };

  if (!uid) {
    return (
      <Screen style={styles.container}>
        <Text variant="h1" style={{ paddingTop: 6, lineHeight: 58 }}>Odak</Text>
        <Text variant="muted" style={{ marginTop: 12 }}>
          Giriş gerekli.
        </Text>
      </Screen>
    );
  }

  const remaining = getRemainingSec();
  const display = formatMMSS(remaining);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Odak</Text>
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.topCard}>
          <Text variant="h2">Bugün odak (dk)</Text>
          <View style={{ marginTop: 8, alignItems: "center", justifyContent: "center" }}>
            <RNText
              style={{
                fontSize: 28,
                fontWeight: "800",
                lineHeight: 34,
                paddingTop: 2,
                textAlign: "center",
                color: theme.colors.text,
              }}
            >
              {String(todayMinutes)}
            </RNText>
          </View>
        </View>

        <View style={styles.presetRow}>
          {PRESETS.map((m) => (
            <Pressable
              key={m}
              onPress={() => {
                const wasRunning = running;
                if (wasRunning) {
                  setRunning(false);
                  startRef.current = null;
                  setElapsedBefore(0);
                }
                setTargetMin(m);
              }}
              style={[
                styles.presetPill,
                targetMin === m ? styles.presetPillActive : null,
              ]}
            >
              <Text
                includeFontPadding={false}
                style={[
                  styles.presetText, // base style
                  targetMin === m ? styles.presetTextActive : null, // color/style when active
                  { textAlign: "center", fontWeight: "600", letterSpacing: 0.2, fontSize: 16 }, // typographic tweaks
                ]}
              >
                {m} dk
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.timerWrap}>
          <View style={styles.timerCard}>
            <Text style={styles.timerText}>{display}</Text>
            <Text style={styles.timerSubtitle}>{running ? "Odaklanıyorsun..." : "Hazır olduğunda başlat"}</Text>
          </View>

          <View style={styles.actionRow}>
            <Pressable
              style={styles.primaryButton}
              onPress={start}
            >
              <Text style={styles.primaryButtonText}>{running ? "Duraklat" : "Başlat"}</Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={reset}
            >
              <Text style={styles.secondaryButtonText}>Sıfırla</Text>
            </Pressable>
          </View>
        </View>

        {/* Bahçem kartı */}
        <Pressable style={[styles.gardenCard, { backgroundColor: "#fff" }]} onPress={() => navigation.navigate(Routes.Garden as any)}>
          <Text style={styles.gardenTitle}>Bahçem</Text>
          <Text variant="muted" style={{ marginTop: 6 }}>Bahçeni ziyaret et ve ödüller kazan.</Text>
        </Pressable>
        <View style={{ height: 12 }} />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7FB" },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111" },

  errorBanner: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#fff1f0",
  },
  errorText: { color: "#b91c1c", fontSize: 13 },

  topCard: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: { fontSize: 14, color: "#6b7280" },
  statValue: { fontSize: 32, fontWeight: "700", color: "#111" },

  presetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 12,
  },
  presetPill: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    backgroundColor: "#fff",
    alignItems: "center",
    overflow: "hidden", // eklendi: seçili pill üstündeki halo/taşmayı engeller
  },
  presetPillActive: {
    backgroundColor: "#F0E9FF",
    borderColor: "#6C5CE7",
    borderWidth: 0, // eklendi: çift border çakışmasını kaldır
  },
  presetText: { fontSize: 14, color: "#111" },
  timerWrap: { marginTop: 20, alignItems: "center", paddingHorizontal: 16, paddingVertical: 8 },
  timerCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  timerText: {
    fontSize: 56,
    fontWeight: "800",
    lineHeight: 64,
    letterSpacing: 0.5,
    includeFontPadding: false,
    textAlign: "center",
    color: "#111",
  },
  timerSubtitle: { marginTop: 8, fontSize: 13, color: "#6b7280" },

  actionRow: {
    flexDirection: "row",
    marginTop: 18,
    width: "100%",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#6C5CE7",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e6e6e6",
    marginLeft: 8,
  },
  secondaryButtonText: { color: "#4B5563", fontSize: 16, fontWeight: "600" },
  gardenCard: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  gardenTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
});
