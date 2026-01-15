import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert, ScrollView, Pressable, TextInput } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";
import { auth, db } from "../../firebase/firebase";
import { doc, getDoc, updateDoc, addDoc, collection, deleteDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { useNavigation, useRoute } from "@react-navigation/native";

const CATEGORIES = [
  { name: "Ders", color: "#2F80ED" },
  { name: "İş", color: "#F2994A" },
  { name: "Kişisel", color: "#9B51E0" },
  { name: "Alışveriş", color: "#27AE60" },
  { name: "Sağlık", color: "#EB5757" },
];

export const EditTaskScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const taskId: string | undefined = route?.params?.taskId;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!taskId) return;
      try {
        const ref = doc(db, "tasks", taskId);
        const snap = await getDoc(ref);
        if (!snap.exists()) return;
        const data = snap.data() as any;
        setTitle(data.title || "");
        setDescription(data.description || "");
        setCategory({ name: data.categoryName || "Ders", color: data.categoryColor || "#2F80ED" });
        setPriority(data.priority || "medium");
        if (data.dueAt && data.dueAt.toDate) {
          const dt = data.dueAt.toDate();
          setDateStr(dt.toISOString().slice(0, 10));
          setTimeStr(dt.toTimeString().slice(0,5));
        }
      } catch {}
    })();
  }, [taskId]);

  const parseDue = () => {
    if (!dateStr) return null;
    try {
      const dt = new Date(`${dateStr}T${timeStr || "00:00"}:00`);
      if (isNaN(dt.getTime())) return null;
      return Timestamp.fromDate(dt);
    } catch { return null; }
  };

  const onSave = async () => {
    if (!title.trim()) return Alert.alert("Hata", "Başlık gerekli.");
    setLoading(true);
    const dueAt = parseDue();
    try {
      if (taskId) {
        await updateDoc(doc(db, "tasks", taskId), {
          title: title.trim(),
          description: description.trim(),
          categoryName: category.name,
          categoryColor: category.color,
          priority,
          dueAt: dueAt || null,
        });
      } else {
        const userId = auth.currentUser?.uid;
        if (!userId) return Alert.alert("Hata", "Giriş yapılmadı.");
        await addDoc(collection(db, "tasks"), {
          userId,
          title: title.trim(),
          description: description.trim(),
          categoryName: category.name,
          categoryColor: category.color,
          priority,
          dueAt: dueAt || null,
          completed: false,
          createdAt: serverTimestamp(),
        });
      }
      nav.goBack();
    } catch (e: any) {
      Alert.alert("Hata", "Kaydetme hatası: " + (e?.message || e?.code || "bilinmeyen"));
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (!taskId) return;
    Alert.alert("Onay", "Görevi silmek istiyor musun?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "tasks", taskId));
            nav.goBack();
          } catch (e: any) {
            Alert.alert("Hata", "Silme hatası: " + (e?.message || e?.code || "bilinmeyen"));
          }
        },
      },
    ]);
  };

  return (
    <Screen style={{ padding: 16 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text variant="h1">{taskId ? "Görevi Düzenle" : "Yeni Görev"}</Text>

        <Input placeholder="Başlık" value={title} onChangeText={setTitle} />
        <Input placeholder="Açıklama" value={description} onChangeText={setDescription} />

        <Text variant="muted" style={{ marginTop: 8 }}>Kategori</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
          {CATEGORIES.map((c) => (
            <Pressable key={c.name} onPress={() => setCategory(c)} style={[styles.cat, { backgroundColor: category.name === c.name ? "#eee" : "#fff" }]}>
              <Text>{c.name}</Text>
            </Pressable>
          ))}
        </View>

        <Text variant="muted" style={{ marginTop: 8 }}>Öncelik</Text>
        <View style={{ flexDirection: "row", marginTop: 8 }}>
          <Pressable onPress={() => setPriority("low")} style={[styles.prio, priority === "low" && styles.prioActive]}><Text>Low</Text></Pressable>
          <Pressable onPress={() => setPriority("medium")} style={[styles.prio, priority === "medium" && styles.prioActive]}><Text>Medium</Text></Pressable>
          <Pressable onPress={() => setPriority("high")} style={[styles.prio, priority === "high" && styles.prioActive]}><Text>High</Text></Pressable>
        </View>

        <Text variant="muted" style={{ marginTop: 8 }}>Tarih (YYYY-MM-DD)</Text>
        <TextInput placeholder="2026-01-01" value={dateStr} onChangeText={setDateStr} style={styles.input} />
        <Text variant="muted" style={{ marginTop: 8 }}>Saat (HH:mm)</Text>
        <TextInput placeholder="09:30" value={timeStr} onChangeText={setTimeStr} style={styles.input} />

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
          <Button title="İptal" onPress={() => nav.goBack()} />
          <Button title={loading ? "Kaydediliyor..." : "Kaydet"} onPress={onSave} />
        </View>

        {taskId ? (
          <View style={{ marginTop: 12 }}>
            <Button title="Görevi Sil" onPress={onDelete} />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  cat: { padding: 8, borderRadius: 8, marginRight: 8, marginBottom: 8 },
  prio: { padding: 8, borderRadius: 8, marginRight: 8 },
  prioActive: { backgroundColor: "#eee" },
  input: { borderRadius: 8, backgroundColor: "#f3f4f6", padding: 8, marginTop: 8 },
});
