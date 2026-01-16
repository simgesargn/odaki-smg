import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

export function PrivacyScreen() {
  const nav = useNavigation<any>();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Pressable onPress={() => nav.goBack()} style={styles.back}>
          <Text>Geri</Text>
        </Pressable>
        <Text style={styles.title}>Gizlilik</Text>
        <Text style={styles.subtitle}>Gizlilik ayarları ve politika burada gösterilecek. Yakında.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 16 },
  back: { marginBottom: 12 },
  title: { fontSize: 20, fontWeight: "700" },
  subtitle: { marginTop: 8, color: "#6b7280" },
});
