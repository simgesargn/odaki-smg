import React from "react";
import { View, StyleSheet } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { Button } from "../../ui/Button";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";

export const WelcomeScreen: React.FC = () => {
  const nav = useNavigation<any>();
  return (
    <Screen style={styles.container} gradient>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text variant="h1" style={{ color: "#fff" }}>ODAKI</Text>
        <Text variant="muted" style={{ color: "rgba(255,255,255,0.9)", marginTop: 8 }}>ODAKI'ye hoş geldin</Text>
      </View>
      <View style={{ padding: 16 }}>
        <Button title="Devam" onPress={() => nav.navigate(Routes.Onboarding as any)} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({ container: { padding: 0 } });
