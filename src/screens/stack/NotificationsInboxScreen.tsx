import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";

const MOCK = [
  { id: "n1", title: "Hoşgeldin!", body: "Odakta kal ve çiçek topla." },
  { id: "n2", title: "Günlük Hatırlatma", body: "Bugün 25 dk odakla." },
];

export const NotificationsInboxScreen: React.FC = () => {
  return (
    <Screen style={{ padding: 16 }}>
      <Text variant="h2">Bildirimler</Text>
      <FlatList
        data={MOCK}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={() => <View style={styles.empty}><Text variant="muted">Henüz bildirimin yok</Text></View>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={{ fontWeight: "700" }}>{item.title}</Text>
            <Text variant="muted" style={{ marginTop: 6 }}>{item.body}</Text>
          </View>
        )}
        style={{ marginTop: 12 }}
      />
    </Screen>
  );
};

export default NotificationsInboxScreen;

const styles = StyleSheet.create({
  empty: { padding: 20, alignItems: "center" },
  item: { padding: 12, borderRadius: 12, backgroundColor: "#fff", marginBottom: 10, borderWidth: 1, borderColor: "#eee" },
});
