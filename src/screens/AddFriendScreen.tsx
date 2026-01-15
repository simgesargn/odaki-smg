import React, { useMemo, useState } from "react";
import { View, StyleSheet, TextInput, FlatList, Pressable, Alert } from "react-native";
import { Screen } from "../ui/Screen";
import { Text } from "../ui/Text";
import { useTheme } from "../ui/theme/ThemeProvider";

type Result = { id: string; name: string; handle: string; desc?: string };

const MOCK_RESULTS: Result[] = [
  { id: "r1", name: "Merve Y.", handle: "@merve", desc: "Öğrenci" },
  { id: "r2", name: "Ali K.", handle: "@alik", desc: "Çalışan" },
  { id: "r3", name: "Deniz S.", handle: "@deniz", desc: "Freelancer" },
];

export const AddFriendScreen: React.FC = () => {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    if (!query.trim()) return MOCK_RESULTS;
    const q = query.toLowerCase();
    return MOCK_RESULTS.filter((r) => r.name.toLowerCase().includes(q) || r.handle.toLowerCase().includes(q));
  }, [query]);

  const sendRequest = (r: Result) => {
    Alert.alert("İstek gönderildi", `${r.name} (${r.handle}) için istek gönderildi (demo).`);
  };

  return (
    <Screen>
      <View style={{ padding: 16 }}>
        <Text variant="h2">Arkadaş Ekle</Text>
        <Text variant="muted" style={{ marginTop: 8 }}>
          Kullanıcı adı veya e‑posta ile ara.
        </Text>

        <TextInput
          placeholder="Kullanıcı adı veya e‑posta"
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card }]}
        />

        <View style={{ height: 12 }} />

        <FlatList
          data={results}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={[styles.row, { backgroundColor: colors.card }]}>
              <View>
                <Text style={{ fontWeight: "700" }}>{item.name}</Text>
                <Text variant="muted" style={{ marginTop: 4 }}>{item.handle}</Text>
              </View>

              <Pressable style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={() => sendRequest(item)}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Ekle</Text>
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
  input: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  addBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
