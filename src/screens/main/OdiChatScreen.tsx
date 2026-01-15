import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  Pressable,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Text } from "../../ui/Text";
import { auth, db } from "../../firebase/firebase";
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  getDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";

export const OdiChatScreen: React.FC = () => {
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid || null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loadingSend, setLoadingSend] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList<any> | null>(null);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((u) => setUid(u?.uid || null));
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!uid) {
      setMessages([]);
      return;
    }
    setError(null);
    const docRef = doc(db, "aiChats", uid);
    const unsub = onSnapshot(
      docRef,
      (snap) => {
        if (!snap.exists()) {
          setMessages([]);
          return;
        }
        const data = snap.data() as any;
        const arr = Array.isArray(data.messages) ? data.messages.map((m: any) => {
          // createdAt might be a number (Date.now()) or a Firestore Timestamp
          const created =
            typeof m.createdAt === "number"
              ? new Date(m.createdAt)
              : m?.createdAt && typeof m.createdAt.toDate === "function"
              ? m.createdAt.toDate()
              : m?.createdAt
              ? new Date(m.createdAt)
              : null;
          return { ...m, createdAt: created };
        }) : [];
        setMessages(arr);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
      },
      (e) => {
        setError("Mesaj okuma hatası: " + (e?.message || e?.code || "bilinmeyen"));
      }
    );
    return () => unsub();
  }, [uid]);

  // AI çağrısı yapacak yardımcı fonksiyon (timeout ve log)
  const callAi = async (userText: string): Promise<string> => {
    const apiUrl = process.env.EXPO_PUBLIC_ODI_AI_URL || process.env.ODI_AI_URL || "";
    const apiKey = process.env.EXPO_PUBLIC_ODI_AI_KEY || process.env.ODI_AI_KEY || "";
    const funcName = process.env.EXPO_PUBLIC_ODI_AI_FN || process.env.ODI_AI_FN || "";
    console.log("[ODI] AI config", { apiUrl, apiKey: apiKey ? "***" : "", funcName });

    if (!apiUrl) {
      console.log("[ODI] AI call skipped - no apiUrl configured");
      throw new Error("No AI endpoint configured");
    }

    console.log("[ODI] AI call start");
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 3000);

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({ text: userText, function: funcName }),
      });
      clearTimeout(timeout);
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`AI error ${res.status}: ${t}`);
      }
      const data = await res.json();
      // try common response shapes
      const responseText = data?.text || data?.reply || data?.message || (typeof data === "string" ? data : "");
      console.log("[ODI] AI call success", (responseText || "").slice(0, 80));
      return responseText || "";
    } catch (e: any) {
      clearTimeout(timeout);
      console.log("[ODI] AI call error", e?.message || e);
      throw e;
    }
  };

  const sendMessage = async () => {
    if (!uid) {
      setError("Giriş gerekli.");
      return;
    }
    const text = input.trim();
    if (!text) return;
    setError(null);
    setLoadingSend(true);
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    // createdAt MUST be a number (Date.now()) for arrayUnion
    const userMsg = { id, role: "user", text, createdAt: Date.now() };
    // optimistic UI
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const docRef = doc(db, "aiChats", uid);
    try {
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        await setDoc(docRef, {
          userId: uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          messages: [userMsg],
        });
      } else {
        await updateDoc(docRef, {
          updatedAt: serverTimestamp(),
          messages: arrayUnion(userMsg),
        });
      }

      // attempt AI call, fallback to rule-based if fail or timeout
      try {
        const aiText = await (async () => {
          try {
            // try to call AI
            return await callAi(text);
          } catch (e) {
            // log fallback and return empty to trigger rule fallback
            console.log("[ODI] fallback used (timeout or error)");
            return "";
          }
        })();

        let assistantText = aiText;
        if (!assistantText) {
          // rule-based fallback
          const lower = text.toLowerCase();
          if (lower.includes("ödev")) {
            assistantText =
              "Tamam. Ödevini yetiştirmek için 10 dakikalık bir plan yapalım: 1) Konuyu gözden geçir 2) Öncelikli parçaları not al 3) Hemen bir mini görev başlat.";
          } else {
            assistantText = "Anladım. Şu an en önemli hedefin ne?";
          }
        }

        // create assistant message and write to firestore
        const assistantId = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}_assistant`;
        const assistantMsg = { id: assistantId, role: "assistant", text: assistantText, createdAt: Date.now() };

        try {
          const snap2 = await getDoc(docRef);
          if (!snap2.exists()) {
            await setDoc(docRef, {
              userId: uid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              messages: [assistantMsg],
            });
          } else {
            await updateDoc(docRef, {
              updatedAt: serverTimestamp(),
              messages: arrayUnion(assistantMsg),
            });
          }
        } catch (e: any) {
          console.log("[ODI] AI call error writing assistant msg", e?.message || e);
          setError("Asistan cevabı gönderilemedi: " + (e?.message || e?.code || "bilinmeyen"));
        }
      } catch (inner) {
        console.log("[ODI] fallback used (timeout or error)");
        // already handled above
      }
    } catch (e: any) {
      // revert optimistic
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setInput(text);
      setError("Mesaj göndermede hata: " + (e?.message || e?.code || "bilinmeyen"));
    } finally {
      setLoadingSend(false);
    }
  };

  // helper: güvenli zaman formatlayıcı
  const formatTime = (createdAt: any): string => {
    if (!createdAt) return "";
    try {
      if (typeof createdAt === "number") {
        return new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
      if (createdAt?.toDate && typeof createdAt.toDate === "function") {
        return createdAt.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
      if (createdAt instanceof Date) {
        return createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
    } catch {
      // ignore
    }
    return "";
  };

  const renderItem = ({ item }: { item: any }) => {
    const isUser = item.role === "user" || item.userId === uid;
    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAssistant]}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
          <Text style={isUser ? styles.msgTextUser : styles.msgTextAssistant}>{item.text}</Text>
          {item.createdAt ? <Text variant="caption" style={styles.ts}>{formatTime(item.createdAt)}</Text> : null}
        </View>
      </View>
    );
  };

  const onDismissError = () => setError(null);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text variant="h2">Odi Koçu</Text>
        <Pressable
          onPress={() => {
            Alert.alert("Geçmiş", "Geçmişe bak (henüz yok)");
          }}
          style={styles.historyBtn}
        >
          <Text>Geçmiş</Text>
        </Pressable>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text variant="muted" style={{ color: "#fff", flex: 1 }}>
            {error}
          </Text>
          <Pressable onPress={onDismissError} style={{ paddingHorizontal: 8 }}>
            <Text style={{ color: "#fff" }}>Kapat</Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(i) => i.id || String(Math.random())}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.inputRow}>
          <TextInput
            placeholder="Mesaj yaz..."
            value={input}
            onChangeText={setInput}
            style={styles.input}
            multiline
          />
          <Pressable
            onPress={sendMessage}
            style={[styles.sendBtn, (loadingSend || !input.trim()) && styles.sendBtnDisabled]}
            disabled={loadingSend || !input.trim()}
          >
            {loadingSend ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff" }}>Gönder</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7FB" },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  historyBtn: { padding: 8 },
  errorBanner: { backgroundColor: "#b91c1c", padding: 8, flexDirection: "row", alignItems: "center" },
  listContent: { padding: 12, paddingBottom: 100 },
  msgRow: { marginVertical: 6 },
  msgRowUser: { alignItems: "flex-end" },
  msgRowAssistant: { alignItems: "flex-start" },
  bubble: {
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    maxWidth: "78%",
  },
  bubbleUser: {
    backgroundColor: "#6C5CE7",
  },
  bubbleAssistant: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
  },
  msgTextUser: { color: "#fff" },
  msgTextAssistant: { color: "#111" },
  ts: { fontSize: 10, color: "#666", marginTop: 6 },
  inputRow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: "#6C5CE7",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.5, backgroundColor: "#6C5CE7" },
});
