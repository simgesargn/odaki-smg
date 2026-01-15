import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
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
      await addDoc(collection(db, "focusSessions"), {
        userId: uid,
        startedAt: serverTimestamp(),
        endedAt: serverTimestamp(),
        durationSec: totalSec,
        targetSec: totalSec,
        createdAt: serverTimestamp(),
        status: "completed",
      });
      Alert.alert("Odak tamamlandı");
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
        <Text variant="h1">Odak</Text>
        <Text variant="muted" style={{ marginTop: 12 }}>
          Giriş gerekli.
        </Text>
      </Screen>
    );
  }

  const remaining = getRemainingSec();
  const display = formatMMSS(remaining);

  return (
    <Screen style={styles.container}>
      {error ? (
        <View style={styles.error}>
          <Text variant="muted" style={{ color: theme.colors.danger }}>
            {error}
          </Text>
        </View>
      ) : null}

      <View style={styles.topCard}>
        <Text variant="h2">Bugün odak (dk)</Text>
        <Text variant="h1" style={{ marginTop: 8 }}>{todayMinutes}</Text>
      </View>

      <View style={styles.presetRow}>
        {PRESETS.map((m) => (
          <Pressable
            key={m}
            onPress={() => {
              const wasRunning = running;
              if (wasRunning) {
                // değiştirme durumunda mevcut aralığı duraklatmadan sıfırlıyoruz
                setRunning(false);
                startRef.current = null;
                setElapsedBefore(0);
              }
              setTargetMin(m);
            }}
            style={[
              styles.presetButton,
              targetMin === m ? styles.presetActive : styles.presetIdle,
            ]}
          >
            <Text style={targetMin === m ? { color: theme.colors.primary } : { color: theme.colors.text }}>{m} dk</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.timerWrap}>
        <Text variant="h1">{display}</Text>
      </View>

      <View style={styles.controlsRow}>
        {!running ? (
          <Pressable onPress={start} style={[styles.controlBtn, { backgroundColor: theme.colors.primary }]} disabled={saving}>
            <Text style={{ color: "#fff" }}>Başlat</Text>
          </Pressable>
        ) : (
          <Pressable onPress={pauseAndRecord} style={[styles.controlBtn, { backgroundColor: "#333" }]} disabled={saving}>
            <Text style={{ color: "#fff" }}>Duraklat</Text>
          </Pressable>
        )}
        <Pressable onPress={reset} style={[styles.controlBtn, { backgroundColor: "#666" }]} disabled={saving}>
          <Text style={{ color: "#fff" }}>Sıfırla</Text>
        </Pressable>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  error: { paddingVertical: 8 },
  topCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.r16,
    padding: theme.spacing.s16,
    alignItems: "center",
    ...theme.shadow.cardShadow,
  },
  presetRow: { flexDirection: "row", justifyContent: "center", gap: 12, marginTop: 16 },
  presetButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: theme.radius.r12,
    minWidth: 72,
    alignItems: "center",
  },
  presetActive: { backgroundColor: theme.colors.primarySoft },
  presetIdle: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  timerWrap: { alignItems: "center", marginTop: 24, marginBottom: 8 },
  controlsRow: { flexDirection: "row", justifyContent: "center", gap: 12, marginTop: 12 },
  controlBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: theme.radius.r12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 110,
  },
});
