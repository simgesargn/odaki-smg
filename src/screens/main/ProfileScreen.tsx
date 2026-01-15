import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { theme } from "../../ui/theme";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";
import { auth } from "../../firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export const ProfileScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const navigation = nav;

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
      // kesin yönlendirme: Welcome ekranına reset
      navigation.reset({ index: 0, routes: [{ name: Routes.Welcome as any }] });
    } catch (e: any) {
      Alert.alert("Hata", "Çıkış yapılamadı");
    }
  };

  return (
    <Screen>
      <View style={styles.container}>
        {/* Üst kart: isim ve e‑posta */}
        <View style={styles.topCard}>
          <Text variant="h2">{user?.displayName || "Misafir"}</Text>
          <Text variant="muted" style={styles.emailText}>{user?.email || "-"}</Text>
        </View>

        {/* Menü kartı */}
        <View style={styles.menuCard}>
          <Pressable style={styles.menuRow} onPress={() => navigation.navigate(Routes.Settings as any)}>
            <Text style={styles.menuLabel}>Ayarlar</Text>
            <Text style={styles.chev}>›</Text>
          </Pressable>

          <Pressable style={styles.menuRow} onPress={() => navigation.navigate(Routes.Privacy as any)}>
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
            <Text style={[styles.menuLabel, { color: "#ef4444" }]}>Çıkış yap</Text>
            <Text style={[styles.chev, { color: "#ef4444" }]}>›</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  topCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  emailText: { marginTop: 8, color: theme.colors.muted },

  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
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
  menuLabel: { fontSize: 16, color: theme.colors.text },
  chev: { color: theme.colors.muted, fontSize: 20 },
});
