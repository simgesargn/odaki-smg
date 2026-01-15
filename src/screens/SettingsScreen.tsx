import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Switch } from "react-native";
import { Screen } from "../ui/Screen";
import { Text } from "../ui/Text";
import { useTheme } from "../ui/theme/ThemeProvider";
import { useI18n } from "../i18n/I18nProvider";
import { preferencesStorage } from "../services/preferencesStorage";

export const SettingsScreen: React.FC = () => {
  const { mode, setMode, colors } = useTheme();
  const { lang, setLang, t } = useI18n();

  const [localLang, setLocalLang] = useState<"tr" | "en">(lang);
  const [dark, setDark] = useState(mode === "dark");
  const [email] = useState<string | null>(null);

  useEffect(() => {
    // sync provider values if changed elsewhere
    setLocalLang(lang);
    setDark(mode === "dark");
  }, [lang, mode]);

  // persist via preferencesStorage as well
  const onSetLang = async (l: "tr" | "en") => {
    setLocalLang(l);
    setLang(l);
    await preferencesStorage.setLang(l);
  };

  const onToggleTheme = async (v: boolean) => {
    setDark(v);
    setMode(v ? "dark" : "light");
    await preferencesStorage.setThemeDark(v);
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text variant="h2" style={{ marginBottom: 12 }}>{t("settings")}</Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.row}>
            <Text style={styles.label}>{t("language")}</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable
                onPress={() => onSetLang("tr")}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: localLang === "tr" ? "#EDEBFF" : "#F0F1F5",
                }}
              >
                <Text style={{ color: localLang === "tr" ? colors.primary : colors.text, fontWeight: "600" }}>TR</Text>
              </Pressable>

              <Pressable
                onPress={() => onSetLang("en")}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: localLang === "en" ? "#EDEBFF" : "#F0F1F5",
                }}
              >
                <Text style={{ color: localLang === "en" ? colors.primary : colors.text, fontWeight: "600" }}>EN</Text>
              </Pressable>
            </View>
          </View>

          <View style={{ height: 14 }} />

          <View style={styles.row}>
            <Text style={styles.label}>{t("themeDark")}</Text>
            <Switch value={dark} onValueChange={(v) => onToggleTheme(v)} />
          </View>

          <View style={{ height: 14 }} />

          <View style={styles.row}>
            <Text style={styles.label}>{t("account")}</Text>
            <Text style={styles.sub}>{email || "-"}</Text>
          </View>

          <View style={[styles.row, { paddingVertical: 18 }]}>
            <View>
              <Text style={styles.label}>{t("about")}</Text>
              <Text variant="muted" style={{ marginTop: 6 }}>Odaki — odaklanma ve üretkenlik uygulamanız.</Text>
            </View>
          </View>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
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
  label: { fontSize: 16, color: "#111" },
  sub: { fontSize: 14, color: "#6b7280" },
});
