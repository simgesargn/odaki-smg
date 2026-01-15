import React from "react";
import { TextInput, StyleSheet, View } from "react-native";
import { useTheme } from "../theme/ThemeProvider";

export const Input: React.FC<
  React.ComponentProps<typeof TextInput> & { containerStyle?: any }
> = ({ containerStyle, style, ...rest }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.text }, style]} {...rest} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 6 },
  input: {
    padding: 12,
    borderRadius: 10,
    fontSize: 15,
    elevation: 1,
  },
});
