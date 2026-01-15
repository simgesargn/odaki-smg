import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, FlatList, Modal, TextInput, Alert, Animated } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { Button } from "../../ui/Button";
import { auth, db } from "../../firebase/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
  writeBatch,
  deleteDoc,
} from "firebase/firestore";
import { TaskDoc } from "../../firebase/firestoreTypes";
import { onAuthStateChanged } from "firebase/auth";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Swipeable, RectButton } from "react-native-gesture-handler";
import { Routes } from "../../navigation/routes";

const CATEGORIES = [
  { name: "Ders", color: "#2F80ED" },
  { name: "İş", color: "#F2994A" },
  { name: "Kişisel", color: "#9B51E0" },
  { name: "Alışveriş", color: "#27AE60" },
  { name: "Sağlık", color: "#EB5757" },
];

export const TasksScreen: React.FC = () => {
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid || null);
  const [tasks, setTasks] = useState<TaskDoc[]>([]);
  const [filter, setFilter] = useState<"tumu" | "aktif" | "tamamlanan">("tumu");
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // new task fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");

  // --- yeni state'ler for details/modal/edit ---
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDoc | null>(null);
  const [editMode, setEditMode] = useState(false);

  // edit fields
  const [eTitle, setETitle] = useState("");
  const [eDescription, setEDescription] = useState("");
  const [eCategory, setECategory] = useState(CATEGORIES[0]);
  const [ePriority, setEPriority] = useState<"low" | "medium" | "high">("medium");
  const [eDateStr, setEDateStr] = useState("");
  const [eTimeStr, setETimeStr] = useState("");

  // busy flags
  const [editSaving, setEditSaving] = useState(false);
  const [deleteProcessing, setDeleteProcessing] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUid(u?.uid || null);
      console.log("uid:", u?.uid || null);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!uid) {
      setTasks([]);
      console.log("tasks loaded:", 0);
      return;
    }
    setError(null);
    const q = query(collection(db, "tasks"), where("userId", "==", uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        console.log("tasks docs:", snap.size);
        if (snap.size === 0) {
          console.log("querying tasks for uid:", uid, "collection: tasks");
        }
        const items: TaskDoc[] = [];
        snap.forEach((d) => {
          const data = d.data() as any;
          items.push({ ...(data as TaskDoc), id: d.id });
        });
        items.sort((a, b) => {
          const aTime = (a.createdAt as any)?.toMillis ? (a.createdAt as any).toMillis() : 0;
          const bTime = (b.createdAt as any)?.toMillis ? (b.createdAt as any).toMillis() : 0;
          if (aTime && bTime) return bTime - aTime;
          return (a.title || "").localeCompare(b.title || "");
        });
        setTasks(items);
        console.log("tasks loaded:", items.length);
      },
      (e: any) => {
        setError("Firestore okuma hatası: " + (e?.message || e?.code || "bilinmeyen"));
        setTasks([]);
        console.log("tasks loaded:", 0);
      }
    );
    return () => unsub();
  }, [uid]);

  useEffect(() => {
    const tid = route?.params?.openTaskId;
    if (tid && tasks.length > 0) {
      const t = tasks.find((x) => x.id === tid);
      if (t) openTaskModal(t);
    }
  }, [route?.params?.openTaskId, tasks]);

  const parseDue = () => {
    if (!dateStr) return null;
    try {
      const datePart = dateStr.trim(); // YYYY-MM-DD
      const timePart = timeStr.trim() || "00:00";
      const dt = new Date(`${datePart}T${timePart}:00`);
      if (isNaN(dt.getTime())) return null;
      return Timestamp.fromDate(dt);
    } catch {
      return null;
    }
  };

  const parseDueFromFields = (dateStrVal: string, timeStrVal: string) => {
    if (!dateStrVal) return null;
    try {
      const datePart = dateStrVal.trim();
      const timePart = timeStrVal.trim() || "00:00";
      const dt = new Date(`${datePart}T${timePart}:00`);
      if (isNaN(dt.getTime())) return null;
      return Timestamp.fromDate(dt);
    } catch {
      return null;
    }
  };

  const onSave = async () => {
    if (!uid) {
      setError("Giriş yapılmadı.");
      return;
    }
    if (!title.trim()) {
      setError("Başlık gerekli.");
      return;
    }
    const dueAt = parseDue();
    try {
      const payload = {
        userId: uid,
        title: title.trim(),
        description: description.trim(),
        categoryName: category.name,
        categoryColor: category.color,
        priority,
        dueAt: dueAt || null,
        completed: false,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "tasks"), payload);
      // reset
      setTitle("");
      setDescription("");
      setDateStr("");
      setTimeStr("");
      setPriority("medium");
      setCategory(CATEGORIES[0]);
      setModalOpen(false);
      setError(null);
    } catch (e: any) {
      setError("Firestore yazma hatası: " + (e?.message || e?.code || "bilinmeyen"));
    }
  };

  const onSaveEdit = async () => {
    if (!selectedTask?.id) return;
    const dueAt = parseDueFromFields(eDateStr, eTimeStr);
    setEditSaving(true);
    // optimistic update locally
    setTasks((prev) =>
      prev.map((p) =>
        p.id === selectedTask.id
          ? {
              ...p,
              title: eTitle,
              description: eDescription,
              categoryName: eCategory.name,
              categoryColor: eCategory.color,
              priority: ePriority,
              dueAt: dueAt || null,
            }
          : p
      )
    );
    try {
      await updateDoc(doc(db, "tasks", selectedTask.id), {
        title: eTitle,
        description: eDescription,
        categoryName: eCategory.name,
        categoryColor: eCategory.color,
        priority: ePriority,
        dueAt: dueAt || null,
        updatedAt: serverTimestamp(),
      });
      // update selectedTask to reflect saved values
      setSelectedTask((prev) =>
        prev
          ? {
              ...prev,
              title: eTitle,
              description: eDescription,
              categoryName: eCategory.name,
              categoryColor: eCategory.color,
              priority: ePriority,
              dueAt: dueAt || null,
            }
          : prev
      );
      setEditMode(false);
    } catch (e: any) {
      setError("Firestore yazma hatası: " + (e?.message || e?.code || "bilinmeyen"));
    } finally {
      setEditSaving(false);
    }
  };

  const onDeleteTask = async () => {
    if (!selectedTask?.id) return;
    Alert.alert("Onay", "Bu görevi silmek istediğine emin misin?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          setDeleteProcessing(true);
          try {
            await deleteDoc(doc(db, "tasks", selectedTask.id!));
            // optimistic local removal
            setTasks((prev) => prev.filter((p) => p.id !== selectedTask.id));
            setDetailsModalVisible(false);
            setSelectedTask(null);
          } catch (e: any) {
            setError("Firestore silme hatası: " + (e?.message || e?.code || "bilinmeyen"));
          } finally {
            setDeleteProcessing(false);
          }
        },
      },
    ]);
  };

  const toggleComplete = async (task: TaskDoc) => {
    if (!task.id) return;
    const newVal = !task.completed;
    // optimistic UI
    setTasks((prev) => prev.map((p) => (p.id === task.id ? { ...p, completed: newVal } : p)));
    try {
      await updateDoc(doc(db, "tasks", task.id), {
        completed: newVal,
        completedAt: newVal ? serverTimestamp() : null,
        updatedAt: serverTimestamp(),
      });
    } catch (e: any) {
      setError("Firestore yazma hatası: " + (e?.message || e?.code || "bilinmeyen"));
      // revert optimistic
      setTasks((prev) => prev.map((p) => (p.id === task.id ? { ...p, completed: task.completed } : p)));
    }
  };

  const openTaskModal = (task: TaskDoc) => {
    setSelectedTask(task);
    // populate edit fields
    setETitle(task.title || "");
    setEDescription(task.description || "");
    setECategory({ name: task.categoryName || "Ders", color: task.categoryColor || "#2F80ED" });
    setEPriority(task.priority || "medium");
    if (task.dueAt && (task.dueAt as any).toDate) {
      const dt = (task.dueAt as any).toDate();
      setEDateStr(dt.toISOString().slice(0, 10));
      setETimeStr(dt.toTimeString().slice(0, 5));
    } else {
      setEDateStr("");
      setETimeStr("");
    }
    setEditMode(false);
    setDetailsModalVisible(true);
  };

  const onCleanDuplicates = async () => {
    if (!uid) {
      Alert.alert("Hata", "Kullanıcı bulunamadı.");
      return;
    }
    try {
      // group tasks by composite key
      const groups: Record<string, TaskDoc[]> = {};
      tasks.forEach((t) => {
        const key = `${t.title || ""}||${t.description || ""}||${t.priority}||${t.categoryName || ""}`;
        (groups[key] = groups[key] || []).push(t);
      });

      const toDeleteIds: string[] = [];
      Object.keys(groups).forEach((k) => {
        const arr = groups[k];
        if (arr.length <= 1) return;
        // keep newest by createdAt
        arr.sort((a, b) => {
          const at = (a.createdAt as any)?.toMillis ? (a.createdAt as any).toMillis() : 0;
          const bt = (b.createdAt as any)?.toMillis ? (b.createdAt as any).toMillis() : 0;
          return bt - at;
        });
        const keep = arr[0];
        const deletes = arr.slice(1);
        deletes.forEach((d) => {
          if (d.id) toDeleteIds.push(d.id);
        });
      });

      if (toDeleteIds.length === 0) {
        Alert.alert("Bilgi", "Tekrarlanan görev bulunamadı.");
        return;
      }

      const batch = writeBatch(db);
      toDeleteIds.forEach((id) => batch.delete(doc(db, "tasks", id)));
      await batch.commit();

      Alert.alert("Başarılı", "Tekrarlanan görevler temizlendi.");
    } catch (e: any) {
      setError("Temizleme hatası: " + (e?.message || e?.code || "bilinmeyen"));
    }
  };

  const filtered = tasks.filter((t) => {
    if (filter === "tumu") return true;
    if (filter === "aktif") return !t.completed;
    if (filter === "tamamlanan") return !!t.completed;
    return true;
  });

  const counts = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    active: tasks.filter((t) => !t.completed).length,
  };

  // helper: render left (edit) action
  const renderLeftActions = (progress: any, dragX: any, item: TaskDoc) => {
    return (
      <RectButton style={[actionStyles.leftAction]} onPress={() => navigation.navigate(Routes.EditTask as any, { taskId: item.id })}>
        <Text style={{ color: "#fff" }}>Düzenle</Text>
      </RectButton>
    );
  };

  // helper: render right (delete) action
  const renderRightActions = (progress: any, dragX: any, item: TaskDoc) => {
    return (
      <RectButton
        style={[actionStyles.rightAction]}
        onPress={() =>
          Alert.alert("Onay", "Bu görevi silmek istediğine emin misin?", [
            { text: "İptal", style: "cancel" },
            {
              text: "Sil",
              style: "destructive",
              onPress: async () => {
                try {
                  if (!item.id) return;
                  await deleteDoc(doc(db, "tasks", item.id));
                  // local update handled by snapshot; still optimistic remove to reduce flicker
                  setTasks((prev) => prev.filter((p) => p.id !== item.id));
                  // if details modal open for same id, close it
                  if (selectedTask?.id === item.id) {
                    setDetailsModalVisible(false);
                    setSelectedTask(null);
                  }
                } catch (e: any) {
                  setError("Firestore silme hatası: " + (e?.message || e?.code || "bilinmeyen"));
                }
              },
            },
          ])
        }
      >
        <Text style={{ color: "#fff" }}>Sil</Text>
      </RectButton>
    );
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text variant="h1">Tüm Görevler</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ marginRight: 12 }}>
            <Text style={{ marginRight: 12 }}>
              {counts.total} / {counts.active} aktif
            </Text>
            <Text>{counts.completed} tamamlandı</Text>
          </View>
          <Pressable onPress={onCleanDuplicates} style={{ padding: 8 }}>
            <Text variant="muted">Temizle (Duplicate)</Text>
          </Pressable>
        </View>
      </View>

      {error ? (
        <View style={styles.error}>
          <Text variant="muted" style={{ color: "#b91c1c" }}>
            {error}
          </Text>
        </View>
      ) : null}

      <View style={styles.tabs}>
        <Pressable onPress={() => setFilter("tumu")}>
          <Text variant={filter === "tumu" ? "h2" : "muted"}>Tümü</Text>
        </Pressable>
        <Pressable onPress={() => setFilter("aktif")} style={{ marginLeft: 12 }}>
          <Text variant={filter === "aktif" ? "h2" : "muted"}>Aktif</Text>
        </Pressable>
        <Pressable onPress={() => setFilter("tamamlanan")} style={{ marginLeft: 12 }}>
          <Text variant={filter === "tamamlanan" ? "h2" : "muted"}>Tamamlanan</Text>
        </Pressable>
      </View>

      <FlatList
        style={{ marginTop: 12 }}
        data={filtered}
        keyExtractor={(i) => i.id || i.title}
        renderItem={({ item }) => (
          <Swipeable
            renderLeftActions={(progress, dragX) => renderLeftActions(progress, dragX, item)}
            renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
          >
            <Pressable onPress={() => openTaskModal(item)} style={styles.taskRow}>
              <Pressable onPress={() => toggleComplete(item)} style={styles.checkbox}>
                <Text>{item.completed ? "☑️" : "⬜️"}</Text>
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text variant="h2">{item.title}</Text>
                <Text variant="muted">
                  {item.categoryName} • {item.priority}
                </Text>
              </View>
            </Pressable>
          </Swipeable>
        )}
      />

      <Pressable style={styles.fab} onPress={() => setModalOpen(true)}>
        <Text style={{ fontSize: 20, color: "#fff" }}>+</Text>
      </Pressable>

      <Modal visible={modalOpen} animationType="slide" transparent>
        <View style={styles.modalWrap}>
          <View style={styles.modal}>
            <Text variant="h2">Yeni Görev</Text>
            <TextInput placeholder="Başlık" value={title} onChangeText={setTitle} style={styles.input} />
            <TextInput placeholder="Açıklama" value={description} onChangeText={setDescription} style={styles.input} />
            <Text variant="muted" style={{ marginTop: 8 }}>
              Kategori
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c.name}
                  onPress={() => setCategory(c)}
                  style={[styles.cat, { backgroundColor: category.name === c.name ? "#eee" : "#fff" }]}
                >
                  <Text>{c.name}</Text>
                </Pressable>
              ))}
            </View>

            <Text variant="muted" style={{ marginTop: 8 }}>
              Öncelik
            </Text>
            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <Pressable onPress={() => setPriority("low")} style={[styles.prio, priority === "low" && styles.prioActive]}>
                <Text>Low</Text>
              </Pressable>
              <Pressable onPress={() => setPriority("medium")} style={[styles.prio, priority === "medium" && styles.prioActive]}>
                <Text>Medium</Text>
              </Pressable>
              <Pressable onPress={() => setPriority("high")} style={[styles.prio, priority === "high" && styles.prioActive]}>
                <Text>High</Text>
              </Pressable>
            </View>

            <Text variant="muted" style={{ marginTop: 8 }}>
              Tarih (YYYY-MM-DD)
            </Text>
            <TextInput placeholder="2026-01-01" value={dateStr} onChangeText={setDateStr} style={styles.input} />
            <Text variant="muted" style={{ marginTop: 8 }}>
              Saat (HH:mm)
            </Text>
            <TextInput placeholder="09:30" value={timeStr} onChangeText={setTimeStr} style={styles.input} />

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
              <Button title="İptal" onPress={() => setModalOpen(false)} />
              <Button title="Kaydet" onPress={onSave} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={detailsModalVisible} animationType="slide" transparent>
        <View style={styles.modalWrap}>
          <View style={styles.modal}>
            {!editMode ? (
              <>
                <Text variant="h2">{selectedTask?.title}</Text>
                <Text variant="muted" style={{ marginTop: 8 }}>
                  {selectedTask?.description}
                </Text>
                <Text variant="muted" style={{ marginTop: 8 }}>
                  {selectedTask?.categoryName} • {selectedTask?.priority}
                </Text>
                <Text variant="muted" style={{ marginTop: 8 }}>
                  {selectedTask?.dueAt ? (selectedTask.dueAt as any).toDate().toLocaleString() : "Tarih yok"}
                </Text>
                <Text variant="muted" style={{ marginTop: 8 }}>
                  Oluşturuldu: {(selectedTask?.createdAt as any)?.toDate ? (selectedTask?.createdAt as any).toDate().toLocaleString() : "-"}
                </Text>

                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
                  <Button title="Düzenle" onPress={() => setEditMode(true)} disabled={editSaving || deleteProcessing} />
                  <Button title="Sil" onPress={onDeleteTask} disabled={editSaving || deleteProcessing} />
                  <Button
                    title="Kapat"
                    onPress={() => {
                      setDetailsModalVisible(false);
                      setSelectedTask(null);
                    }}
                    disabled={editSaving || deleteProcessing}
                  />
                </View>
              </>
            ) : (
              <>
                <TextInput placeholder="Başlık" value={eTitle} onChangeText={setETitle} style={styles.input} />
                <TextInput placeholder="Açıklama" value={eDescription} onChangeText={setEDescription} style={styles.input} />
                <View style={{ flexDirection: "row", marginTop: 8 }}>
                  {CATEGORIES.map((c) => (
                    <Pressable
                      key={c.name}
                      onPress={() => setECategory(c)}
                      style={[styles.cat, { backgroundColor: eCategory.name === c.name ? "#eee" : "#fff" }]}
                    >
                      <Text>{c.name}</Text>
                    </Pressable>
                  ))}
                </View>
                <View style={{ flexDirection: "row", marginTop: 8 }}>
                  <Pressable onPress={() => setEPriority("low")} style={[styles.prio, ePriority === "low" && styles.prioActive]}>
                    <Text>Low</Text>
                  </Pressable>
                  <Pressable onPress={() => setEPriority("medium")} style={[styles.prio, ePriority === "medium" && styles.prioActive]}>
                    <Text>Medium</Text>
                  </Pressable>
                  <Pressable onPress={() => setEPriority("high")} style={[styles.prio, ePriority === "high" && styles.prioActive]}>
                    <Text>High</Text>
                  </Pressable>
                </View>

                <TextInput placeholder="Tarih (YYYY-MM-DD)" value={eDateStr} onChangeText={setEDateStr} style={styles.input} />
                <TextInput placeholder="Saat (HH:mm)" value={eTimeStr} onChangeText={setETimeStr} style={styles.input} />

                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
                  <Button title="İptal" onPress={() => setEditMode(false)} disabled={editSaving} />
                  <Button title={editSaving ? "Kaydediliyor..." : "Kaydet"} onPress={onSaveEdit} disabled={editSaving} />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tabs: { flexDirection: "row", marginTop: 12 },
  taskRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  checkbox: { width: 36 },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#6C5CE7",
    alignItems: "center",
    justifyContent: "center",
  },
  modalWrap: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", padding: 16 },
  modal: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  input: { borderRadius: 8, backgroundColor: "#f3f4f6", padding: 8, marginTop: 8 },
  cat: { padding: 8, borderRadius: 8, marginRight: 8, marginBottom: 8 },
  prio: { padding: 8, borderRadius: 8, marginRight: 8 },
  prioActive: { backgroundColor: "#eee" },
  error: { paddingVertical: 8 },
});

const actionStyles = StyleSheet.create({
  leftAction: { backgroundColor: "#0ea5e9", justifyContent: "center", alignItems: "center", width: 80 },
  rightAction: { backgroundColor: "#ef4444", justifyContent: "center", alignItems: "center", width: 80 },
});
