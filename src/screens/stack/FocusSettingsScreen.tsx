import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Alert, ScrollView } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";

const DEFAULT_ALLOWED = ["Telefon", "Notlar", "Takvim"];
const DEFAULT_BLOCKED = ["Mesajlar", "Instagram", "TikTok", "YouTube", "X / Twitter", "Facebook", "WhatsApp", "Snapchat", "Telegram"];
const FREE_LIMIT = 3;

export const FocusSettingsScreen: React.FC = () => {
  const [allowed, setAllowed] = useState<string[]>(DEFAULT_ALLOWED);
  const [blocked, setBlocked] = useState<string[]>(DEFAULT_BLOCKED);
  const [freeLimit] = useState<number>(FREE_LIMIT);

  const onRemoveAllowed = (app: string) => {
    const nextAllowed = allowed.filter((a) => a !== app);
    setAllowed(nextAllowed);
    setBlocked([app, ...blocked]);
  };

  const onAllowBlocked = (app: string) => {
    if (allowed.length >= freeLimit) {
      Alert.alert("Limit aşılıyor", `Ücretsiz planda en fazla ${freeLimit} uygulama izin verilebilir.`);
      return;
    }
    setBlocked(blocked.filter((b) => b !== app));
    setAllowed([...allowed, app]);
  };

  const onPremium = () => {
    Alert.alert("Premium", "Premium'a geçme akışı demo amaçlıdır.");
  };

  return (
    <Screen style={{ padding: 16 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text variant="h2">Odak Ayarları</Text>
        <Text variant="muted" style={{ marginTop: 8 }}>
          Odak sırasında yalnızca seçili uygulamalara izin verilir.
        </Text>

        <View style={[styles.card, { marginTop: 12 }]}>
          <Text style={{ fontWeight: "700" }}>Akademik Not</Text>
          <Text variant="muted" style={{ marginTop: 8 }}>
            Odak modundayken izin verilen uygulamalar dışındaki uygulamalar kısıtlanır. Burada izinleri test amaçlı düzenleyebilirsiniz.
          </Text>
        </View>

        <View style={[styles.card, { marginTop: 12 }]}>
          <Text style={{ fontWeight: "700" }}>Ücretsiz Plan Limiti</Text>
          <Text variant="muted" style={{ marginTop: 8 }}>
            Ücretsiz kullanıcı en fazla {freeLimit} uygulama ekleyebilir.
          </Text>
          <Pressable style={[styles.cta]} onPress={onPremium}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Premium'a Geç</Text>
          </Pressable>
        </View>

        <View style={[styles.card, { marginTop: 12 }]}>
          <Text style={{ fontWeight: "700" }}>İzinli Uygulamalar ({allowed.length}/{freeLimit})</Text>
          {allowed.length === 0 ? (
            <Text variant="muted" style={{ marginTop: 8 }}>Henüz izinli uygulama yok.</Text>
          ) : (
            allowed.map((app) => (
              <View key={app} style={styles.row}>
                <Text style={{ fontWeight: "700" }}>{app}</Text>
                <Pressable onPress={() => onRemoveAllowed(app)} style={styles.smallBtn}>
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Kaldır</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        <View style={[styles.card, { marginTop: 12 }]}>
          <Text style={{ fontWeight: "700" }}>Engellenmiş Uygulamalar</Text>
          {blocked.length === 0 ? (
            <Text variant="muted" style={{ marginTop: 8 }}>Engellenmiş uygulama yok.</Text>
          ) : (
            blocked.map((app) => (
              <View key={app} style={styles.row}>
                <Text style={{ fontWeight: "700" }}>{app}</Text>
                <Pressable onPress={() => onAllowBlocked(app)} style={[styles.smallBtn, { backgroundColor: "#2563EB" }]}>
                  <Text style={{ color: "#fff", fontWeight: "700" }}>İzin Ver</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
};

export default FocusSettingsScreen;

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#EEE" },
  cta: { marginTop: 12, paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: "#6C63FF" },
  row: { marginTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  smallBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: "#fff" },
});