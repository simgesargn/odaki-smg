import React, { useEffect, useState } from "react";
import { View, Pressable, StyleSheet, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Text } from "../../ui/Text";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Routes } from "../../navigation/routes";

const KEY_ANALYTICS = "odaki_priv_analytics_v1";
const KEY_SHARE = "odaki_priv_share_v1";

export function PrivacyScreen() {
  const nav = useNavigation<any>();
  const [analytics, setAnalytics] = useState<boolean>(true);
  const [share, setShare] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const a = await AsyncStorage.getItem(KEY_ANALYTICS);
        const s = await AsyncStorage.getItem(KEY_SHARE);
        if (a !== null) setAnalytics(a === "1");
        if (s !== null) setShare(s === "1");
      } catch {}
    })();
  }, []);

  const toggleAnalytics = async (v: boolean) => {
    setAnalytics(v);
    try {
      await AsyncStorage.setItem(KEY_ANALYTICS, v ? "1" : "0");
    } catch {}
  };
  const toggleShare = async (v: boolean) => {
    setShare(v);
    try {
      await AsyncStorage.setItem(KEY_SHARE, v ? "1" : "0");
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => nav.navigate(Routes.RootTabs as any)} style={styles.back}><Text>Geri</Text></Pressable>
        <Text variant="h2">Gizlilik</Text>
        <View style={{ width: 56 }} />
      </View>

      <View style={styles.container}>
        <Text style={{ marginBottom: 12, color: "#374151" }}>
          Odaki, kullanıcı verilerini gizliliğinizi koruyacak şekilde işler. Aşağıdaki tercihleri ayarlayabilirsiniz.
        </Text>

        <View style={styles.row}>
          <Text>Analitik paylaşımı</Text>
          <Switch value={analytics} onValueChange={toggleAnalytics} />
        </View>

        <View style={styles.row}>
          <Text>Veri paylaşımı (anonim)</Text>
          <Switch value={share} onValueChange={toggleShare} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  back: { padding: 8 },
  container: { padding: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f3f3f3" },
});
