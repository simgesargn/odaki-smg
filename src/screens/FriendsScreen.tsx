import React, { useState } from "react";
import { View, StyleSheet, FlatList, Pressable, TextInput, Alert } from "react-native";
import { Screen } from "../ui/Screen";
import { Text } from "../ui/Text";
import { useTheme } from "../ui/theme/ThemeProvider";

type Friend = { id: string; name: string; status: "Online" | "Odakta" | "Offline" };

const MOCK: Friend[] = [
  { id: "f1", name: "Merve", status: "Online" },
  { id: "f2", name: "Sadettin", status: "Odakta" },
  { id: "f3", name: "Semra", status: "Offline" },
];

export const FriendsScreen: React.FC = () => {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [list, setList] = useState<Friend[]>(MOCK);

  const onAction = (f: Friend) => {
    if (f.status === "Offline") {
      Alert.alert("Hatırlat", "Hatırlatma gönderildi");
    } else {
      Alert.alert("Davet", "İstek gönderildi");
    }
  };

  const visible = list.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <Screen>
      <View style={styles.container}>
        <Text variant="h2" style={{ marginBottom: 12 }}>Arkadaşlar</Text>

        <TextInput
          placeholder="Ara..."
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          style={[styles.search, { backgroundColor: colors.card, borderColor: colors.border }]}
        />

        <View style={{ height: 12 }} />

        <FlatList
          data={visible}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={[styles.row, { backgroundColor: colors.card }]}>
              <View>
                <Text style={{ fontWeight: "700" }}>{item.name}</Text>
                <Text variant="muted" style={{ marginTop: 4 }}>{item.status}</Text>
              </View>

              <Pressable style={styles.actionBtn} onPress={() => onAction(item)}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>{item.status === "Offline" ? "Hatırlat" : "Davet et"}</Text>
              </Pressable>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  search: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  actionBtn: {
    backgroundColor: "#6C5CE7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
