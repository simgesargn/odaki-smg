import React, { useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../navigation/routes";
import { theme } from "../ui/theme";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    key: "odi",
    emoji: "🤖",
    title: "Yapay Zeka Asistanı Odi",
    subtitle: "AI ile görevlerini netleştir.",
  },
  {
    key: "reminders",
    emoji: "⏰",
    title: "Akıllı Hatırlatıcılar",
    subtitle: "Zamanı kaçırma, Odi hatırlatsın.",
  },
  {
    key: "calendar",
    emoji: "📅",
    title: "Takvimini Planla",
    subtitle: "Planını tek ekranda gör.",
  },
  {
    key: "tasks",
    emoji: "✅",
    title: "Görevlerini Organize Et",
    subtitle: "Görevlerini hızlıca oluştur ve takip et.",
  },
  {
    key: "focus",
    emoji: "🎯",
    title: "Odaklan, Planla, Büyüt.",
    subtitle: "Gününü küçük adımlarla yönet.",
  },
];

export const OnboardingScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const ref = useRef<FlatList<any>>(null);
  const [index, setIndex] = useState(0);

  const bottomPad = (insets.bottom || 0) + 18;

  const goNext = () => {
    if (index >= slides.length - 1) {
      nav.replace(Routes.Welcome as any);
      return;
    }
    const nextIndex = index + 1;
    ref.current?.scrollToIndex({ index: nextIndex });
    setIndex(nextIndex);
  };

  const onScrollEnd = (e: any) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(newIndex);
  };

  const buttonLabel = index === 0 ? "Başla" : index === slides.length - 1 ? "Devam" : "Devam";

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.bg }]}>
      <FlatList
        ref={ref}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(s) => s.key}
        onMomentumScrollEnd={onScrollEnd}
        renderItem={({ item }) => (
          <View style={[styles.page, { width }]}>
            <View style={styles.illustrationArea}>
              <LinearGradient
                colors={[theme.colors.primary + "20", theme.colors.primary2 + "10"]}
                style={styles.blob}
                start={[0, 0]}
                end={[1, 1]}
              />
              <View style={[styles.emojiWrap, styles.shadow]}>
                <Text style={styles.emoji}>{item.emoji}</Text>
              </View>
            </View>

            <View style={styles.textArea}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      <View style={[styles.footer, { paddingBottom: bottomPad }]}>
        <View style={styles.dotsRow}>
          <View style={styles.dotsLeft}>
            {slides.map((_, i) => (
              <View key={i} style={[styles.dotBase, i === index ? styles.dotActive : styles.dotInactive]} />
            ))}
          </View>
        </View>

        <Pressable onPress={goNext} style={[styles.cta, styles.shadow]}>
          <Text style={styles.ctaText}>{buttonLabel}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  page: {
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 24 : 20,
  },

  illustrationArea: {
    width: "100%",
    height: height * 0.6,
    alignItems: "center",
    justifyContent: "center",
  },
  blob: {
    position: "absolute",
    width: width * 0.8,
    height: height * 0.45,
    borderRadius: 300,
    top: -height * 0.05,
    left: (width * 0.2) / 2,
    zIndex: -1,
  },
  emojiWrap: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: theme.colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emoji: { fontSize: 72 },

  textArea: {
    width: "100%",
    alignItems: "center",
    marginTop: -20,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: theme.colors.text,
    textAlign: "center",
    paddingHorizontal: 12,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.8,
    textAlign: "center",
    paddingHorizontal: 16,
  },

  footer: {
    width: "100%",
    paddingHorizontal: 24,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 12,
    height: 28,
  },
  dotsLeft: { flexDirection: "row", alignItems: "center" },

  dotBase: {
    height: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  dotInactive: {
    width: 8,
    backgroundColor: theme.colors.border,
    opacity: 0.8,
  },
  dotActive: {
    width: 26,
    backgroundColor: theme.colors.primary,
    opacity: 1,
  },

  cta: {
    width: "100%",
    height: 56,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },

  shadow: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: { elevation: 4 },
  }),
});
