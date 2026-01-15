import React, { useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";
import { auth } from "../../firebase/firebase";
import { getBool } from "../../storage/local";
import { STORAGE_KEYS } from "../../storage/keys";

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const onboarded = await getBool(STORAGE_KEYS.ONBOARDING_DONE, false);
        if (!mounted) return;
        if (!onboarded) {
          // Onboarding tamamlanmamışsa Welcome root'a resetle
          navigation.reset({ index: 0, routes: [{ name: Routes.Welcome as any }] });
          return;
        }

        // Onboarding tamamlandıysa auth durumuna göre root ayarla
        const user = auth.currentUser;
        if (user) {
          navigation.reset({ index: 0, routes: [{ name: Routes.MainTabs as any }] });
        } else {
          navigation.reset({ index: 0, routes: [{ name: Routes.AuthStack as any }] });
        }
      } catch (e) {
        // hata durumunda auth'a göre yönlendir (güvenli fallback)
        const user = auth.currentUser;
        if (user) {
          navigation.reset({ index: 0, routes: [{ name: Routes.MainTabs as any }] });
        } else {
          navigation.reset({ index: 0, routes: [{ name: Routes.AuthStack as any }] });
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
});
