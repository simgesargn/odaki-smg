import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, ScrollView, Pressable, Alert } from "react-native";
import { Text } from "../../ui/Text";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Routes } from "../../navigation/routes";
import { useNavigation } from "@react-navigation/native";
import {
  loadFocusState,
  setSelectedMinutes,
  startSession,
  tickSession,
  completeSession,
  addWarningOrFail,
  type FlowerType,
} from "../../focus/focusStore";

const pad2 = (n: number) => String(n).padStart(2, "0");
const formatMMSS = (sec: number) => `${pad2(Math.floor(sec / 60))}:${pad2(sec % 60)}`;

export const FocusScreen: React.FC = () => {
  const nav = useNavigation<any>();

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

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
      {/* Header actions */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Text variant="h2">Odak</Text>

        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <Pressable
            onPress={() => nav.navigate(Routes.Garden as any)}
            style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: "rgba(120,120,255,0.12)" }}
          >
            <Text>🌿 Bahçem</Text>
          </Pressable>

          <Pressable onPress={() => nav.navigate(Routes.FocusSettings)} style={{ padding: 8 }}>
            <Text style={{ fontSize: 18 }}>⚙️</Text>
          </Pressable>
        </View>
      </View>

      {/* Stats */}
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
        <Card style={{ flex: 1, padding: 12, alignItems: "center" }}>
          <Text variant="muted">Toplam</Text>
          <Text style={{ fontWeight: "700" }}>{totalHoursText}</Text>
        </Card>
        <Card style={{ flex: 1, padding: 12, alignItems: "center" }}>
          <Text variant="muted">Seri</Text>
          <Text style={{ fontWeight: "700" }}>{streak}</Text>
        </Card>
        <Card style={{ flex: 1, padding: 12, alignItems: "center" }}>
          <Text variant="muted">Çiçek</Text>
          <Text style={{ fontWeight: "700" }}>{flowersEarned}</Text>
        </Card>
      </View>

      {/* Garden quick card */}
      <Card style={{ padding: 14, marginBottom: 14 }}>
        <Text style={{ fontWeight: "700", marginBottom: 6 }}>Bahçem</Text>
        <Text variant="muted" style={{ marginBottom: 10 }}>
          Bahçeni ziyaret et ve ödüllerini gör.
        </Text>
        <Button title="Bahçeye Git" onPress={() => nav.navigate(Routes.Garden as any)} />
      </Card>

      {/* Premium flowers (dummy) */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <Text style={{ fontWeight: "700" }}>Premium Çiçekler</Text>
        <Pressable
          onPress={() => nav.navigate(Routes.Premium as any)}
          style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: "#E5D7FF", backgroundColor: "rgba(110,90,255,0.08)" }}
        >
          <Text style={{ fontWeight: "700", color: "#6E5AFF" }}>Premium'a Geç</Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
        {[
          { id: "p1", icon: "🪷", label: "Lotus" },
          { id: "p2", icon: "🌻", label: "Ayçiçeği" },
          { id: "p3", icon: "🪻", label: "Orkide" },
        ].map((p) => (
          <Pressable
            key={p.id}
            onPress={() => Alert.alert("Premium", "Premium'a geçme akışı demo amaçlıdır.")}
            style={{
              flex: 1,
              marginHorizontal: 6,
              borderRadius: 12,
              padding: 12,
              alignItems: "center",
              backgroundColor: "#fff",
              opacity: 0.6,
            }}
          >
            <Text style={{ fontSize: 24 }}>{p.icon}</Text>
            <Text variant="muted" style={{ marginTop: 8 }}>{p.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Session card */}
      <Card style={{ padding: 16, marginBottom: 12, alignItems: "center" }}>
        <Text style={{ fontSize: 18, fontWeight: "800", marginBottom: 6 }}>Tohum</Text>
        <Text variant="muted" style={{ marginBottom: 10 }}>
          Hedef: {selected} dk
        </Text>

        <Text style={{ fontSize: 40, fontWeight: "900", marginBottom: 12 }}>
          {formatMMSS(remainingSec)}
        </Text>

        <Button title={running ? "Odaklan..." : "Çiçeği Büyütmeye Başla"} onPress={onStart} disabled={startDisabled} />

        <Pressable onPress={onTestFinish} style={{ marginTop: 10, padding: 8 }}>
          <Text variant="muted">Bitir</Text>
        </Pressable>
        {/* Premium feature hint: setting-skip */}
        <View style={{ height: 8 }} />
        <Pressable onPress={() => nav.navigate(Routes.Premium as any)} style={{ padding: 6 }}>
          <Text variant="muted">Ayar atlama hakkı: Premium</Text>
        </Pressable>
      </Card>

      {/* Minutes */}
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
        {[15, 25, 45, 60].map((m) => {
          const active = m === selected;
          return (
            <Pressable
              key={m}
              onPress={() => pick(m)}
              disabled={running}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 999,
                alignItems: "center",
                backgroundColor: active ? "rgba(110, 90, 255, 0.9)" : "rgba(0,0,0,0.04)",
                opacity: running ? 0.6 : 1,
              }}
            >
              <Text style={{ color: active ? "white" : "black", fontWeight: "700" }}>{m} dk</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Collection (simple) */}
      <Text style={{ fontWeight: "700", marginBottom: 8 }}>Çiçek Koleksiyonum</Text>
      <Card style={{ padding: 12 }}>
        {(!state?.flowers || state.flowers.length === 0) ? (
          <Text variant="muted">Henüz çiçeğin yok. Odak oturumunu tamamlayınca burada görünecek.</Text>
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {state.flowers.slice(0, 12).map((f: any, idx: number) => (
              <View
                key={`${f?.id ?? f?.type ?? f?.name ?? "flower"}-${idx}`}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(0,0,0,0.05)",
                }}
              >
                <Text>{f.type === "tohum" ? "🌱" : f.type === "lotus" ? "🪷" : f.type === "aycicegi" ? "🌻" : "🌸"}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>
    </ScrollView>
  );
};
