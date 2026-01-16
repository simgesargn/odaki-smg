import React from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import { theme, colors } from "../theme";

type Props = React.PropsWithChildren<ViewProps & { header?: React.ReactNode; accent?: string }>;

export const Card: React.FC<Props> = ({ children, header, accent, style, ...rest }) => {
  return (
    <View style={[styles.row, style]}>
      {accent ? <View style={[styles.accent, { backgroundColor: accent }]} /> : null}
      <View style={styles.card} {...rest}>
        {header ? <View style={styles.header}>{header}</View> : null}
        {children}
      </View>
    </View>
  );
};

export default Card;

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "stretch" },
  accent: { width: 6, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadow.card,
  },
  header: { marginBottom: 8 },
});
