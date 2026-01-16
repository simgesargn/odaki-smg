import React from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { Text } from "../Text";

export const ListItem: React.FC<{ title: string; subtitle?: string; onPress?: () => void; right?: React.ReactNode }> = ({ title, subtitle, onPress, right }) => (
  <Pressable onPress={onPress} style={s.item}>
    <View style={{ flex: 1 }}>
      <Text style={s.title}>{title}</Text>
      {subtitle ? <Text variant="muted">{subtitle}</Text> : null}
    </View>
    <View>{right}</View>
  </Pressable>
);

const s = StyleSheet.create({
  item: { paddingVertical: 12, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.03)" },
  title: { fontWeight: "700", marginBottom: 2 },
});
