import React from "react";
import { View, StyleSheet, Text } from "react-native";

export const SplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ODAKI</Text>
      <Text style={styles.sub}>Yükleniyor...</Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  title: { fontSize: 28, fontWeight: "800" },
  sub: { marginTop: 8, fontSize: 14, opacity: 0.6 },
});
