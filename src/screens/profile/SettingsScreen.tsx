import React from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { theme } from "../../ui/theme";

export const SettingsScreen: React.FC = () => {
  const onSoon = (label: string) => Alert.alert(label, "Yakında");

  return (
    <Screen>
      <View style={styles.container}>
        <Text variant="h2" style={{ marginBottom: 12 }}>Ayarlar</Text>

        <View style={styles.card}>
          <Pressable style={styles.row} onPress={() => onSoon("Dil")}>
            <Text style={styles.label}>Dil</Text>
            <Text style={styles.chev}>›</Text>
          </Pressable>

          <Pressable style={styles.row} onPress={() => onSoon("Tema")}>
            <Text style={styles.label}>Tema</Text>
            <Text style={styles.chev}>›</Text>
          </Pressable>

          <Pressable style={styles.row} onPress={() => onSoon("Hesap")}>
            <Text style={styles.label}>Hesap</Text>
            <Text style={styles.chev}>›</Text>
          </Pressable>

          <Pressable style={styles.row} onPress={() => onSoon("Hakkında")}>
            <Text style={styles.label}>Hakkında</Text>
            <Text style={styles.chev}>›</Text>
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
