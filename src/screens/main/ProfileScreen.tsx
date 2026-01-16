import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Pressable, Alert, ScrollView } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { auth } from "../../firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";
import { colors } from "../../ui/design";
import { loadFocusStats } from "../../features/focus/focusStore";

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [user, setUser] = useState<{ displayName?: string | null; email?: string | null } | null>(null);
  const [focusStats, setFocusStats] = useState<{ totalSeconds?: number; streakDays?: number; flowersEarned?: number }>({});

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ? { displayName: u.displayName, email: u.email } : null);
    });
    (async () => {
      try {
        const s = await loadFocusStats();
        setFocusStats(s);
      } catch {
        // ignore
      }
    })();
    return () => unsub();
  }, []);

  const initials = useMemo(() => {
    const name = user?.displayName || user?.email || "Misafir";
    const parts = String(name).split(" ").filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return String(name).slice(0, 2).toUpperCase();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.reset({ index: 0, routes: [{ name: Routes.Welcome as any }] });
    } catch {
      Alert.alert("Hata", "Çıkış yapılamadı");
    }
  };

  const hoursFocused = Math.round((focusStats.totalSeconds ?? 0) / 3600 * 10) / 10;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header band */}
        <View style={[styles.headerBand, { backgroundColor: colors.primarySoft }]}>
          <View style={styles.headerInner}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>

            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.nameText}>{user?.displayName || "Misafir"}</Text>
              <Text style={styles.usernameText}>{user?.email ?? "-"}</Text>
            </View>

            <Pressable style={styles.iconBtn} onPress={() => navigation.navigate(Routes.Notifications as any)}>
              <Text style={{ fontSize: 18 }}>🔔</Text>
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={() => navigation.dispatch((navigation as any).getParent ? (navigation as any).getParent().dispatch(DrawerActions?.openDrawer?.() ?? {}) : null)}>
              <Text style={{ fontSize: 18 }}>☰</Text>
            </Pressable>
          </View>
        </View>

        {/* Metrics */}
        <View style={{ height: 12 }} />
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
            <Text style={styles.metricLabel}>Görevler</Text>
            <Text style={styles.metricValue}>—</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
            <Text style={styles.metricLabel}>Odak (sa)</Text>
            <Text style={styles.metricValue}>{hoursFocused}</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
            <Text style={styles.metricLabel}>Seri</Text>
            <Text style={styles.metricValue}>{focusStats.streakDays ?? 0}</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
            <Text style={styles.metricLabel}>Arkadaş</Text>
            <Text style={styles.metricValue}>—</Text>
          </View>
        </View>

        {/* Quick actions */}
        <View style={{ height: 14 }} />
        <View style={[styles.card, { padding: 12 }]}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>Hızlı işlemler</Text>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable style={styles.quickBtn} onPress={() => navigation.navigate(Routes.Settings as any)}>
              <Text style={{ fontWeight: "700" }}>Ayarlar</Text>
            </Pressable>

            <Pressable style={styles.quickBtn} onPress={() => navigation.navigate(Routes.NotificationSettings as any)}>
              <Text style={{ fontWeight: "700" }}>Bildirim Ayarları</Text>
            </Pressable>

            <Pressable style={styles.quickBtn} onPress={() => navigation.navigate(Routes.Privacy as any)}>
              <Text style={{ fontWeight: "700" }}>Gizlilik</Text>
            </Pressable>
          </View>
        </View>

        {/* Premium CTA */}
        <View style={{ height: 14 }} />
        <Pressable style={[styles.premiumCard, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate(Routes.Premium as any)}>
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>Premium'a Geç</Text>
          <Text style={{ color: "#fff", marginTop: 6 }}>Özel çiçekler ve gelişmiş özellikler</Text>
        </Pressable>

        {/* Sign out */}
        <View style={{ height: 18 }} />
        <Pressable
          style={[styles.card, { paddingVertical: 14 }]}
          onPress={() =>
            Alert.alert("Çıkış", "Hesabınızdan çıkmak istediğinize emin misiniz?", [
              { text: "İptal", style: "cancel" },
              { text: "Çıkış yap", style: "destructive", onPress: handleSignOut },
            ])
          }
        >
          <Text style={{ textAlign: "center", color: colors.danger, fontWeight: "700" }}>Çıkış yap</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  headerBand: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  headerInner: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "800", fontSize: 20 },
  nameText: { fontSize: 18, fontWeight: "800", color: colors.text },
  usernameText: { marginTop: 4, color: colors.muted },

  iconBtn: { padding: 8, marginLeft: 8 },

  metricCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    // subtle shadow
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  metricLabel: { fontSize: 12, color: colors.muted },
  metricValue: { fontSize: 18, fontWeight: "800", marginTop: 6, color: colors.text },

  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
  },

  quickBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    alignItems: "center",
  },

  premiumCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
