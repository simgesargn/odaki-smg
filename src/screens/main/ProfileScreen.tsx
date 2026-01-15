import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { Button } from "../../ui/Button";
import { auth, db } from "../../firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";

export const ProfileScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const [user, setUser] = useState<any>(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [totalTasks, setTotalTasks] = useState<number>(0);
  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState<number>(0);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      setTotalTasks(0);
      setCompletedTasks(0);
      setTotalFocusMinutes(0);
      return;
    }
    setLoading(true);
    setError(null);

    const qTasks = query(collection(db, "tasks"), where("userId", "==", user.uid));
    const unsubTasks = onSnapshot(
      qTasks,
      (snap) => {
        try {
          const items: any[] = [];
          snap.forEach((d) => items.push({ ...(d.data() as any), id: d.id }));
          setTotalTasks(items.length);
          setCompletedTasks(items.filter((t) => t.completed).length);
        } catch (e: any) {
          setError("Görev verisi işlenemedi: " + (e?.message || e?.code || "bilinmeyen"));
          setTotalTasks(0);
          setCompletedTasks(0);
        }
      },
      (e: any) => {
        setError("Görev verisi okunamadı: " + (e?.message || e?.code || "bilinmeyen"));
        setTotalTasks(0);
        setCompletedTasks(0);
      }
    );

    const qFocus = query(collection(db, "focusSessions"), where("userId", "==", user.uid));
    const unsubFocus = onSnapshot(
      qFocus,
      (snap) => {
        try {
          let totalSec = 0;
          snap.forEach((d) => {
            const data: any = d.data();
            totalSec += Number(data.durationSec || 0);
          });
          setTotalFocusMinutes(Math.floor(totalSec / 60));
        } catch (e: any) {
          setError("Odak verisi işlenemedi: " + (e?.message || e?.code || "bilinmeyen"));
          setTotalFocusMinutes(0);
        } finally {
          setLoading(false);
        }
      },
      (e: any) => {
        setError("Odak verisi okunamadı: " + (e?.message || e?.code || "bilinmeyen"));
        setTotalFocusMinutes(0);
        setLoading(false);
      }
    );

    return () => {
      unsubTasks();
      unsubFocus();
    };
  }, [user?.uid]);

  const onSignOut = async () => {
    try {
      await signOut(auth);
      // Clear errors then reset navigation to Auth stack root
      setError(null);
      nav.reset({ index: 0, routes: [{ name: Routes.AuthStack as any }] });
      return;
    } catch (e: any) {
      setError("Çıkış yapılamadı: " + (e?.message || e?.code || "bilinmeyen"));
    }
  };

  if (!user) {
    return (
      <Screen style={styles.container}>
        <View style={styles.center}>
          <Text variant="h2">Not logged in</Text>
        </View>
      </Screen>
    );
  }

  const displayName = user.displayName && String(user.displayName).trim().length > 0 ? user.displayName : String(user.email || "").split("@")[0];

  return (
    <Screen style={styles.container}>
      {error ? (
        <View style={{ marginBottom: 12 }}>
          <Text variant="muted" style={{ color: "red" }}>
            {error}
          </Text>
        </View>
      ) : null}

      <View style={styles.row}>
        <View>
          <Text variant="h2">{displayName}</Text>
          <Text variant="muted" style={{ marginTop: 6 }}>
            {user.email}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: 20 }}>
        {loading ? (
          <Text variant="muted">Loading...</Text>
        ) : (
          <>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text variant="h2">{totalTasks}</Text>
                <Text variant="muted">Toplam görev</Text>
              </View>
              <View style={styles.statCard}>
                <Text variant="h2">{completedTasks}</Text>
                <Text variant="muted">Tamamlanan</Text>
              </View>
              <View style={styles.statCard}>
                <Text variant="h2">{totalFocusMinutes}</Text>
                <Text variant="muted">Odak (dk)</Text>
              </View>
            </View>
          </>
        )}
      </View>

      <View style={{ marginTop: 24 }}>
        <Button title="Sign out" onPress={onSignOut} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  statCard: { flex: 1, alignItems: "center", padding: 12 },
});
