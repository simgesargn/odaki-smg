import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Modal, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../ui/Text";
import { useUser } from "../../context/UserContext";
import { db, auth } from "../../firebase/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";
import { loadFocusStats } from "../../features/focus/focusStore";

const EMOJIS = ["🙂", "😄", "😎", "🔥", "🌱", "🪷", "🌻", "🌸", "💪", "✨", "🧠", "📚", "🎯", "🏆"];

export const ProfileScreen: React.FC = () => {
  const { user } = useUser();
  const uid = user?.uid ?? null;
  const nav = useNavigation<any>();

  const [profileEmoji, setProfileEmoji] = useState<string>("🙂");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [usernameField, setUsernameField] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pickerVisible, setPickerVisible] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [focusStats, setFocusStats] = useState<{ totalMinutes: number; streakDays: number; flowersEarned: number }>({
    totalMinutes: 0,
    streakDays: 0,
    flowersEarned: 0,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!uid) {
        setLoading(false);
        return;
      }
      try {
        const uref = doc(db, "users", uid);
        const snap = await getDoc(uref);
        if (!mounted) return;
        const data: any = snap.exists() ? snap.data() : {};
        setAvatarUrl(data?.avatarUrl ?? null);
        setProfileEmoji((data?.profileEmoji as string) ?? (data?.avatarEmoji as string) ?? "🙂");
        setUsernameField(data?.username ?? user?.displayName ?? user?.email?.split?.("@")?.[0] ?? null);
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    (async () => {
      try {
        const s = await loadFocusStats();
        if (!mounted) return;
        setFocusStats({ totalMinutes: Math.round((s.totalSeconds ?? 0) / 60), streakDays: s.streakDays ?? 0, flowersEarned: s.flowersEarned ?? 0 });
      } catch {
        // ignore
      }
    })();

    return () => {
      mounted = false;
    };
  }, [uid, user]);

  const saveEmoji = async (emoji: string) => {
    if (!uid) {
      Alert.alert("Hata", "Kullanıcı bulunamadı.");
      return;
    }
    setSaving(true);
    try {
      const ref = doc(db, "users", uid);
      await setDoc(
        ref,
        {
          profileEmoji: emoji,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setProfileEmoji(emoji);
      setPickerVisible(false);
    } catch (e: any) {
      Alert.alert("Hata", "Emoji kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  const onSignOut = async () => {
    try {
      await auth.signOut();
      nav.reset({ index: 0, routes: [{ name: Routes.Login as any }] });
    } catch (e: any) {
      Alert.alert("Hata", "Çıkış yapılamadı.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        <View />
        <Pressable onPress={() => nav.navigate(Routes.Settings as any)} style={styles.settingsBtn}>
          <Text style={{ fontSize: 18 }}>⚙️</Text>
        </Pressable>
      </View>

      <View style={styles.headerCard}>
        <View style={styles.avatarWrap}>
          <Pressable onPress={() => setPickerVisible(true)} style={styles.avatarTouchable}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarEmoji}>{profileEmoji}</Text>
            )}
          </Pressable>

          <View style={styles.avatarOverlays}>
            <Pressable onPress={() => setPickerVisible(true)} style={styles.iconBtn}>
              <Text>😊</Text>
            </Pressable>
            <Pressable onPress={() => nav.navigate(Routes.Premium as any)} style={[styles.iconBtn, { marginLeft: 8 }]}>
              <Text style={{ fontSize: 12 }}>📷</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{usernameField ?? user?.displayName ?? "Kullanıcı"}</Text>
          {user?.email ? <Text variant="muted">{user.email}</Text> : null}
          <Pressable onPress={() => nav.navigate(Routes.Premium as any)} style={styles.premiumCta}>
            <Text variant="muted">Gerçek fotoğraf Premium’da</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCardSmall}>
          <Text style={{ fontSize: 18 }}>🗂️</Text>
          <Text style={styles.statValue}>--</Text>
          <Text variant="muted" style={styles.statLabel}>Görev</Text>
        </View>
        <View style={styles.statCardSmall}>
          <Text style={{ fontSize: 18 }}>⏱️</Text>
          <Text style={styles.statValue}>{focusStats.totalMinutes}</Text>
          <Text variant="muted" style={styles.statLabel}>Odak (dk)</Text>
        </View>
        <View style={styles.statCardSmall}>
          <Text style={{ fontSize: 18 }}>🔥</Text>
          <Text style={styles.statValue}>{focusStats.streakDays}</Text>
          <Text variant="muted" style={styles.statLabel}>Seri</Text>
        </View>
        <View style={styles.statCardSmall}>
          <Text style={{ fontSize: 18 }}>👥</Text>
          <Text style={styles.statValue}>--</Text>
          <Text variant="muted" style={styles.statLabel}>Arkadaş</Text>
        </View>
      </View>

      <View style={styles.menu}>
        <Pressable style={styles.menuRow} onPress={() => nav.navigate(Routes.Settings as any)}>
          <Text>Ayarlar</Text>
        </Pressable>
        <Pressable style={styles.menuRow} onPress={() => nav.navigate(Routes.Notifications as any)}>
          <Text>Bildirimler</Text>
        </Pressable>
        <Pressable style={styles.menuRow} onPress={() => nav.navigate(Routes.Privacy as any)}>
          <Text>Gizlilik</Text>
        </Pressable>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.signOutBtn} onPress={onSignOut}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Çıkış Yap</Text>
        </Pressable>
      </View>

      <Modal visible={pickerVisible} animationType="slide" transparent onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.pickerCard}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontWeight: "700", fontSize: 16 }}>Avatar Emoji Seç</Text>
              <Pressable onPress={() => setPickerVisible(false)}>
                <Text variant="muted">Kapat</Text>
              </Pressable>
            </View>
            <FlatList
              data={EMOJIS}
              keyExtractor={(e) => e}
              numColumns={6}
              contentContainerStyle={{ marginTop: 12 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.emojiBtn}
                  onPress={() => saveEmoji(item)}
                  disabled={saving}
                >
                  <Text style={{ fontSize: 28 }}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            {saving ? (
              <View style={{ marginTop: 8, alignItems: "center" }}>
                <ActivityIndicator />
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  topRow: { flexDirection: "row", justifyContent: "space-between", padding: 12, alignItems: "center" },
  settingsBtn: { padding: 8 },
  headerCard: { flexDirection: "row", alignItems: "center", padding: 16, marginHorizontal: 16, backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#eee" },
  avatarWrap: { marginRight: 14, position: "relative" },
  avatarTouchable: { alignItems: "center", justifyContent: "center" },
  avatarEmoji: { fontSize: 72 },
  avatarImage: { width: 96, height: 96, borderRadius: 48, backgroundColor: "#eee" },
  avatarOverlays: { position: "absolute", right: -6, bottom: -6, flexDirection: "row" },
  iconBtn: { backgroundColor: "#fff", padding: 6, borderRadius: 999, borderWidth: 1, borderColor: "#eee", alignItems: "center", justifyContent: "center" },
  premiumCta: { marginTop: 8 },
  name: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, marginHorizontal: 16 },
  statCardSmall: { flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 12, alignItems: "center", marginHorizontal: 6, borderWidth: 1, borderColor: "#eee" },
  statValue: { fontSize: 16, fontWeight: "800", marginTop: 6 },
  statLabel: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  menu: { marginTop: 16, backgroundColor: "#fff", borderRadius: 12, padding: 12, marginHorizontal: 16, borderWidth: 1, borderColor: "#eee" },
  menuRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f3f3f3" },
  actions: { marginTop: 20, alignItems: "center" },
  signOutBtn: { backgroundColor: "#ef4444", paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" },
  pickerCard: { backgroundColor: "#fff", padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12, maxHeight: 360 },
  emojiBtn: { width: "16.66%", padding: 10, alignItems: "center", justifyContent: "center" },
});
