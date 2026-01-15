import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Screen } from "../ui/Screen";
import { Text } from "../ui/Text";
import { theme } from "../ui/theme";

export const PrivacyScreen: React.FC = () => {
  return (
    <Screen>
      <View style={styles.container}>
        <Text variant="h2" style={{ marginBottom: 12 }}>Gizlilik</Text>

        <View style={styles.card}>
          <View style={styles.rowColumn}>
            <Text style={styles.label}>KVKK / Aydınlatma Metni</Text>
            <Text variant="muted" style={{ marginTop: 8 }}>
              Kişisel verileriniz uygulama tarafından sadece odak ve analiz amaçlı kullanılır.
            </Text>
          </View>

          <View style={styles.rowColumn}>
            <Text style={styles.label}>Verilerim</Text>
            <Text variant="muted" style={{ marginTop: 8 }}>
              Saklanan veri: görevler, odak oturumları. İsteğe bağlı silme gelecekte eklenecek.
            </Text>
          </View>

          <View style={styles.rowColumn}>
            <Text style={[styles.label, { color: theme.colors.danger ?? "#ef4444" }]}>Hesabı sil</Text>
            <Text variant="muted" style={{ marginTop: 8 }}>
              Hesabı silme özelliği yakında eklenecektir. Şu an için pasif.
            </Text>
            <Pressable style={[styles.disabledBtn]}>
              <Text style={{ color: "#fff" }}>Hesabı Sil (Yakında)</Text>
            </Pressable>
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
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  rowColumn: { marginBottom: 12 },
  label: { fontSize: 16, color: theme.colors.text },
  disabledBtn: {
    marginTop: 12,
    backgroundColor: "#9ca3af",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
});
