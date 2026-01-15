import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { useTheme } from "../../ui/theme/ThemeProvider";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";

export const FriendsActivityScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  return (
    <Screen style={styles.container}>
      <View style={styles.center}>
        <View style={[styles.iconWrap, { backgroundColor: "#EEF0F6" }]}>
          <Text style={{ fontSize: 36 }}>👥+</Text>
        </View>
        <Text style={styles.title}>Henüz arkadaşın yok</Text>
        <Text variant="muted" style={{ textAlign: "center", marginTop: 8 }}>
          Arkadaş ekleyerek aktivitelerini ve odak sürelerini paylaşabilirsiniz.
        </Text>

        <Pressable
          style={[styles.cta, { backgroundColor: "#FF8A3D" }]}
          onPress={() => navigation.navigate(Routes.AddFriend as any)}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Arkadaş Ekle ➕</Text>
        </Pressable>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  center: { alignItems: "center", marginTop: 40 },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 18, fontWeight: "700", marginTop: 16 },
  cta: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
});
