import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { useTheme } from "../../ui/theme/ThemeProvider";

type Suggested = { id: string; name: string; handle: string };

const MOCK_SUGGESTED: Suggested[] = [
  { id: "s1", name: "Merve Yılmaz", handle: "@merve" },
  { id: "s2", name: "Ali Karaca", handle: "@alik" },
  { id: "s3", name: "Deniz Şen", handle: "@deniz" },
  { id: "s4", name: "Bora Tekin", handle: "@bora" },
  { id: "s5", name: "Ece Aydın", handle: "@ece" },
];

const AddFriendScreen: React.FC = () => {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [sentIds, setSentIds] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_SUGGESTED;
    return MOCK_SUGGESTED.filter(
      (s) => s.name.toLowerCase().includes(q) || s.handle.toLowerCase().includes(q)
    );
  }, [query]);

  const onSend = (id: string, name: string, handle: string) => {
    setSentIds((p) => (p.includes(id) ? p : [...p, id]));
    Alert.alert("İstek gönderildi", `${name} (${handle}) için istek gönderildi.`);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text variant="h2">Arkadaş Ekle</Text>
          <Text variant="muted" style={{ marginTop: 8 }}>
            Kullanıcı adı ara
          </Text>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              placeholder="Kullanıcı adı ara"
              placeholderTextColor="#999"
              value={query}
              onChangeText={setQuery}
              style={[styles.input, { borderColor: colors.border, backgroundColor: "#fff" }]}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={{ height: 12 }} />

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text variant="muted" style={{ marginBottom: 10 }}>
              Önerilenler
            </Text>

            <FlatList
              data={filtered}
              keyExtractor={(i) => i.id}
              renderItem={({ item }) => {
                const sent = sentIds.includes(item.id);
                return (
                  <View style={styles.row}>
                    <View style={styles.rowLeft}>
                      <View style={[styles.avatar, { backgroundColor: "#EEF0F6" }]}>
                        <Text style={{ fontWeight: "700" }}>{item.name[0]}</Text>
                      </View>
                      <View style={{ marginLeft: 12 }}>
                        <Text style={{ fontWeight: "700" }}>{item.name}</Text>
                        <Text variant="muted" style={{ marginTop: 4 }}>
                          {item.handle}
                        </Text>
                      </View>
                    </View>

                    <Pressable
                      style={[
                        styles.actionBtn,
                        sent ? styles.actionBtnDisabled : { backgroundColor: colors.primary },
                      ]}
                      onPress={() => onSend(item.id, item.name, item.handle)}
                      disabled={sent}
                    >
                      <Text style={{ color: "#fff", fontWeight: "700" }}>{sent ? "İstek Gönderildi" : "Ekle"}</Text>
                    </Pressable>
                  </View>
                );
              }}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              scrollEnabled={false}
            />
          </View>

          <View style={{ height: 12 }} />

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text variant="muted">Yakında QR ile ekleme özelliği gelecek.</Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </Screen>
    </KeyboardAvoidingView>
  );
};

export default AddFriendScreen;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnDisabled: { backgroundColor: "#9CA3AF", opacity: 0.8 },
});
