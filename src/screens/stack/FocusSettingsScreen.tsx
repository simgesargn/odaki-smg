import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Alert, ScrollView } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { loadFocusSettings, saveFocusSettings, FocusSettingsLocal, DEFAULT_FOCUS_SETTINGS } from "../../features/focus/focusStore";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";

export const FocusSettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<FocusSettingsLocal | null>(null);
  const navigation = useNavigation<any>();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await loadFocusSettings();
        if (!mounted) return;
        setSettings(s ?? DEFAULT_FOCUS_SETTINGS);
      } catch {
        setSettings(DEFAULT_FOCUS_SETTINGS);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const persist = async (next: FocusSettingsLocal) => {
    setSettings(next);
    try {
      await saveFocusSettings(next);
    } catch {
      Alert.alert("Hata", "Ayarlar kaydedilemedi.");
    }
  };

  const onRemoveAllowed = (app: string) => {
    if (!settings) return;
    const nextAllowed = settings.allowedApps.filter((a) => a !== app);
    const nextBlocked = [app, ...settings.blockedApps];
    persist({ ...settings, allowedApps: nextAllowed, blockedApps: nextBlocked });
  };

  const onAllowBlocked = (app: string) => {
    if (!settings) return;
    if (settings.allowedApps.length >= settings.freeLimit) {
      Alert.alert("Limit aşılıyor", `Ücretsiz planda en fazla ${settings.freeLimit} uygulama izin verilebilir.`);
      return;
    }
    const nextBlocked = settings.blockedApps.filter((b) => b !== app);
    const nextAllowed = [...settings.allowedApps, app];
    persist({ ...settings, allowedApps: nextAllowed, blockedApps: nextBlocked });
  };

  const onPremium = () => {
    navigation.navigate(Routes.Premium as any);
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
            Ücretsiz kullanıcı en fazla {settings?.freeLimit ?? DEFAULT_FOCUS_SETTINGS.freeLimit} uygulama ekleyebilir.
          </Text>
          <Pressable style={[styles.cta]} onPress={onPremium}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Premium'a Geç</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate(Routes.Premium as any)} style={{ marginTop: 8 }}>
            <Text variant="muted">Daha fazlası için Premium</Text>
          </Pressable>
        </View>

        <View style={[styles.card, { marginTop: 12 }]}>
          <Text style={{ fontWeight: "700" }}>
            İzinli Uygulamalar ({settings?.allowedApps.length ?? 0}/{settings?.freeLimit ?? DEFAULT_FOCUS_SETTINGS.freeLimit})
          </Text>
          {(settings?.allowedApps.length ?? 0) === 0 ? (
            <Text variant="muted" style={{ marginTop: 8 }}>Henüz izinli uygulama yok.</Text>
          ) : (
            (settings?.allowedApps ?? []).map((app) => (
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
          {(settings?.blockedApps.length ?? 0) === 0 ? (
            <Text variant="muted" style={{ marginTop: 8 }}>Engellenmiş uygulama yok.</Text>
          ) : (
            (settings?.blockedApps ?? []).map((app) => (
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