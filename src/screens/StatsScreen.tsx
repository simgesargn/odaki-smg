import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../../ui/ThemeProvider";

export const StatsScreen: React.FC = () => {
  const theme = useTheme();

  return (
    <View>
      {/* === Düzeltilmiş: 3 kartlık satır === */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: theme.spacing.lg,
          gap: 12,
          marginTop: theme.spacing.md,
        }}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{
            backgroundColor: theme.card,
            borderRadius: theme.radius.md,
            padding: theme.spacing.md,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: theme.border,
          }}>
            <Text numberOfLines={1} style={{ fontSize: 14, color: theme.text }}>Toplam Odak</Text>
            <Text style={{ fontSize: 20, fontWeight: "800", marginTop: 8 }}> { /* value */ } {totalHoursText}</Text>
          </View>
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{
            backgroundColor: theme.card,
            borderRadius: theme.radius.md,
            padding: theme.spacing.md,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: theme.border,
          }}>
            <Text numberOfLines={1} style={{ fontSize: 14, color: theme.text }}>Tamamlanan Oturum</Text>
            <Text style={{ fontSize: 20, fontWeight: "800", marginTop: 8 }}>{/* value */}{state?.stats?.sessionsCompleted ?? 0}</Text>
          </View>
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{
            backgroundColor: theme.card,
            borderRadius: theme.radius.md,
            padding: theme.spacing.md,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: theme.border,
          }}>
            <Text numberOfLines={1} style={{ fontSize: 14, color: theme.text }}>Tamamlanan Görev</Text>
            <Text style={{ fontSize: 20, fontWeight: "800", marginTop: 8 }}>{/* value */}{demoUserStats.completedTasks ?? 0}</Text>
          </View>
        </View>
      </View>
      {/* === end 3-card row === */}
    </View>
  );
};
