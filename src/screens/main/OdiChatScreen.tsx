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
  Modal,
  Text as RNText,
} from "react-native";
import { Text } from "../../ui/Text";
import { askOdi } from "../../services/ai/odiService";
import { loadRecent, saveMessage } from "../../services/ai/odiChatStore";
import { useUser } from "../../context/UserContext";

type Msg = { id: string; role: "user" | "assistant" | "system"; text: string; createdAt: number };

export const OdiChatScreen: React.FC = () => {
  const { user } = useUser();
  const uid = user?.uid ?? null;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const listRef = useRef<FlatList<any> | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!uid) {
        // show assistant greeting when not signed in or no history
        const greet: Msg = { id: `sys_${Date.now()}`, role: "assistant", text: "Selam! 👋 Bugün neye odaklanmak istersin?", createdAt: Date.now() };
        setMessages([greet]);
        return;
      }
      setLoadingHistory(true);
      try {
        const recent = await loadRecent(uid, 50);
        if (!recent || recent.length === 0) {
          const greet: Msg = { id: `sys_${Date.now()}`, role: "assistant", text: "Selam! 👋 Bugün neye odaklanmak istersin?", createdAt: Date.now() };
          setMessages([greet]);
        } else {
          setMessages(recent.map((m) => ({ id: m.id, role: m.role, text: m.text, createdAt: m.createdAt })));
        }
      } catch (e) {
        console.log("loadRecent error", e);
      } finally {
        setLoadingHistory(false);
      }
    };
    init();
  }, [uid]);

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 120);
  }, [messages]);

  const suggestions = [
    { label: "Gün planı yap", text: "Bugün için sade bir günlük plan yap: 2 odak bloğu + 2 mola + akşam mini değerlendirme. En sonda: 'Hangi tek işe odaklanıyoruz?' diye sor.", intent: "day_plan" as const },
    { label: "Motivasyon ver", text: "Kısa motivasyon mesajı ver (2–3 cümle) ve hemen şimdi başlanacak 5 dakikalık mini adım öner.", intent: "motivation" as const },
    { label: "Görev öner", text: "Bugün için 1–3 küçük görev öner (Pomodoro, bildirim kapatma, 1 net hedef). Kullanıcının seçmesi için soruyla bitir.", intent: "task_suggestion" as const },
  ];

  const addLocalMessage = (m: Msg) => setMessages((p) => [...p, m]);

  const handleSend = async (presetText?: string, intent?: "day_plan" | "motivation" | "task_suggestion" | "chat") => {
    const raw = typeof presetText === "string" ? presetText : input;
    const text = (raw ?? "").trim();
    if (!text || sending) return;

    setSending(true);
    setInput("");

    const userMsg: Msg = { id: `u_${Date.now().toString(36)}`, role: "user", text, createdAt: Date.now() };
    addLocalMessage(userMsg);

    try {
      if (uid) {
        // persist user message
        await saveMessage(uid, { role: "user", text, createdAt: Date.now() });
      }

      const historyForApi = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-12)
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.text }));

      const reply = await askOdi({ userText: text, intent: intent ?? "chat", history: historyForApi });

      const assistantMsg: Msg = { id: `a_${Date.now().toString(36)}`, role: "assistant", text: reply, createdAt: Date.now() };
      addLocalMessage(assistantMsg);

      if (uid) {
        await saveMessage(uid, { role: "assistant", text: reply, createdAt: Date.now() });
      }
    } catch (e) {
      console.log("onSend error", e);
      const fail: Msg = { id: `a_${Date.now().toString(36)}`, role: "assistant", text: "Şu an bağlantıda sorun var. İstersen daha kısa yazar mısın ya da tekrar deneyelim 🙂", createdAt: Date.now() };
      addLocalMessage(fail);
      if (uid) {
        await saveMessage(uid, { role: "assistant", text: fail.text, createdAt: Date.now() });
      }
    } finally {
      setSending(false);
    }
  };

  const openHistoryModal = async () => {
    if (!uid) {
      Alert.alert("Geçmiş", "Geçmişi görmek için giriş yapmalısınız.");
      return;
    }
    setModalVisible(true);
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
          <Pressable onPress={openHistoryModal} style={styles.historyBtn}>
            <Text>{loadingHistory ? "Yükleniyor..." : "Geçmiş"}</Text>
          </Pressable>
        </View>

        <View style={styles.startCardContainer}>
          <View style={styles.suggestionRow}>
            {suggestions.map((s) => (
              <Pressable key={s.label} style={styles.suggestionChip} onPress={() => handleSend(s.text, s.intent)}>
                <Text>{s.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(i) => i.id}
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
            editable={!sending}
          />
          {sending ? <Text style={{ marginTop: 6, color: "#6b7280", fontSize: 13 }}>Odi yazıyor...</Text> : null}
          <Pressable
            onPress={() => handleSend(undefined, "chat")}
            style={[styles.sendBtn, (sending || !input.trim()) && styles.sendBtnDisabled]}
            disabled={sending || !input.trim()}
          >
            {sending ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff" }}>Gönder</Text>}
          </Pressable>
        </View>

        <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
              <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" }}>
                <RNText style={{ fontSize: 18, fontWeight: "700" }}>Geçmiş Sohbet</RNText>
              </View>
              <FlatList
                data={messages}
                keyExtractor={(i) => i.id}
                renderItem={({ item }) => (
                  <View style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: "#fafafa" }}>
                    <RNText style={{ fontWeight: item.role === "user" ? "700" : "600" }}>{item.role.toUpperCase()}</RNText>
                    <RNText style={{ marginTop: 6 }}>{item.text}</RNText>
                    <RNText style={{ marginTop: 6, color: "#666", fontSize: 12 }}>
                      {new Date(item.createdAt).toLocaleString()}
                    </RNText>
                  </View>
                )}
              />
              <View style={{ padding: 12 }}>
                <Pressable onPress={() => setModalVisible(false)} style={{ padding: 12, backgroundColor: "#6C5CE7", borderRadius: 8, alignItems: "center" }}>
                  <RNText style={{ color: "#fff", fontWeight: "700" }}>Kapat</RNText>
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
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
