import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../ui/Text";
import { useTheme } from "../ui/ThemeProvider";

export const StatsScreen: React.FC = () => {
  const theme = useTheme();

  // Örnek/placeholder veriler (gerçekten varsa store'dan çekebilirsiniz)
  const totalFocusMinutes = 540;
  const sessionsCompleted = 12;
  const completedTasks = 44;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <View style={{ paddingHorizontal: 16, paddingTop: theme.spacing.md }}>
        <Text variant="h2">İstatistikler</Text>
      </View>

      <View
        style={[
          styles.row,
          {
            paddingHorizontal: 16,
            marginTop: 12,
            gap: 12, // RN 0.81+ destekliyorsa çalışır; yoksa marginRight set edilir per-card
          },
        ]}
      >
        {[
          {
            key: "focus",
            label: "Toplam Odak",
            value: `${totalFocusMinutes} dk`,
          },
          {
            key: "sessions",
            label: "Tamamlanan Oturum",
            value: `${sessionsCompleted}`,
          },
          {
            key: "tasks",
            label: "Tamamlanan Görev",
            value: `${completedTasks}`,
          },
        ].map((c, idx) => (
          <View
            key={c.key}
            style={[
              styles.cardWrapper,
              { marginRight: idx < 2 ? 12 : 0 }, // gap desteklenmiyorsa bu çalışır
            ]}
          >
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  borderRadius: theme.radius.md,
                  padding: theme.spacing.md,
                },
              ]}
            >
              <Text numberOfLines={1} style={{ fontSize: 13, color: theme.subtext }}>
                {c.label}
              </Text>
              <Text numberOfLines={1} style={{ fontSize: 20, fontWeight: "800", marginTop: 8, textAlign: "center", color: theme.text }}>
                {c.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default StatsScreen;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  row: { flexDirection: "row", width: "100%" },
  cardWrapper: { flex: 1, minWidth: 0 }, // minWidth:0 önemli — iOS'ta taşmayı önler
  card: { alignItems: "center", justifyContent: "center", borderWidth: 1 },
});
