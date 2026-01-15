import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";

export const PremiumScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>Geri</Text></Pressable>
        <Text style={styles.title}>Premium</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView>
        <Text style={styles.body}>Premium özellikleri keşfedin.</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  back: { color: "#6C5CE7" },
  title: { fontSize: 20, fontWeight: "700" },
  body: { marginTop: 12, fontSize: 15, color: "#444" },
});
