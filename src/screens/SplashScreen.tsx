import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ActivityIndicator, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../ui/theme";

const colors = theme.colors;
const spacing = theme.spacing;
const radii = (theme as any).radius ?? (theme as any).radii ?? { md: 12 };

export const SplashScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg ?? colors.background, paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.primary + "22", colors.primary2 + "14"]}
          style={styles.blob}
          start={[0.2, 0]}
          end={[1, 1]}
        />

        <View style={[styles.logoWrap, styles.shadow]}>
          <Text style={[styles.logo, { color: colors.primary }]}>ODAKI</Text>
        </View>

        <Text style={[styles.subtitle, { color: colors.muted }]}>ODAKI'ye hoş geldin</Text>

        <View style={[styles.loadingCard, styles.shadow]}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Yükleniyor…</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  blob: {
    position: "absolute",
    top: Platform.OS === "ios" ? -30 : -20,
    left: -40,
    width: 340,
    height: 260,
    borderRadius: 180,
    zIndex: -1,
    opacity: 1,
  },
  logoWrap: {
    width: 200,
    minHeight: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logo: { fontSize: 40, fontWeight: "900", letterSpacing: 2 },
  subtitle: { marginTop: 6, fontSize: 14, textAlign: "center" },
  loadingCard: {
    marginTop: 22,
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: colors.card,
    borderRadius: radii.md ?? 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadingText: { marginLeft: 10, color: colors.muted },
  shadow: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: {
      elevation: 4,
    },
  }),
});
