import React, { useEffect, useState } from "react";
import { View, StyleSheet, Switch } from "react-native";
import { Screen } from "../ui/Screen";
import { Text } from "../ui/Text";
import { theme } from "../ui/theme";
import { preferencesStorage } from "../services/preferencesStorage";

const colors = theme.colors;
const spacing = theme.spacing;

export const NotificationsScreen: React.FC = () => {
  const [prefs, setPrefs] = useState({ tasks: true, focus: true, odi: false });

  useEffect(() => {
    (async () => {
      const p = await preferencesStorage.getNotifPrefs();
      setPrefs(p);
    })();
  }, []);

  const setPref = async (k: keyof typeof prefs, v: boolean) => {
    const next = { ...prefs, [k]: v };
    setPrefs(next);
    await preferencesStorage.setNotifPrefs({ [k]: v });
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text variant="h2" style={{ marginBottom: 12 }}>Bildirimler</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Görev hatırlatıcıları</Text>
            <Switch value={prefs.tasks} onValueChange={(v) => setPref("tasks", v)} />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Odak bildirimleri</Text>
            <Switch value={prefs.focus} onValueChange={(v) => setPref("focus", v)} />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Odi önerileri</Text>
            <Switch value={prefs.odi} onValueChange={(v) => setPref("odi", v)} />
          </View>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg },
  card: {
    backgroundColor: colors.card,
    borderRadius: theme.radius?.md ?? 12,
    paddingVertical: 8,
    overflow: "hidden",
    ...theme.shadow.card,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f3f4f6",
  },
  label: { fontSize: 16, color: colors.text },
});
