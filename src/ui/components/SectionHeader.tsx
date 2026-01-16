import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { theme, colors } from "../theme";

export const SectionHeader: React.FC<{ title: string; actionLabel?: string; onAction?: () => void }> = ({ title, actionLabel, onAction }) => (
  <View style={styles.row}>
    <Text style={styles.title}>{title}</Text>
    {actionLabel ? (
      <Pressable onPress={onAction}>
        <Text style={styles.action}>{actionLabel}</Text>
      </Pressable>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.sm },
  title: { fontSize: 16, fontWeight: "800", color: colors.text },
  action: { color: colors.primary, fontWeight: "700" },
});
