import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, theme } from "../theme";

type Props = { title: string; subtitle?: string; left?: React.ReactNode; onPress?: () => void; chevron?: boolean };

export const ListRow: React.FC<Props> = ({ title, subtitle, left, onPress, chevron = true }) => {
  const Container: any = onPress ? Pressable : View;
  return (
    <Container onPress={onPress} style={styles.row}>
      <View style={styles.left}>{left ?? null}</View>
      <View style={styles.mid}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.right}>{chevron ? <Text style={styles.chev}>›</Text> : null}</View>
    </Container>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 8, backgroundColor: colors.card, borderRadius: 12, marginBottom: theme.spacing.sm },
  left: { width: 44, alignItems: "center" },
  mid: { flex: 1 },
  right: { width: 36, alignItems: "center" },
  title: { fontWeight: "700", color: colors.text },
  subtitle: { color: colors.muted, marginTop: 4, fontSize: 12 },
  chev: { color: colors.muted, fontSize: 20 },
});
