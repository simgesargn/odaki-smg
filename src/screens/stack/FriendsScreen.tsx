import React from "react";
import { View, StyleSheet, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../ui/Text";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";

const SAMPLE = [
  { id: "f1", name: "Ayşe", status: "Çevrimiçi" },
  { id: "f2", name: "Mehmet", status: "Son aktif 2s önce" },
  { id: "f3", name: "Ece", status: "Çevrimdışı" },
];

export function FriendsScreen() {
  const nav = useNavigation<any>();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text variant="h2">Arkadaşlar</Text>
        <Pressable onPress={() => nav.navigate(Routes.Menu as any)} style={styles.addBtn}>
          <Text>Arkadaş ekle</Text>
        </Pressable>
      </View>

      <FlatList
        data={SAMPLE}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={{ fontWeight: "700" }}>{item.name}</Text>
            <Text variant="muted">{item.status}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  addBtn: { padding: 8 },
  card: { backgroundColor: "#fff", padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: "#eee" },
});
