import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Alert, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../ui/Text";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../../firebase/firebase";
import { signOut, deleteUser, onAuthStateChanged } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";
import { collection, query, where, getDocs, writeBatch, deleteDoc, doc } from "firebase/firestore";

const KEY_THEME = "odaki_theme_dark_v1";
const KEY_LANG = "odaki_lang_v1";
const KEY_PUSH = "odaki_push_enabled_v1";

export function SettingsScreen() {
  const nav = useNavigation<any>();
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid || null);
  const [themeDark, setThemeDark] = useState(false);
  const [language, setLanguage] = useState<"tr" | "en">("tr");
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid || null));
    (async () => {
      try {
        const t = await AsyncStorage.getItem(KEY_THEME);
        if (t !== null) setThemeDark(t === "1");
        const l = await AsyncStorage.getItem(KEY_LANG);
        if (l === "en" || l === "tr") setLanguage(l);
        const p = await AsyncStorage.getItem(KEY_PUSH);
        setPushEnabled(p === null ? true : p === "1");
      } catch {
        /* ignore */
      }
    })();
    return () => unsub();
  }, []);

  const onSignOut = async () => {
    try {
      await signOut(auth);
      nav.reset({ index: 0, routes: [{ name: Routes.Login as any }] });
    } catch {
      Alert.alert("Hata", "Çıkış yapılamadı");
    }
  };

  const onDeleteAccount = async () => {
    if (!uid) return Alert.alert("Hata", "Kullanıcı bulunamadı.");
    Alert.alert("Onay", "Hesabı silmek istediğinizden emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            // delete related docs (best-effort)
            const batch = writeBatch(db);
            const collectionsToClear = ["tasks", "focusSessions", "notifications", "aiChats", "users"];
            for (const col of collectionsToClear) {
              const q = query(collection(db, col), where("userId", "==", uid));
              const snaps = await getDocs(q);
              snaps.forEach((d) => batch.delete(doc(db, col, d.id)));
            }
            await batch.commit();
            // try deleting auth user
            if (auth.currentUser) {
              try {
                await deleteUser(auth.currentUser);
              } catch (e: any) {
                Alert.alert("Hesap silme", "Hesap silinemedi. Yeniden kimlik doğrulama gerekebilir.");
                return;
              }
            }
            Alert.alert("Başarılı", "Hesabınız silindi.");
            nav.reset({ index: 0, routes: [{ name: Routes.Login as any }] });
          } catch (e: any) {
            Alert.alert("Hata", "Hesap silme işleminde hata: " + (e?.message || e?.code || "bilinmeyen"));
          }
        },
      },
    ]);
  };

  const toggleTheme = async (v: boolean) => {
    setThemeDark(v);
    try {
      await AsyncStorage.setItem(KEY_THEME, v ? "1" : "0");
    } catch {}
  };
  const togglePush = async (v: boolean) => {
    setPushEnabled(v);
    try {
      await AsyncStorage.setItem(KEY_PUSH, v ? "1" : "0");
    } catch {}
  };
  const setLang = async (l: "tr" | "en") => {
    setLanguage(l);
    try {
      await AsyncStorage.setItem(KEY_LANG, l);
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => nav.navigate(Routes.RootTabs as any)} style={styles.back}>
          <Text>Geri</Text>
        </Pressable>
        <Text variant="h2">Ayarlar</Text>
        <View style={{ width: 56 }} />
      </View>

      <View style={styles.container}>
        <View style={styles.row}>
          <Text>Tema (Koyu)</Text>
          <Switch value={themeDark} onValueChange={toggleTheme} />
        </View>

        <View style={styles.row}>
          <Text>Push Bildirimleri</Text>
          <Switch value={pushEnabled} onValueChange={togglePush} />
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={{ marginBottom: 8 }}>Dil</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable onPress={() => setLang("tr")} style={[styles.langBtn, language === "tr" && styles.langActive]}><Text>Türkçe</Text></Pressable>
            <Pressable onPress={() => setLang("en")} style={[styles.langBtn, language === "en" && styles.langActive]}><Text>English</Text></Pressable>
          </View>
        </View>

        <View style={{ height: 20 }} />

        <Pressable style={styles.primary} onPress={onSignOut}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Çıkış Yap</Text>
        </Pressable>

        <Pressable style={[styles.danger, { marginTop: 12 }]} onPress={onDeleteAccount}>
          <Text style={{ color: "#fff" }}>Hesabı Sil</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  back: { padding: 8 },
  container: { padding: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f3f3f3" },
  langBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: "#F3F4F6" },
  langActive: { backgroundColor: "#EDE9FE" },
  primary: { marginTop: 14, backgroundColor: "#6C5CE7", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  danger: { marginTop: 8, backgroundColor: "#ef4444", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
});
