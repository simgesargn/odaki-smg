import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "../Text";
import { useTheme } from "../../theme/ThemeProvider";

type Props = {
  emoji: string;
  title: string;
  subtitle: string;
};

export default function AuthHero({ emoji, title, subtitle }: Props) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const topMargin = (insets.top || 0) + 24;

  return (
    <SafeAreaView style={{ backgroundColor: theme.colors.background }}>
      <View style={[styles.wrap, { marginTop: topMargin }]}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: theme.colors.surface,
              ...theme.shadow.card,
            },
          ]}
        >
          <Text style={styles.emoji}>{emoji}</Text>
        </View>

        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.muted }]}>{subtitle}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  badge: {
    width: 92,
    height: 92,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emoji: {
    fontSize: 44,
    lineHeight: 48,
  },
  title: {
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: -0.3,
    textAlign: "center",
    marginTop: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
  },
});
