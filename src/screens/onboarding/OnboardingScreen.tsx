import React, { useRef, useState } from "react";
import { View, StyleSheet, FlatList, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { Button } from "../../ui/Button";
import { setBool } from "../../storage/local";
import { STORAGE_KEYS } from "../../storage/keys";

const SLIDES = [
  { title: "Odaklan, Planla, Büyüt." },
  { title: "Görevlerini Organize Et" },
  { title: "Takvimini Planla" },
  { title: "Akıllı Hatırlatıcılar" },
  { title: "Yapay Zeka Asistanı Odi" },
];

const { width } = Dimensions.get("window");

export const OnboardingScreen: React.FC = () => {
  const ref = useRef<FlatList<any>>(null);
  const [index, setIndex] = useState(0);

  const onNext = async () => {
    if (index < SLIDES.length - 1) {
      const next = index + 1;
      setIndex(next);
      ref.current?.scrollToOffset({ offset: next * width, animated: true });
    } else {
      try {
        await setBool(STORAGE_KEYS.ONBOARDING_DONE, true);
      } catch {
        // ignore
      }
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const ix = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(ix);
  };

  return (
    <Screen style={{ padding: 0 }}>
      <FlatList
        ref={ref}
        data={SLIDES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        onScroll={onScroll}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.page, { width }]}>
            <Text variant="h1">{item.title}</Text>
          </View>
        )}
      />
      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, { opacity: i === index ? 1 : 0.3, width: i === index ? 20 : 8 }]} />
          ))}
        </View>
        <Button title={index === SLIDES.length - 1 ? "Başla" : "Devam"} onPress={onNext} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  page: { padding: 24, justifyContent: "center", alignItems: "flex-start", flex: 1 },
  footer: { padding: 16 },
  dots: { flexDirection: "row", marginBottom: 12 },
  dot: { height: 8, borderRadius: 8, backgroundColor: "#6C5CE7", marginRight: 8 },
});
