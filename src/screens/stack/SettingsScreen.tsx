import React, { useState } from "react";
import { View, StyleSheet, Pressable, Alert, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../ui/Text";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";
import { useTheme } from "../../ui/ThemeProvider";

export function SettingsScreen() {
  const nav = useNavigation<any>();
  const theme = useTheme();

  // Theme toggle is disabled — UI only
  const [themeDark] = useState(false);

  // Push and language are local UI state only
  const [pushEnabled, setPushEnabled] = useState<boolean>(true);
  const [language, setLanguage] = useState<"tr" | "en">("tr");

  const onSignOut = async () => {
    Alert.alert("Yakında", "Çıkış yapma özelliği yakında aktif olacak.");
  };

  const onDeleteAccount = async () => {
    Alert.alert("Yakında", "Hesap silme özelliği yakında aktif olacak.");
  };

  const togglePush = (v: boolean) => {
    setPushEnabled(v);
  };

  const setLang = (l: "tr" | "en") => {
    setLanguage(l);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { paddingHorizontal: theme.spacing.lg }]}>
        <Text variant="h2">Ayarlar</Text>
      </View>

      <View style={[styles.container, { paddingHorizontal: theme.spacing.lg }]}>
        {/* Bildirim Ayarları */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={styles.cardTitle}>Bildirim Ayarları</Text>

          <View style={styles.row}>
            <Text>Push Bildirimleri</Text>
            <Switch value={pushEnabled} onValueChange={togglePush} />
          </View>

          <View style={styles.row}>
            <Text>Rahatsız Etme (Gece)</Text>
            <Switch value={false} onValueChange={() => Alert.alert("Yakında", "Bu özellik demo modunda.")} />
          </View>

          <View style={{ marginTop: 8 }}>
            <Text style={{ marginBottom: 6 }}>Özet Bildirim</Text>
            <View style={{ flexDirection: "row" }}>
              <Pressable onPress={() => setPushEnabled(false)} style={[styles.chip, !pushEnabled && styles.chipActive]}>
                <Text style={(!pushEnabled && { color: "#fff" })}>Kapalı</Text>
              </Pressable>
              <Pressable onPress={() => setPushEnabled(true)} style={[styles.chip, pushEnabled && styles.chipActive, { marginLeft: 8 }]}>
                <Text style={(pushEnabled && { color: "#fff" })}>Günlük</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Dil Ayarları */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={styles.cardTitle}>Dil</Text>
          <View style={{ flexDirection: "row", marginTop: 8 }}>
            <Pressable onPress={() => setLang("tr")} style={[styles.langBtn, language === "tr" && styles.langActive]}>
              <Text>Türkçe</Text>
            </Pressable>
            <Pressable onPress={() => setLang("en")} style={[styles.langBtn, language === "en" && styles.langActive, { marginLeft: 8 }]}>
              <Text>English</Text>
            </Pressable>
          </View>
          <Text variant="muted" style={{ marginTop: 8 }}>Dil seçimi demo amaçlı; gerçek değişiklik yakında.</Text>
        </View>

        {/* Tema (disabled) */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={styles.cardTitle}>Tema</Text>
            <View style={{ alignItems: "flex-end" }}>
              <Text variant="muted">Yakında</Text>
              <Switch value={themeDark} onValueChange={() => {}} disabled />
            </View>
          </View>
          <Text variant="muted" style={{ marginTop: 8 }}>
            Tema yönetimi şu an devre dışı. Koyu tema yakında aktif olacak.
          </Text>
        </View>

        {/* Hesap */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={styles.cardTitle}>Hesap</Text>
          <View style={{ marginTop: 8 }}>
            <Text variant="muted">E-posta: { /* gösterilecek e-posta yoksa gizli */ } —</Text>
          </View>

          <View style={{ marginTop: 12 }}>
            <Pressable style={[styles.primary]} onPress={onSignOut}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Çıkış Yap</Text>
            </Pressable>

            <Pressable style={[styles.danger, { marginTop: 8 }]} onPress={onDeleteAccount}>
              <Text style={{ color: "#fff" }}>Hesabı Sil</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingVertical: 12 },
  container: { paddingTop: 12 },
  card: { padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  cardTitle: { fontWeight: "700", marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
  langBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: "#F3F4F6" },
  langActive: { backgroundColor: "#EDE9FE" },
  chip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: "#F3F4F6" },
  chipActive: { backgroundColor: "#E9E7FF" },
  primary: { backgroundColor: "#6C5CE7", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  danger: { backgroundColor: "#ef4444", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
});
