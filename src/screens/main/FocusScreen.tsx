import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, ScrollView, Pressable, Alert } from "react-native";
import { Text } from "../../ui/Text";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Routes } from "../../navigation/routes";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../ui/theme"; // relative import — alias kaldırıldı
import {
  loadFocusState,
  setSelectedMinutes,
  startSession,
  tickSession,
  completeSession,
  addWarningOrFail,
  type FlowerType,
} from "../../focus/focusStore";
import { demoFlowers } from "../../data/mockData";
import { EmptyStateCard } from "../../ui/components/EmptyStateCard";
import { useTheme } from "../../ui/ThemeProvider";

const pad2 = (n: number) => String(n).padStart(2, "0");
const formatMMSS = (sec: number) => `${pad2(Math.floor(sec / 60))}:${pad2(sec % 60)}`;

export const FocusScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<any>(null);

  const intervalRef = useRef<any>(null);

  const selected = state?.selectedMinutes ?? 25;
  const running = Boolean(state?.session?.running);
  const remainingSec = state?.session?.remainingSec ?? selected * 60;

  const totalSeconds = (state?.stats?.totalSeconds ?? 0) as number;
  const streak = (state?.stats?.streak ?? 0) as number;
  const flowersEarned = (state?.stats?.flowersEarned ?? 0) as number;

  const totalHoursText = useMemo(() => {
    const hours = totalSeconds / 3600;
    return `${hours.toFixed(1)} saat`;
  }, [totalSeconds]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const st = await loadFocusState();
      if (!mounted) return;
      setState(st);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(async () => {
      const st = await tickSession(Date.now());
      setState(st);
    }, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [running]);

  const pick = async (m: number) => {
    const st = await setSelectedMinutes(m);
    setState(st);
  };

  const onStart = async () => {
    const st = await startSession();
    setState(st);
  };

  const onTestFinish = async () => {
    const st = await completeSession("tohum");
    setState(st);
    Alert.alert("Tebrikler!", "1 çiçek kazandın 🌱");
  };

  const startDisabled = loading || running;

  const emojiFor = (type: FlowerType | string) =>
    type === "tohum" ? "🌱" : type === "lotus" ? "🪷" : type === "aycicegi" ? "🌻" : "🌸";

  const premiumFlowers = [
    { id: "p1", name: "Altın Gül", icon: "🌹" },
    { id: "p2", name: "Kristal Lale", icon: "🌷" },
    { id: "p3", name: "Neon Orkide", icon: "🌺" },
    { id: "p4", name: "Ay Çiçeği", icon: "🌻" },
    { id: "p5", name: "Safir Menekşe", icon: "💠" },
    { id: "p6", name: "Ateş Sümbülü", icon: "🔥" },
    { id: "p7", name: "Zümrüt Kaktüs", icon: "🌵" },
    { id: "p8", name: "Kristal Zambak", icon: "🌸" },
    { id: "p9", name: "Ay Kristali", icon: "🌓" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
        {/* header spacing */}
        <View style={{ height: insets.top || 12 }} />

        {/* Header actions row */}
        <View style={{ paddingHorizontal: 16, marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text variant="h2">Odak</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Pressable
              onPress={() => nav.navigate(Routes.Garden as any)}
              style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: "rgba(120,120,255,0.08)", marginRight: 8 }}
            >
              <Text>🌿 Bahçem</Text>
            </Pressable>
            <Pressable onPress={() => nav.navigate(Routes.FocusSettings as any)} style={{ padding: 8 }}>
              <Text style={{ fontSize: 18 }}>⚙️</Text>
            </Pressable>
          </View>
        </View>

        {/* Centered timer + controls */}
        <View style={{ paddingHorizontal: 16 }}>
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <View style={{ width: "100%", maxWidth: 480, alignItems: "center" }}>
              <Text style={{ fontSize: 18, fontWeight: "800", marginBottom: 6 }}>Tohum</Text>
              <Text variant="muted">Hedef: {selected} dk</Text>
              <Text style={{ fontSize: 56, fontWeight: "900", marginVertical: 16 }}>{formatMMSS(remainingSec)}</Text>
              <View style={{ flexDirection: "row", width: "100%", justifyContent: "center", gap: 12 }}>
                <Pressable onPress={onStart} disabled={startDisabled} style={{ paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, backgroundColor: startDisabled ? "#ccc" : theme.colors.primary }}>
                  <Text style={{ color: "#fff", fontWeight: "700" }}>{running ? "Odaklan..." : "Başlat"}</Text>
                </Pressable>
                <Pressable onPress={onTestFinish} style={{ paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: "#eee" }}>
                  <Text>Bitir</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Minutes selector */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 14 }}>
            {[15, 25, 45, 60].map((m) => {
              const active = m === selected;
              return (
                <Pressable
                  key={m}
                  onPress={() => pick(m)}
                  disabled={running}
                  style={{
                    flex: 1,
                    marginHorizontal: 6,
                    paddingVertical: 12,
                    borderRadius: 999,
                    alignItems: "center",
                    backgroundColor: active ? theme.colors.primary : "rgba(0,0,0,0.04)",
                    opacity: running ? 0.6 : 1,
                  }}
                >
                  <Text style={{ color: active ? "#fff" : "#111", fontWeight: "700" }}>{m} dk</Text>
                </Pressable>
              );
            })}
          </View>

          {/* small collection + stats kept but simplified layout (demo fallback) */}
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontWeight: "700", marginBottom: 8 }}>Çiçek Koleksiyonum</Text>
            <View style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#eee", backgroundColor: "#fff" }}>
              {(!state?.flowers || state.flowers.length === 0) ? (
                <EmptyStateCard
                  title="Henüz çiçeğin yok"
                  subtitle="Odak oturumlarını tamamladıkça çiçek kazanacaksın. Hemen başla!"
                  cta={{ label: "Başlat", onPress: () => nav.navigate(Routes.Focus as any) }}
                />
              ) : (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                  {(state.flowers || demoFlowers).slice(0, 12).map((f: any, idx: number) => (
                    <View key={`${f?.id ?? idx}`} style={{ width: 52, height: 52, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.03)", margin: 4 }}>
                      <Text style={{ fontSize: 24 }}>{f.emoji ?? (f.type === "lotus" ? "🪷" : "🌱")}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Premium Çiçekler */}
          <View style={{ marginTop: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ fontWeight: "700" }}>Premium Çiçekler</Text>
              <Pressable onPress={() => nav.navigate(Routes.Premium as any)} style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: theme.colors.primary, borderRadius: 999 }}>
                <Text style={{ color: "#fff" }}>Premium'a Geç</Text>
              </Pressable>
            </View>

            <View style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#eee", backgroundColor: "#fff" }}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {premiumFlowers.slice(0, 12).map((p, idx) => (
                  <View key={p.id} style={{ width: 52, height: 52, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.03)", margin: 4, position: "relative" }}>
                    <Text style={{ fontSize: 24, opacity: 0.35 }}>{p.icon}</Text>
                    <Text style={{ position: "absolute", right: 4, bottom: 2, fontSize: 12, opacity: 0.9 }}>🔒</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
