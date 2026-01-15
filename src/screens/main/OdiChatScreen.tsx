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

type Msg = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  createdAt: number;
};

export const OdiChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loadingSend, setLoadingSend] = useState(false);
  const listRef = useRef<FlatList<any> | null>(null);

  // ilk sistem mesajı
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

  // scroll to end on messages change
  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 120);
  }, [messages]);

  const suggestions = [
    { label: "Gün planı yap", text: "Bugün için 3 maddelik net bir plan çıkarır mısın? (ders/ödev/odak)" },
    { label: "Motivasyon ver", text: "Kısa bir motivasyon mesajı ver ve 1 küçük hedef öner." },
    { label: "Görev öner", text: "Bugün yapabileceğim 5 görev öner (kısa ve uygulanabilir)." },
  ];

  const keyExtractor = (i: any) => i.id;

  const sendMessage = async (presetText?: string) => {
    const raw = typeof presetText === "string" ? presetText : input;
    const text = String(raw || "").trim();
    if (!text) return;
    setLoadingSend(true);

    const userMsg: Msg = { id: `u_${Date.now().toString(36)}`, role: "user", text, createdAt: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);

    // sahte Odi cevabı (mock)
    setTimeout(() => {
      const replyText =
        presetText ??
        (text.length > 80
          ? "Güzel, bunu adım adım yapmanı öneririm. İstersen bir plan hazırlayayım."
          : `Tamam: "${text}" — üzerine kısa bir cevap hazırlıyorum.`);
      const odiMsg: Msg = { id: `odi_${Date.now().toString(36)}`, role: "assistant", text: replyText, createdAt: Date.now() };
      setMessages((prev) => [...prev, odiMsg]);
      setLoadingSend(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 120);
    }, 400);
  };

  const renderItem = ({ item }: { item: Msg }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAssistant]}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
          {!isUser ? <Text variant="caption" style={styles.assistantLabel}>Odi (Geçici)</Text> : null}
          <Text style={isUser ? styles.msgTextUser : styles.msgTextAssistant}>{item.text}</Text>
          {/* ts */}
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
          <Pressable
            onPress={() => {
              Alert.alert("Geçmiş", "Geçmişe bak (henüz yok)");
            }}
            style={styles.historyBtn}
          >
            <Text>Geçmiş</Text>
          </Pressable>
        </View>

        <View style={styles.startCardContainer}>
          <View style={styles.suggestionRow}>
            {suggestions.map((s) => (
              <Pressable
                key={s.label}
                style={styles.suggestionChip}
                onPress={() => {
                  // chip'e basınca kullanıcı mesajı olarak ekle ve otomatik gönder
                  sendMessage(s.text);
                }}
              >
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
          <Pressable
            onPress={() => sendMessage()}
            style={[styles.sendBtn, (loadingSend || !input.trim()) && styles.sendBtnDisabled]}
            disabled={loadingSend || !input.trim()}
          >
            {loadingSend ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff" }}>Gönder</Text>}
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
  assistantLabel: { fontSize: 12, color: "#6b7280", marginBottom: 6 },
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
