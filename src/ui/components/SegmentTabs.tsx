import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import theme from "../theme";

type Props = {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  style?: any;
};

export const SegmentTabs: React.FC<Props> = ({ options, value, onChange, style }) => {
  return (
    <View style={[styles.row, style]}>
      {options.map((o) => {
        const active = o === value;
        return (
          <Pressable key={o} onPress={() => onChange(o)} style={[styles.chip, active ? styles.active : styles.inactive]}>
            <Text style={active ? styles.activeText : styles.inactiveText}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  active: {
    backgroundColor: theme.colors.primary2,
    borderColor: theme.colors.primary2,
  },
  inactive: {
    backgroundColor: "transparent",
    borderColor: theme.colors.border,
  },
  activeText: { color: "#fff", fontWeight: "700" },
  inactiveText: { color: theme.colors.text, fontWeight: "600" },
});
