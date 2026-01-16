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
import { askOdi } from "../../services/ai/odiService";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";

type Msg = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  createdAt: number;
};

export const OdiChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const listRef = useRef<FlatList<any> | null>(null);

  useEffect(() => {
    const sys: Msg = {
      id: `sys_${Date.now().toString(36)}`,
      role: "assistant",
      text: "Merhaba Simge! Bugün nasıl yardımcı olayım?",
      createdAt: Date.now(),
    };
    setMessages([sys]);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);
  }, []);

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 120);
  }, [messages]);

  const suggestions = [
    { label: "Gün planı yap", text: "Bugün için 3 maddelik net bir plan çıkarır mısın? (ders/ödev/odak)" },
    { label: "Motivasyon ver", text: "Kısa bir motivasyon mesajı ver ve 1 küçük hedef öner." },
    { label: "Görev öner", text: "Bugün yapabileceğim 5 görev öner (kısa ve uygulanabilir)." },
  ];

  const keyExtractor = (i: any) => i.id;

  const ensureChat = async (): Promise<string> => {
    if (chatId) return chatId;
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Not signed in");

    const ref = await addDoc(collection(db, "aiChats"), {
      userId: uid,
      title: "Odi Sohbeti",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setChatId(ref.id);
    return ref.id;
  };

  const persistMsg = async (cid: string, role: "user" | "assistant", text: string) => {
    const uid = auth.currentUser?.uid;
    await addDoc(collection(db, "aiChats", cid, "messages"), {
      userId: uid,
      role,
      text,
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "aiChats", cid), { updatedAt: serverTimestamp() });
  };

  const onSend = async (presetText?: string) => {
    const rawText = typeof presetText === "string" ? presetText : input;
    const text = String(rawText || "").trim();
    if (!text || sending) return;

    setSending(true);
    setInput("");

    const userMsg: Msg = { id: `u_${Date.now().toString(36)}`, role: "user", text, createdAt: Date.now() };
    setMessages((p) => [...p, userMsg]);

    try {
      const cid = await ensureChat();
      await persistMsg(cid, "user", text);

      const history = [...messages, userMsg].map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", text: m.text }));
      const reply = await askOdi({ userMessage: text, history });

      const asstMsg: Msg = { id: `a_${Date.now().toString(36)}`, role: "assistant", text: reply, createdAt: Date.now() };
      setMessages((p) => [...p, asstMsg]);
      await persistMsg(cid, "assistant", reply);
    } catch (e: any) {
      const fail: Msg = { id: `a_${Date.now().toString(36)}`, role: "assistant", text: "Şu an cevap veremiyorum.", createdAt: Date.now() };
      setMessages((p) => [...p, fail]);
    } finally {
      setSending(false);
    }
  };

  // Yeni: geçmiş yükleme fonksiyonu
  const loadLatestChatFromHistory = async () => {
    setLoading(true);
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        Alert.alert("Hata", "Geçmişi görüntülemek için giriş yapmalısınız.");
        return;
      }

      const q = query(collection(db, "aiChats"), where("userId", "==", uid), orderBy("createdAt", "desc"), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) {
        Alert.alert("Geçmiş", "Henüz geçmiş sohbet bulunamadı.");
        return;
      }

      const chatDoc = snap.docs[0];
      const cid = chatDoc.id;
      setChatId(cid);

      const msgsSnap = await getDocs(query(collection(db, "aiChats", cid, "messages"), orderBy("createdAt", "asc")));
      const loaded: Msg[] = msgsSnap.docs.map((d) => {
        const data: any = d.data();
        const ts = data.createdAt;
        const createdAt = ts && typeof ts.toMillis === "function" ? ts.toMillis() : Date.now();
        return {
          id: d.id,
          role: data.role || "assistant",
          text: data.text || "",
          createdAt,
        } as Msg;
      });

      if (loaded.length === 0) {
        Alert.alert("Geçmiş", "Bu sohbetin mesajı bulunamadı.");
        return;
      }

      setMessages(loaded);
    } catch (e: any) {
      console.log("LOAD_HISTORY_ERROR", e);
      Alert.alert("Hata", "Geçmiş yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Msg }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAssistant]}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
          <Text style={isUser ? styles.msgTextUser : styles.msgTextAssistant}>{item.text}</Text>
          <Text variant="caption" style={styles.ts}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text variant="h2">Odi Koçu</Text>
          <Pressable onPress={loadLatestChatFromHistory} style={styles.historyBtn}>
            <Text>{loading ? "Yükleniyor..." : "Geçmiş"}</Text>
          </Pressable>
        </View>

        <View style={styles.startCardContainer}>
          <View style={styles.suggestionRow}>
            {suggestions.map((s) => (
              <Pressable key={s.label} style={styles.suggestionChip} onPress={() => onSend(s.text)}>
                <Text>{s.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 12, paddingBottom: 16 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputRow}>
          <TextInput
            placeholder="Mesaj yaz..."
            placeholderTextColor="#999"
            value={input}
            onChangeText={setInput}
            style={styles.input}
            multiline
            blurOnSubmit={false}
          />
          {loading ? <Text style={{ marginTop: 6, color: "#6b7280", fontSize: 13 }}>Odi yazıyor...</Text> : null}
          <Pressable
            onPress={() => onSend()}
            style={[styles.sendBtn, (sending || !input.trim() || loading) && styles.sendBtnDisabled]}
            disabled={sending || !input.trim() || loading}
          >
            {sending || loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff" }}>Gönder</Text>}
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
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

  startCardContainer: {
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  suggestionRow: { flexDirection: "row", marginTop: 6, flexWrap: "wrap" },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#EEF0F6",
    marginHorizontal: 6,
    marginBottom: 6,
  },

  listContent: { padding: 12, paddingBottom: 120 },

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
    backgroundColor: "#f3f4f6",
  },
  msgTextUser: { color: "#fff" },
  msgTextAssistant: { color: "#111" },
  ts: { fontSize: 10, color: "#666", marginTop: 6 },

  inputRow: {
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
