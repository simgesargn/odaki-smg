import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text as RNText, Pressable, StyleSheet } from "react-native";
import { theme } from "./theme";
const colors = theme.colors;

export const useThemeSafe = () => theme;

export const Box = (props: any) => <View {...props} />;
export const P = (props: any) => <RNText {...props} />;

type ScreenProps = { children: React.ReactNode; style?: any };
export function Screen({ children, style }: ScreenProps) {
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.lg }, style]}>
      {children}
    </SafeAreaView>
  );
}

type CardProps = { children: React.ReactNode; style?: any };
export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type ChipProps = { label: string; active?: boolean; onPress?: () => void; style?: any };
export function Chip({ label, active, onPress, style }: ChipProps) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active ? styles.chipActive : styles.chipIdle, style]}>
      <RNText style={active ? styles.chipTextActive : styles.chipText}>{label}</RNText>
    </Pressable>
  );
}

type IconButtonProps = { icon: React.ReactNode; onPress?: () => void; badge?: boolean; style?: any };
export function IconButton({ icon, onPress, badge, style }: IconButtonProps) {
  return (
    <Pressable onPress={onPress} style={[styles.iconBtn, style]}>
      {icon}
      {badge ? <View style={styles.badge} /> : null}
    </Pressable>
  );
}

type StatCardProps = { title: string; value: string | number; style?: any };
export function StatCard({ title, value, style }: StatCardProps) {
  return (
    <View style={[styles.statCard, style]}>
      <RNText style={styles.statValue}>{value}</RNText>
      <RNText style={styles.statTitle}>{title}</RNText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    ...theme.shadow.card,
  },
  chip: {
    borderRadius: theme.radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  chipActive: {
    backgroundColor: theme.colors.primarySoft,
  },
  chipIdle: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: "#eee",
  },
  chipText: {
    color: theme.colors.muted,
    fontSize: 14,
  },
  chipTextActive: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.danger,
  },
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow.card,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
  },
  statTitle: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: 4,
  },
});
