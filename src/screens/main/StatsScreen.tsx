import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { Card } from "../../ui/Card";
import { auth, db } from "../../firebase/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export const StatsScreen: React.FC = () => {
  const [seg, setSeg] = useState<"gün" | "hafta" | "ay">("gün");
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid || null);
  const [focusSessions, setFocusSessions] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => setUid(u?.uid || null));
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!uid) {
      setFocusSessions([]);
      setTasks([]);
      return;
    }
    const qF = query(collection(db, "focusSessions"), where("userId", "==", uid));
    const unsubF = onSnapshot(
      qF,
      (snap) => {
        const arr: any[] = [];
        snap.forEach((d) => arr.push({ id: d.id, ...(d.data() as any) }));
        setFocusSessions(arr);
      },
      (e: any) => {
        setError("Firestore okuma hatası: " + (e?.message || e?.code || "bilinmeyen"));
        setFocusSessions([]);
      }
    );

    const qT = query(collection(db, "tasks"), where("userId", "==", uid));
    const unsubT = onSnapshot(
      qT,
      (snap) => {
        const arr: any[] = [];
        snap.forEach((d) => arr.push({ id: d.id, ...(d.data() as any) }));
        setTasks(arr);
      },
      (e: any) => {
        setError("Firestore okuma hatası: " + (e?.message || e?.code || "bilinmeyen"));
        setTasks([]);
      }
    );

    return () => {
      unsubF();
      unsubT();
    };
  }, [uid]);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const within = (d: any, start: Date) => {
    if (!d) return false;
    const date = d.toDate ? d.toDate() : d instanceof Date ? d : null;
    if (!date) return false;
    return date >= start;
  };

  const computeForRange = (start: Date) => {
    const sessions = focusSessions.filter((s) => s.status === "completed" && within(s.endedAt, start));
    const totalMinutes = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const completedSessions = sessions.length;
    const completedTasks = tasks.filter((t) => t.completed && within(t.createdAt || t.updatedAt || t.createdAt, start)).length;
    return { totalMinutes, completedSessions, completedTasks };
  };

  const rangeStart = seg === "gün" ? startOfToday : seg === "hafta" ? startOfWeek : startOfMonth;
  const { totalMinutes, completedSessions, completedTasks } = computeForRange(rangeStart);

  const empty = totalMinutes === 0 && completedSessions === 0 && completedTasks === 0;

  return (
    <Screen style={styles.container}>
      <Text variant="h1">İstatistikler</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 12 }}>
        <Text variant={seg === "gün" ? "h2" : "muted"} onPress={() => setSeg("gün")}>Bugün</Text>
        <Text variant={seg === "hafta" ? "h2" : "muted"} onPress={() => setSeg("hafta")}>Haftalık</Text>
        <Text variant={seg === "ay" ? "h2" : "muted"} onPress={() => setSeg("ay")}>Aylık</Text>
      </View>

      {error ? <Text variant="muted" style={{ color: "red", marginTop: 12 }}>{error}</Text> : null}

      <View style={{ marginTop: 20 }}>
        <Card>
          {empty ? (
            <Text variant="muted">Henüz veri yok</Text>
          ) : (
            <>
              <Text variant="h2">Toplam Odak (dk): {totalMinutes}</Text>
              <Text variant="muted" style={{ marginTop: 8 }}>Tamamlanan oturum: {completedSessions}</Text>
              <Text variant="muted" style={{ marginTop: 8 }}>Tamamlanan görev: {completedTasks}</Text>
            </>
          )}
        </Card>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({ container: { padding: 16 } });
