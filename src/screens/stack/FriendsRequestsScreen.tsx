import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { useTheme } from "../../ui/theme/ThemeProvider";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";

export const FriendsRequestsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState<"incoming" | "outgoing">("incoming");

  const incomingCount = 0;
  const outgoingCount = 0;

  const emptyIncoming = (
    <View style={styles.emptyWrap}>
      <View style={[styles.icon, { backgroundColor: "#EEF0F6" }]}><Text style={{ fontSize: 28 }}>📨</Text></View>
      <Text style={{ fontWeight: "700", fontSize: 18, marginTop: 12 }}>Gelen İstek Yok</Text>
      <Text variant="muted" style={{ marginTop: 8, textAlign: "center" }}>
        Size gönderilen arkadaşlık isteği bulunmuyor.
      </Text>
      <Pressable style={[styles.cta, { backgroundColor: colors.primary, marginTop: 16 }]} onPress={() => navigation.navigate(Routes.AddFriend as any)}>
        <Text style={{ color: "#fff", fontWeight: "700" }}>Arkadaş Ekle</Text>
      </Pressable>
    </View>
  );

  const emptyOutgoing = (
    <View style={styles.emptyWrap}>
      <View style={[styles.icon, { backgroundColor: "#EEF0F6" }]}><Text style={{ fontSize: 28 }}>✉️</Text></View>
      <Text style={{ fontWeight: "700", fontSize: 18, marginTop: 12 }}>Giden İstek Yok</Text>
      <Text variant="muted" style={{ marginTop: 8, textAlign: "center" }}>
        Gönderdiğiniz istekler burada görünür.
      </Text>
      <Pressable style={[styles.cta, { backgroundColor: colors.primary, marginTop: 16 }]} onPress={() => navigation.navigate(Routes.AddFriend as any)}>
        <Text style={{ color: "#fff", fontWeight: "700" }}>Arkadaş Ekle</Text>
      </Pressable>
    </View>
  );

  return (
    <Screen style={{ padding: 16 }}>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <Pressable
          onPress={() => setTab("incoming")}
          style={[styles.pill, tab === "incoming" ? { backgroundColor: colors.primary } : { backgroundColor: "#F3F4F6" }]}
        >
          <Text style={tab === "incoming" ? styles.pillTextActive : styles.pillText}>Gelen istekler ({incomingCount})</Text>
        </Pressable>

        <Pressable
          onPress={() => setTab("outgoing")}
          style={[styles.pill, tab === "outgoing" ? { backgroundColor: colors.primary } : { backgroundColor: "#F3F4F6" }]}
        >
          <Text style={tab === "outgoing" ? styles.pillTextActive : styles.pillText}>Giden istekler ({outgoingCount})</Text>
        </Pressable>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {tab === "incoming" ? emptyIncoming : emptyOutgoing}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
    marginHorizontal: 4,
  },
  pillText: { color: "#111", fontWeight: "600" },
  pillTextActive: { color: "#fff", fontWeight: "700" },

  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    elevation: 3,
  },

  emptyWrap: { alignItems: "center", paddingVertical: 20 },
  icon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  cta: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 },
});
