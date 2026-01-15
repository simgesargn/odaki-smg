import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";

export const MenuScreen: React.FC = () => {
  const nav = useNavigation<any>();

  const go = (route: string) => {
    // close menu first, then navigate after short delay
    nav.goBack();
    setTimeout(() => {
      nav.navigate(route as any);
    }, 50);
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text variant="h1">Menü</Text>
        <Pressable onPress={() => nav.goBack()} style={styles.closeBtn}>
          <Text>Kapat</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        <Pressable style={styles.item} onPress={() => go(Routes.Notifications)}><Text>Bildirimler</Text></Pressable>
        <Pressable style={styles.item} onPress={() => go(Routes.Settings)}><Text>Ayarlar</Text></Pressable>
        <Pressable style={styles.item} onPress={() => go(Routes.Garden)}><Text>Bahçe</Text></Pressable>
        <Pressable style={styles.item} onPress={() => go(Routes.Friends)}><Text>Arkadaşlar</Text></Pressable>
        <Pressable style={styles.item} onPress={() => go(Routes.Achievements)}><Text>Başarılar</Text></Pressable>
        <Pressable style={styles.item} onPress={() => go(Routes.Premium)}><Text>Premium</Text></Pressable>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  closeBtn: { padding: 8 },
  list: { marginTop: 24 },
  item: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
});
