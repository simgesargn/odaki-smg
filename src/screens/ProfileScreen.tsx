import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { Screen } from "../ui/Screen";
import { Text } from "../ui/Text";
import { theme } from "../ui/theme";
import { Routes } from "../navigation/routes";
import { auth } from "../firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const colors = theme.colors;
const radii = theme.radius ?? theme.radii;
const spacing = theme.spacing;

export const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<{ displayName?: string | null; email?: string | null } | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ? { displayName: u.displayName, email: u.email } : null);
    });
    return () => unsub();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch {
      // hata yutuluyor; yönlendirme veya alert yapılmaz
    }
  };

  return (
    <Screen>
      <View style={styles.container}>
        {!user ? (
          <View style={styles.placeholderWrap}>
            <Text style={styles.placeholderTitle}>Hoş geldin!</Text>
            <Text variant="muted" style={{ textAlign: "center", marginTop: 8 }}>
              Hesabınızla giriş yapmadınız. Uygulamayı tanımak için onboarding'i inceleyin veya giriş yapın.
            </Text>

            <View style={styles.placeholderActions}>
              <Pressable style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => { /* no-op: navigation handled by RootNavigator */ }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Başla</Text>
              </Pressable>

              <Pressable style={[styles.actionBtn, { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }]} onPress={() => { /* no-op: navigation handled by RootNavigator */ }}>
                <Text style={{ color: colors.text, fontWeight: "700" }}>Giriş Yap</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.topCard}>
              <Text variant="h2">{user?.displayName || "Misafir"}</Text>
              <Text variant="muted" style={styles.emailText}>
                {user?.email || "-"}
              </Text>
            </View>

            <View style={styles.menuCard}>
              <Pressable style={styles.menuRow} onPress={() => { /* no-op: navigation handled by RootNavigator */ }}>
                <Text style={styles.menuLabel}>Ayarlar</Text>
                <Text style={styles.chev}>›</Text>
              </Pressable>

              <Pressable style={styles.menuRow} onPress={() => { /* no-op: navigation handled by RootNavigator */ }}>
                <Text style={styles.menuLabel}>Bildirimler</Text>
                <Text style={styles.chev}>›</Text>
              </Pressable>

              <Pressable style={styles.menuRow} onPress={() => { /* no-op: navigation handled by RootNavigator */ }}>
                <Text style={styles.menuLabel}>Gizlilik</Text>
                <Text style={styles.chev}>›</Text>
              </Pressable>

              <Pressable
                style={styles.menuRow}
                onPress={() =>
                  Alert.alert("Çıkış", "Hesabınızdan çıkmak istediğinize emin misiniz?", [
                    { text: "İptal", style: "cancel" },
                    { text: "Çıkış yap", style: "destructive", onPress: handleSignOut },
                  ])
                }
              >
                <Text style={[styles.menuLabel, { color: colors.danger }]}>Çıkış yap</Text>
                <Text style={[styles.chev, { color: colors.danger }]}>›</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  placeholderWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  placeholderTitle: { fontSize: 22, fontWeight: "800", color: colors.text },
  placeholderActions: { marginTop: 20, width: "100%", gap: 12 },
  actionBtn: {
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  topCard: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "flex-start",
    ...theme.shadow.card,
    marginBottom: spacing.lg,
  },
  emailText: { marginTop: 8, color: colors.muted },
  menuCard: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    paddingVertical: 8,
    overflow: "hidden",
    ...theme.shadow.card,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f3f4f6",
  },
  menuLabel: { fontSize: 16, color: colors.text },
  chev: { color: colors.muted, fontSize: 20 },
});
