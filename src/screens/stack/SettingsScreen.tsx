import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Alert, Switch } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { auth, db } from "../../firebase/firebase";
import { signOut, deleteUser } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";
import { collection, query, where, getDocs, writeBatch, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// (Bu dosyada UI ve çıkış/hesap silme mantığı zaten mevcut; geri butonu için RootNavigator'da headerShown true olarak ayarlandı)

export const SettingsScreen: React.FC = () => {
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
    <Screen style={styles.container}>
      <Text variant="h1">Ayarlar</Text>

      <View style={styles.section}>
        <Text variant="h2">Görünüm</Text>
        <View style={styles.row}>
          <Text>Gece Modu</Text>
          <Switch value={themeDark} onValueChange={setThemeDark} />
        </View>
        <View style={styles.row}>
          <Text>Dil</Text>
          <Pressable onPress={() => setLanguage(language === "tr" ? "en" : "tr")}>
            <Text variant="muted">{language === "tr" ? "TR" : "EN"}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="h2">Bildirimler</Text>
        <View style={styles.row}>
          <Text>Push Bildirimleri</Text>
          <Switch value={pushEnabled} onValueChange={setPushEnabled} />
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="h2">Gizlilik ve Destek</Text>
        <Pressable onPress={() => Alert.alert("Gizlilik Politikası", "Gizlilik politikası burada gösterilebilir.")}><Text variant="muted">Gizlilik Politikası</Text></Pressable>
        <Pressable onPress={() => Alert.alert("Yardım ve Destek", "Yardım bilgileri burada gösterilebilir.")} style={{ marginTop: 8 }}><Text variant="muted">Yardım ve Destek</Text></Pressable>
      </View>

      <View style={styles.section}>
        <Text variant="h2">Hesap</Text>
        <Pressable onPress={() => Alert.alert("Şifre Değiştir", "Şifre değiştirme akışı burada olmalı.")}><Text variant="muted">Şifre Değiştir</Text></Pressable>

        <Pressable onPress={onSignOut} style={{ marginTop: 8 }}><Text variant="muted">Çıkış Yap</Text></Pressable>

        <Pressable onPress={onDeleteAccount} style={{ marginTop: 8 }}><Text variant="muted">Hesabı Devre Dışı Bırak / Sil</Text></Pressable>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  section: { marginTop: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
});
