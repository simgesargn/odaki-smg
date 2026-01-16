import React, { useEffect, useState } from "react";
import { View, Image, Pressable, StyleSheet } from "react-native";
import { Text } from "../../ui/Text";
import { useUser } from "../../context/UserContext";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";
import { theme } from "../../ui/theme";

export const ProfileScreen: React.FC = () => {
  const { user } = useUser();
  const uid = user?.uid ?? null;
  const [avatarEmoji, setAvatarEmoji] = useState<string>("🙂");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [usernameField, setUsernameField] = useState<string | null>(null);
  const nav = useNavigation<any>();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!uid) return;
      try {
        const ref = doc(db, "users", uid);
        const snap = await getDoc(ref);
        if (!mounted) return;
        const data: any = snap.exists() ? snap.data() : {};
        setAvatarEmoji(data?.avatarEmoji ?? "🙂");
        setAvatarUrl(data?.avatarUrl ?? null);
        setUsernameField(data?.username ?? user?.displayName ?? user?.email?.split?.("@")?.[0] ?? null);
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [uid, user]);

  return (
    <View style={styles.headerCard}>
      <Pressable onPress={() => { /* optional: change avatar */ }} style={{ marginRight: 14 }}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarEmoji}>{avatarEmoji}</Text>
        )}
      </Pressable>

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{usernameField ?? user?.displayName ?? "Kullanıcı"}</Text>
        {user?.email ? <Text variant="muted">{user.email}</Text> : null}

        {/* menu rows (clickable) */}
        <Pressable onPress={() => nav.navigate(Routes.Settings as any)} style={styles.menuRow}>
          <Text>Ayarlar</Text>
        </Pressable>
        <Pressable onPress={() => nav.navigate(Routes.Notifications as any)} style={styles.menuRow}>
          <Text>Bildirimler</Text>
        </Pressable>
        <Pressable onPress={() => nav.navigate(Routes.Privacy as any)} style={styles.menuRow}>
          <Text>Gizlilik</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerCard: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: theme.colors.card, borderRadius: 12, margin: 16 },
  avatarEmoji: { fontSize: 48 },
  avatarImage: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#eee" },
  name: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  menuRow: { paddingVertical: 10 },
});
