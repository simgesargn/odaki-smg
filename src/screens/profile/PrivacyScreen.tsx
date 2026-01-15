import React from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { theme } from "../../ui/theme";

export const PrivacyScreen: React.FC = () => {
  const onRow = (label: string) => Alert.alert(label, "Yakında");

  return (
    <Screen>
      <View style={styles.container}>
        <Text variant="h2" style={{ marginBottom: 12 }}>Gizlilik</Text>

        <View style={styles.card}>
          <Pressable style={styles.row} onPress={() => onRow("KVKK / Aydınlatma Metni")}>
            <Text style={styles.label}>KVKK / Aydınlatma Metni</Text>
            <Text style={styles.chev}>›</Text>
          </Pressable>

          <Pressable style={styles.row} onPress={() => onRow("Verilerim")}>
            <Text style={styles.label}>Verilerim</Text>
            <Text style={styles.chev}>›</Text>
          </Pressable>

          <Pressable style={styles.row} onPress={() => onRow("Hesabı sil")}>
            <Text style={[styles.label, { color: theme.colors.danger ?? "#ef4444" }]}>Hesabı sil</Text>
            <Text style={[styles.chev, { color: theme.colors.danger ?? "#ef4444" }]}>›</Text>
          </Pressable>
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
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
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
  label: { fontSize: 16, color: theme.colors.text },
  chev: { color: theme.colors.muted, fontSize: 20 },
});
