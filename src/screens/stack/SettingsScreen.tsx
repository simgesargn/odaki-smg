import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Alert, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../ui/Text";
import { auth, db } from "../../firebase/firebase";
import { signOut, deleteUser } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";
import { collection, query, where, getDocs, writeBatch, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export function SettingsScreen() {
  const nav = useNavigation<any>();
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid || null);
  const [themeDark, setThemeDark] = useState(false);
  const [language, setLanguage] = useState<"tr" | "en">("tr");
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid || null));
    return () => unsub();
  }, []);

  const onSignOut = async () => {
    try {
      await signOut(auth);
      nav.navigate(Routes.AuthStack as any, { screen: Routes.Login });
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
                // deletion may require re-authentication; inform user
                console.log("deleteUser error", e?.code || e?.message);
                Alert.alert("Hesap silme", "Hesap silinemedi. Yeniden kimlik doğrulama gerekebilir.");
                return;
              }
            }
            Alert.alert("Başarılı", "Hesabınız silindi.");
            nav.navigate(Routes.AuthStack as any, { screen: Routes.Login });
          } catch (e: any) {
            Alert.alert("Hata", "Hesap silme işleminde hata: " + (e?.message || e?.code || "bilinmeyen"));
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Pressable onPress={() => nav.goBack()} style={styles.back}>
          <Text>Geri</Text>
        </Pressable>
        <Text style={styles.title}>Ayarlar</Text>
        <Text style={styles.subtitle}>Uygulama ayarları ve tercihleri burada yer alacak. Yakında.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 16 },
  back: { marginBottom: 12 },
  title: { fontSize: 20, fontWeight: "700" },
  subtitle: { marginTop: 8, color: "#6b7280" },
});
