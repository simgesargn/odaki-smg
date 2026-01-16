import React from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import theme from "./theme";

type Props = React.PropsWithChildren<ViewProps & { header?: React.ReactNode }>;

export const Card: React.FC<Props> = ({ children, style, header, ...rest }) => {
  return (
    <View style={[styles.card, style]} {...rest}>
      {header ? <View style={styles.header}>{header}</View> : null}
      <View>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  header: { marginBottom: 8 },
});
