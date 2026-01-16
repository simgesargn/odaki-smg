import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";
import { theme } from "../../ui/theme";
import { demoUserStats } from "../../data/mockData";
import { ListItem } from "../../ui/components/ListItem";

export const MenuScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleNavigate = (route: string, isTab?: boolean) => {
    try {
      if (isTab) navigation.navigate(Routes.RootTabs as any, { screen: route } as any);
      else navigation.navigate(route as any);
    } catch {
      // ignore
    }
  };

  return (
    <Screen style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.inner}>
        <Text variant="h1" style={styles.title}>Menü</Text>

        <View style={styles.quick}>
          <Text style={{ fontWeight: "700" }}>Bugün: {demoUserStats.totalFocusMinutes} dk • {demoUserStats.completedTasks} görev</Text>
        </View>

        <View style={styles.card}>
          <ListItem title="Bildirimler" subtitle="Hızlı bildirim ayarları" onPress={() => handleNavigate(Routes.Notifications, false)} right={<Text>›</Text>} />
          <ListItem title="Ayarlar" subtitle="Hesap ve uygulama ayarları" onPress={() => handleNavigate(Routes.Settings, false)} right={<Text>›</Text>} />
          <ListItem title="Bahçe" subtitle="Kazandığın çiçekler" onPress={() => handleNavigate(Routes.Garden, false)} right={<Text>›</Text>} />
          <ListItem title="Arkadaşlar" subtitle="Arkadaş listesi ve aktiviteler" onPress={() => handleNavigate(Routes.Friends, false)} right={<Text>›</Text>} />
          <ListItem title="Başarılar" subtitle="Elde ettiğin ödüller" onPress={() => handleNavigate(Routes.Achievements, false)} right={<Text>›</Text>} />
          <ListItem title="Premium" subtitle="Özel özellikler" onPress={() => handleNavigate(Routes.Premium, false)} right={<Text>›</Text>} />
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: 16 },
  title: { marginBottom: 12 },
  quick: { marginBottom: 12, padding: 8, backgroundColor: theme.colors.card, borderRadius: 8 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 8, borderWidth: 1, borderColor: "rgba(0,0,0,0.04)" },
  item: { paddingVertical: 14, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.03)" },
  itemTitle: { fontWeight: "700", marginBottom: 4 },
});
