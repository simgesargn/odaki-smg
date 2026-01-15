import React from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { theme } from "../../ui/theme";

export const NotificationsScreen: React.FC = () => {
  const onRow = (label: string) => Alert.alert(label, "Yakında");

  return (
    <Screen>
      <View style={styles.container}>
        <Text variant="h2" style={{ marginBottom: 12 }}>Bildirimler</Text>

        <View style={styles.card}>
          <Pressable style={styles.row} onPress={() => onRow("Görev hatırlatıcıları")}>
            <Text style={styles.label}>Görev hatırlatıcıları</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.sub}>Açık</Text>
              <Text style={styles.chev}>›</Text>
            </View>
          </Pressable>

          <Pressable style={styles.row} onPress={() => onRow("Odak bildirimleri")}>
            <Text style={styles.label}>Odak bildirimleri</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.sub}>Açık</Text>
              <Text style={styles.chev}>›</Text>
            </View>
          </Pressable>

          <Pressable style={styles.row} onPress={() => onRow("Odi önerileri")}>
            <Text style={styles.label}>Odi önerileri</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.sub}>Kapalı</Text>
              <Text style={styles.chev}>›</Text>
            </View>
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
  sub: { fontSize: 13, color: theme.colors.muted, marginRight: 8 },
  chev: { color: theme.colors.muted, fontSize: 20 },
});
