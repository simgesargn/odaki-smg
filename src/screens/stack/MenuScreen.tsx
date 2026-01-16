import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";

export const MenuScreen: React.FC = () => {
  // Tek bir hook çağrısı
  const navigation = useNavigation<any>();

  const handleNavigate = (route: string, isTab?: boolean) => {
    try {
      if (isTab) {
        // Tab içindeki sayfaya git (RootTabs altında ilgili screen)
        navigation.navigate(Routes.RootTabs as any, { screen: route } as any);
      } else {
        // Stack ekranına doğrudan git
        navigation.navigate(route as any);
      }
    } catch {
      // ignore navigation errors to avoid crash
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text variant="h1">Menü</Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text>Kapat</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        <Pressable style={styles.item} onPress={() => handleNavigate(Routes.Notifications, false)}>
          <View style={styles.itemRow}><Text>Bildirimler</Text><Text>›</Text></View>
        </Pressable>

        <Pressable style={styles.item} onPress={() => handleNavigate(Routes.Settings, false)}>
          <View style={styles.itemRow}><Text>Ayarlar</Text><Text>›</Text></View>
        </Pressable>

        <Pressable style={styles.item} onPress={() => handleNavigate(Routes.Garden, false)}>
          <View style={styles.itemRow}><Text>Bahçe</Text><Text>›</Text></View>
        </Pressable>

        <Pressable style={styles.item} onPress={() => handleNavigate(Routes.Friends, false)}>
          <View style={styles.itemRow}><Text>Arkadaşlar</Text><Text>›</Text></View>
        </Pressable>

        <Pressable style={styles.item} onPress={() => handleNavigate(Routes.Achievements, false)}>
          <View style={styles.itemRow}><Text>Başarılar</Text><Text>›</Text></View>
        </Pressable>

        <Pressable style={styles.item} onPress={() => handleNavigate(Routes.Premium, false)}>
          <View style={styles.itemRow}><Text>Premium</Text><Text>›</Text></View>
        </Pressable>
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
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
