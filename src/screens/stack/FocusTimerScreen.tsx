import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { loadFocusState, pickRandomFlowerId, saveFocusState } from "../../focus/focusStore";

type Params = { minutes: number };

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export const FocusTimerScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const minutes: number = (route.params as Params)?.minutes ?? 25;

  const total = useMemo(() => Math.max(1, minutes) * 60, [minutes]);
  const [remaining, setRemaining] = useState<number>(total);
  const [running, setRunning] = useState<boolean>(false);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRemaining(total);
    setRunning(false);
  }, [total]);

  useEffect(() => {
    if (!running) {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return;
    }

    tickRef.current = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);

    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [running]);

  useEffect(() => {
    if (running && remaining === 0) {
      setRunning(false);
      (async () => {
        try {
          const state = await loadFocusState();
          const flower = pickRandomFlowerId();
          const next = {
            ...state,
            totalSeconds: state.totalSeconds + total,
            streak: state.streak + 1,
            flowers: [...state.flowers, flower],
          };
          await saveFocusState(next);
          Alert.alert("Tebrikler 🎉", "Oturumu tamamladın! Yeni bir çiçek kazandın.");
        } catch (e) {
          Alert.alert("Hata", "Oturum tamamlanırken hata oluştu.");
        } finally {
          nav.goBack();
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, remaining]);

  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;

  return (
    <View style={styles.container}>
      <Text style={styles.big}>{pad(mm)}:{pad(ss)}</Text>
      <Text style={styles.sub}>Hazır olduğunda başlat</Text>

      <View style={styles.row}>
        <Pressable
          style={[styles.btn, styles.primary]}
          onPress={() => setRunning((v) => !v)}
        >
          <Text style={styles.btnText}>{running ? "Duraklat" : "Başlat"}</Text>
        </Pressable>

        <Pressable
          style={[styles.btn, styles.secondary]}
          onPress={() => {
            setRunning(false);
            setRemaining(total);
          }}
        >
          <Text style={styles.btnText2}>Sıfırla</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  big: { fontSize: 64, fontWeight: "800" },
  sub: { marginTop: 8, color: "#666" },
  row: { flexDirection: "row", gap: 12, marginTop: 24 },
  btn: { width: 150, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  primary: { backgroundColor: "#6C63FF" },
  secondary: { backgroundColor: "#EEE" },
  btnText: { color: "#FFF", fontWeight: "700" },
  btnText2: { color: "#222", fontWeight: "700" },
});
