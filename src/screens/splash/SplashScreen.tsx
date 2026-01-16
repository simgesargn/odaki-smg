import React, { useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { getBool, STORAGE_KEYS } from "../../storage/local";
import { Routes } from "../../navigation/routes";

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    let mounted = true;
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved && mounted) {
        // fallback: go to Login
        navigation.reset({ index: 0, routes: [{ name: Routes.Login as any }] });
        resolved = true;
      }
    }, 2000);

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;
      try {
        const done = await getBool(STORAGE_KEYS.ONBOARDING_DONE, false);
        if (!mounted) return;

        if (!done) {
          navigation.reset({ index: 0, routes: [{ name: Routes.Onboarding as any }] });
        } else if (user) {
          navigation.reset({ index: 0, routes: [{ name: Routes.RootTabs as any }] });
        } else {
          navigation.reset({ index: 0, routes: [{ name: Routes.Login as any }] });
        }
      } catch {
        if (!mounted) return;
        navigation.reset({ index: 0, routes: [{ name: Routes.Login as any }] });
      } finally {
        resolved = true;
        clearTimeout(timeout);
      }
    });

    return () => {
      mounted = false;
      try {
        unsub();
      } catch {
        // ignore
      }
      clearTimeout(timeout);
    };
  }, [navigation]);

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
