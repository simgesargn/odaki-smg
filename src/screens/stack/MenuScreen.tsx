import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";

export const MenuScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const nav = useNavigation<any>(); // kısa isim; kesin tanımlandı

  const TAB_ROUTES = new Set<string>([
    Routes.Home,
    Routes.Tasks,
    Routes.Focus,
    Routes.Odi,
    Routes.Friends,
    Routes.Stats,
    Routes.Profile,
  ]);

  function handleNavigate(route: string) {
    // doğrudan navigation (nav tanımlı)
    if (TAB_ROUTES.has(route)) {
      nav.navigate(Routes.MainTabs as any, { screen: route } as any);
    } else {
      nav.navigate(route as any);
    }
  }

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text variant="h1">Menü</Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text>Kapat</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        <Pressable style={styles.item} onPress={() => handleNavigate(Routes.Notifications)}><Text>Bildirimler</Text></Pressable>
        <Pressable style={styles.item} onPress={() => handleNavigate(Routes.Settings)}><Text>Ayarlar</Text></Pressable>
        <Pressable style={styles.item} onPress={() => handleNavigate(Routes.Garden)}><Text>Bahçe</Text></Pressable>
        <Pressable style={styles.item} onPress={() => handleNavigate(Routes.Friends)}><Text>Arkadaşlar</Text></Pressable>
        <Pressable style={styles.item} onPress={() => handleNavigate(Routes.Achievements)}><Text>Başarılar</Text></Pressable>
        <Pressable style={styles.item} onPress={() => handleNavigate(Routes.Premium)}><Text>Premium</Text></Pressable>
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
