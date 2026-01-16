import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { useTheme } from "../../ui/theme/ThemeProvider";
import { loadFocusState } from "../../focus/focusStore";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";

type Achievement = {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  progress: number; // 0..1
};

export const AchievementsScreen: React.FC = () => {
  const { colors } = useTheme();
  const [focusState, setFocusState] = useState<any | null>(null);
  const navigation = useNavigation<any>();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const st = await loadFocusState();
        if (!mounted) return;
        setFocusState(st);
      } catch {
        setFocusState(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const totalSeconds = Number(focusState?.stats?.totalSeconds ?? 0);
    const hours = totalSeconds / 3600;
    const streak = Number(focusState?.stats?.streak ?? 0);
    const flowers = Array.isArray(focusState?.flowers) ? focusState.flowers.length : 0;
    const tasks = 0; // placeholder, if you have task count, replace
    const odiChats = 0;
    const profileComplete = 0; // boolean -> 0/1
    return { hours, streak, flowers, tasks, odiChats, profileComplete };
  }, [focusState]);

  const items: Achievement[] = useMemo(() => {
    const m = metrics;
    return [
      { id: "a1", emoji: "🌱", title: "İlk Odak", desc: "İlk başarılı odak oturumunu tamamla", progress: Math.min(1, m.hours > 0 ? 1 : 0) },
      { id: "a2", emoji: "🔥", title: "3 Gün Seri", desc: "3 gün üst üste odak serisi", progress: Math.min(1, m.streak / 3) },
      { id: "a3", emoji: "✅", title: "10 Görev Tamamla", desc: "Toplam 10 görevi tamamla", progress: Math.min(1, m.tasks / 10) },
      { id: "a4", emoji: "⏳", title: "1 Saat Odak", desc: "Toplam 1 saat odakla", progress: Math.min(1, m.hours / 1) },
      { id: "a5", emoji: "👥", title: "İlk Arkadaş", desc: "İlk arkadaş ekle", progress: 0 },
      { id: "a6", emoji: "🌸", title: "3 Çiçek Kazan", desc: "Bahçende 3 çiçek topla", progress: Math.min(1, m.flowers / 3) },
      { id: "a7", emoji: "💬", title: "Odi ile 5 sohbet", desc: "Odi ile 5 defa sohbet et", progress: Math.min(1, m.odiChats / 5) },
      { id: "a8", emoji: "📝", title: "Profilini tamamla", desc: "Profil bilgilerini tamamla", progress: Math.min(1, m.profileComplete) },
    ];
  }, [metrics]);

  const renderItem = ({ item }: { item: Achievement }) => {
    const pct = Math.round(item.progress * 100);
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.row}>
          <Text style={styles.emoji}>{item.emoji}</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontWeight: "800" }}>{item.title}</Text>
            <Text variant="muted" style={{ marginTop: 4 }}>{item.desc}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontWeight: "700" }}>{pct}%</Text>
          </View>
        </View>

        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, pct))}%`, backgroundColor: colors.primary }]} />
        </View>
      </View>
    );
  };

  return (
    <Screen style={{ padding: 16 }}>
      <Text variant="h2">Başarılar</Text>
      <Text variant="muted" style={{ marginTop: 6, marginBottom: 12 }}>
        İlerlemeni burada görebilirsin.
      </Text>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      <View style={{ height: 20 }} />
      <Pressable
        onPress={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate(Routes.Home as any);
        }}
        style={{ alignItems: "center" }}
      >
        <Text variant="muted">Geri</Text>
      </Pressable>
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  row: { flexDirection: "row", alignItems: "center" },
  emoji: { fontSize: 28 },
  progressBg: {
    height: 8,
    backgroundColor: "#EEE",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 10,
  },
  progressFill: {
    height: 8,
    borderRadius: 8,
  },
});
