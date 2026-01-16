import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../ui/Text";
import { useRoute, useNavigation } from "@react-navigation/native";
import { demoFriends } from "../../data/mockData";

export function FriendProfileScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const friendId = route.params?.friendId;
  const [friend, setFriend] = useState<any>(null);

  useEffect(() => {
    const f = demoFriends.find((d) => d.id === friendId) ?? demoFriends[0];
    setFriend(f);
  }, [friendId]);

  if (!friend) return null;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text variant="h2">{friend.name}</Text>
      </View>

      <View style={s.container}>
        <View style={s.profile}>
          <Text style={{ fontSize: 56 }}>{friend.emoji}</Text>
          <View style={{ marginLeft: 12 }}>
            <Text style={{ fontWeight: "700", fontSize: 18 }}>{friend.name}</Text>
            <Text variant="muted">@{friend.username ?? friend.id}</Text>
          </View>
        </View>

        <View style={s.metrics}>
          <View style={s.metricCard}><Text variant="muted">Toplam Odak (dk)</Text><Text style={s.metricValue}>320</Text></View>
          <View style={s.metricCard}><Text variant="muted">Tamamlanan Görev</Text><Text style={s.metricValue}>28</Text></View>
          <View style={s.metricCard}><Text variant="muted">Seri (gün)</Text><Text style={s.metricValue}>5</Text></View>
        </View>

        <View style={{ marginTop: 16 }}>
          <Pressable style={s.primary} onPress={() => Alert.alert("Mesaj", "Mesaj gönder (demo)")}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Mesaj Gönder</Text>
          </Pressable>
          <Pressable style={s.danger} onPress={() => Alert.alert("Onay", "Arkadaşı silinsin mi?")}>
            <Text style={{ color: "#fff" }}>Arkadaşı Sil</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F6FA" },
  header: { padding: 16 },
  container: { padding: 16 },
  profile: { flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  metrics: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  metricCard: { flex: 1, backgroundColor: "#fff", marginHorizontal: 6, padding: 12, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB" },
  metricValue: { fontWeight: "800", marginTop: 6 },
  primary: { marginTop: 12, backgroundColor: "#6C63FF", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  danger: { marginTop: 8, backgroundColor: "#FF5A7A", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
});
