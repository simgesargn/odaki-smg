import React from "react";
import { TouchableOpacity, TextStyle, StyleSheet } from "react-native";
import { Text } from "./Text";
import { useTheme } from "../theme/ThemeProvider";

export const Button: React.FC<{
  title: string;
  onPress?: () => void;
  style?: any;
  textStyle?: TextStyle;
}> = ({ title, onPress, style, textStyle }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, { backgroundColor: colors.primary }, style]}>
      <Text variant="body" style={[{ color: "#fff", textAlign: "center" }, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
});
