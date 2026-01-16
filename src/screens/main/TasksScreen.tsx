import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  TouchableOpacity,
  Platform,
  Modal,
} from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";
import { auth, db } from "../../firebase/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
// date picker (optional dependency)
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "../../context/UserContext";

type Task = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  dueAt?: any;
  createdAt?: any;
};

export const TasksScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const uid = user?.uid;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "completed">("all");
  const [sortMode, setSortMode] = useState<"date" | "priority">("date");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setTasks([]);
      return;
    }
    setError(null);
    const col = collection(db, "tasks");
    const q = query(col, where("userId", "==", uid), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items: Task[] = [];
        snap.forEach((d) => {
          const data = d.data() as any;
          items.push({
            id: d.id,
            userId: data.userId,
            title: data.title,
            description: data.description || "",
            priority: (data.priority as any) || "medium",
            completed: !!data.completed,
            dueAt: data.dueAt,
            createdAt: data.createdAt,
          });
        });
        setTasks(items);
      },
      (e) => {
        setError("Görevleri yüklerken hata: " + (e?.message || e?.code || "bilinmeyen"));
      }
    );
    return () => unsub();
  }, [uid]);

  const loadTasks = async () => {
    if (!uid) return;
    // load user's tasks from root collection
    const q = query(collection(db, "tasks"), where("userId", "==", uid));
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    // normalize priority and dueAt
    const normalized = items.map((t: any) => ({
      ...t,
      priority: (t.priority as any) || "medium",
      dueAt: t.dueAt ?? null,
    }));
    setTasks(normalized);
  };

  const isSameLocalDay = (ts?: number | null) => {
    if (!ts) return false;
    const d = new Date(ts);
    const today = new Date();
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
  };

  const onAdd = async () => {
    if (!uid) return;
    const t = title.trim();
    if (!t) return;
    setLoading(true);
    setError(null);
    try {
      const due = dueDate ? Timestamp.fromDate(dueDate) : null;
      await addDoc(collection(db, "tasks"), {
        userId: uid,
        title: t,
        description: description.trim() || "",
        completed: false,
        priority,
        dueAt: due,
        createdAt: serverTimestamp(),
      });
      // reset inputs
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate(null);
    } catch (e: any) {
      setError("Görev eklenemedi: " + (e?.message || e?.code || "bilinmeyen"));
    } finally {
      setLoading(false);
    }
  };

  const onToggle = async (item: Task) => {
    try {
      await updateDoc(doc(db, "tasks", item.id), {
        completed: !item.completed,
      });
    } catch (e: any) {
      setError("Güncelleme hatası: " + (e?.message || e?.code || "bilinmeyen"));
    }
  };

  const onDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "tasks", id));
    } catch (e: any) {
      setError("Silme hatası: " + (e?.message || e?.code || "bilinmeyen"));
    }
  };

  // filtering + sorting
  const getVisibleTasks = () => {
    const timeOf = (v: any) => {
      if (!v) return 0;
      if (v?.toDate && typeof v.toDate === "function") return v.toDate().getTime();
      if (typeof v === "number") return v;
      if (v instanceof Date) return v.getTime();
      return 0;
    };

    let list = tasks.slice();
    if (activeFilter === "active") list = list.filter((t) => !t.completed);
    if (activeFilter === "completed") list = list.filter((t) => t.completed);

    if (sortMode === "date") {
      // dueAt olanlar önce; en yakın tarih (küçük timestamp) üstte -> ascending
      list.sort((a, b) => {
        const aHas = !!a.dueAt;
        const bHas = !!b.dueAt;
        if (aHas && bHas) {
          const aKey = timeOf(a.dueAt);
          const bKey = timeOf(b.dueAt);
          if (aKey !== bKey) return aKey - bKey; // küçük (yakın) önce
          // if equal dueAt, fallback createdAt desc
          return timeOf(b.createdAt) - timeOf(a.createdAt);
        }
        if (aHas && !bHas) return -1; // a önce
        if (!aHas && bHas) return 1; // b önce
        // neither have dueAt -> createdAt desc
        return timeOf(b.createdAt) - timeOf(a.createdAt);
      });
    } else {
      // priority: high > medium > low ; tie -> createdAt desc
      const prioVal = (p: string) => (p === "high" ? 3 : p === "medium" ? 2 : 1);
      list.sort((a, b) => {
        const pv = prioVal(b.priority as string) - prioVal(a.priority as string);
        if (pv !== 0) return pv;
        return timeOf(b.createdAt) - timeOf(a.createdAt);
      });
    }

    return list;
  };

  const visible = getVisibleTasks();

  const formatDateTurkish = (d: any) => {
    if (!d) return "";
    let dateObj: Date;
    if (d?.toDate && typeof d.toDate === "function") dateObj = d.toDate();
    else if (typeof d === "number") dateObj = new Date(d);
    else if (d instanceof Date) dateObj = d;
    else return "";
    return dateObj.toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text variant="h2" style={{ marginBottom: 12 }}>Görevlerim</Text>

        {/* Filters & Sorting */}
        <View style={styles.controlsRow}>
          <View style={styles.chipsRow}>
            <TouchableOpacity style={[styles.chip, activeFilter === "all" && styles.chipActive]} onPress={() => setActiveFilter("all")}>
              <Text style={activeFilter === "all" ? styles.chipTextActive : styles.chipText}>Hepsi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chip, activeFilter === "active" && styles.chipActive]} onPress={() => setActiveFilter("active")}>
              <Text style={activeFilter === "active" ? styles.chipTextActive : styles.chipText}>Aktif</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chip, activeFilter === "completed" && styles.chipActive]} onPress={() => setActiveFilter("completed")}>
              <Text style={activeFilter === "completed" ? styles.chipTextActive : styles.chipText}>Tamamlanan</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sortRow}>
            <TouchableOpacity style={[styles.sortBtn, sortMode === "date" && styles.sortBtnActive]} onPress={() => setSortMode("date")}>
              <Text style={sortMode === "date" ? styles.sortTextActive : styles.sortText}>Tarihe göre</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.sortBtn, sortMode === "priority" && styles.sortBtnActive]} onPress={() => setSortMode("priority")}>
              <Text style={sortMode === "priority" ? styles.sortTextActive : styles.sortText}>Önceliğe göre</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Input moved to Modal. FAB opens the modal */}
        
        {/* Modal for adding task */}
        <Modal visible={isAddOpen} animationType="slide" transparent>
          <TouchableOpacity activeOpacity={1} style={styles.modalOverlay} onPress={() => setIsAddOpen(false)}>
            <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
              <View style={styles.modalHeader}>
                <Text variant="h3">Görev ekle</Text>
                <Pressable onPress={() => setIsAddOpen(false)} style={styles.modalClose}>
                  <Text variant="muted">Kapat</Text>
                </Pressable>
              </View>

              <View style={{ marginTop: 8 }}>
                <Text style={styles.label}>Görev başlığı</Text>
                <Input placeholder="Başlık girin" value={title} onChangeText={setTitle} />

                <Text style={[styles.label, { marginTop: 10 }]}>Açıklama (opsiyonel)</Text>
                <Input placeholder="Açıklama..." value={description} onChangeText={setDescription} multiline style={{ height: 80 }} />

                <Text style={[styles.label, { marginTop: 10 }]}>Öncelik</Text>
                <View style={styles.priorityRow}>
                  <TouchableOpacity onPress={() => setPriority("low")} style={[styles.priorityChip, priority === "low" && styles.priorityChipActive]}>
                    <Text style={priority === "low" ? styles.priorityTextActive : styles.priorityText}>Düşük</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setPriority("medium")} style={[styles.priorityChip, priority === "medium" && styles.priorityChipActive]}>
                    <Text style={priority === "medium" ? styles.priorityTextActive : styles.priorityText}>Orta</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setPriority("high")} style={[styles.priorityChip, priority === "high" && styles.priorityChipActive]}>
                    <Text style={priority === "high" ? styles.priorityTextActive : styles.priorityText}>Yüksek</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
                  <Button title={dueDate ? `Tarih: ${formatDateTurkish(dueDate)}` : "Tarih seç (opsiyonel)"} onPress={() => setShowDatePicker(true)} />
                  {dueDate ? (
                    <Pressable onPress={() => setDueDate(null)} style={{ marginLeft: 8 }}>
                      <Text variant="muted">Temizle</Text>
                    </Pressable>
                  ) : null}
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    value={dueDate || new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(_, d) => {
                      setShowDatePicker(false);
                      if (d) setDueDate(d);
                    }}
                  />
                )}

                <View style={{ marginTop: 12 }}>
                  <Button
                    title={title.trim() ? "Ekle" : "Ekle (başlık gerekli)"}
                    onPress={async () => {
                      await onAdd();
                      setIsAddOpen(false);
                    }}
                    disabled={!title.trim() || loading}
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
        
        {/* Error */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* List */}
        {tasks.length === 0 ? (
          <View style={styles.empty}>
            <Text>Henüz görev yok. İlk görevini ekle!</Text>
          </View>
        ) : (
          <FlatList
            data={visible}
            keyExtractor={(t) => t.id}
            style={{ marginTop: 12 }}
            contentContainerStyle={{ paddingBottom: 140 }}
            renderItem={({ item }) => (
              <View style={[styles.taskCard, item.completed && styles.taskCardDone]}>
                <View style={styles.taskLeft}>
                  <Pressable onPress={() => onToggle(item)} style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
                    <Text style={{ color: item.completed ? "#fff" : "#111" }}>{item.completed ? "✓" : ""}</Text>
                  </Pressable>
                </View>

                <View style={styles.taskCenter}>
                  <Text style={[styles.taskTitle, item.completed && styles.titleDone]}>{item.title}</Text>
                  {item.description ? <Text variant="muted" style={styles.taskDesc}>{item.description}</Text> : null}
                  <Text variant="muted" style={styles.taskDate}>
                    {item.dueAt ? `Son tarih: ${formatDateTurkish(item.dueAt)}` : item.createdAt ? `Oluşturuldu: ${formatDateTurkish(item.createdAt)}` : ""}
                  </Text>
                </View>

                <View style={styles.taskRight}>
                  <View style={[styles.priorityBadge, item.priority === "high" ? styles.high : item.priority === "medium" ? styles.medium : styles.low]}>
                    <Text style={styles.priorityBadgeText}>{item.priority === "high" ? "Yüksek" : item.priority === "medium" ? "Orta" : "Düşük"}</Text>
                  </View>
                  <Pressable onPress={() => onDelete(item.id)} style={styles.deleteBtn}>
                    <Text style={{ color: "#ef4444" }}>Sil</Text>
                  </Pressable>
                </View>
              </View>
            )}
          />
        )}

        {/* Loading */}
        {loading && <Text style={{ marginTop: 8 }}>Görevler yükleniyor...</Text>}

        {/* FAB - root container içinde, LIST'in DIŞINDA (sabit, floating) */}
        <Pressable
          style={[styles.fab, { bottom: (insets.bottom || 0) + 96 }]}
          onPress={() => {
            setIsAddOpen(true);
          }}
        >
          <Text style={styles.fabIcon}>+</Text>
        </Pressable>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  controlsRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap" },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    marginRight: 6,
    marginBottom: 6,
    minHeight: 36,
  },
  chipActive: { backgroundColor: "#6C5CE7" },
  chipText: { color: "#111", fontSize: 14 },
  chipTextActive: { color: "#fff", fontSize: 14 },

  sortRow: { flexDirection: "row" },
  sortBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb", marginLeft: 8, minHeight: 36 },
  sortBtnActive: { backgroundColor: "#6C5CE7" },
  sortText: { color: "#111", fontSize: 14 },
  sortTextActive: { color: "#fff", fontSize: 14 },

  card: { backgroundColor: "#fff", padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: "#eee" },
  label: { fontSize: 13, color: "#6b7280", marginBottom: 6 },

  priorityRow: { flexDirection: "row", marginTop: 6 },
  priorityChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "#e5e7eb", marginRight: 8 },
  priorityChipActive: { backgroundColor: "#6C5CE7" },
  priorityText: { color: "#111" },
  priorityTextActive: { color: "#fff" },

  errorText: { color: "#ef4444", marginTop: 8 },

  empty: { padding: 24, alignItems: "center" },

  taskCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: "#eee" },
  taskCardDone: { opacity: 0.5 },
  taskLeft: { marginRight: 12 },
  checkbox: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, borderColor: "#ddd", alignItems: "center", justifyContent: "center" },
  checkboxChecked: { backgroundColor: "#6C5CE7", borderColor: "#6C5CE7" },

  taskCenter: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: "600", color: "#111" },
  titleDone: { textDecorationLine: "line-through", color: "#888" },
  taskDesc: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  taskDate: { fontSize: 12, color: "#9ca3af", marginTop: 6 },

  taskRight: { alignItems: "flex-end", marginLeft: 12 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  priorityBadgeText: { color: "#fff", fontSize: 12 },
  high: { backgroundColor: "#ef4444" },
  medium: { backgroundColor: "#f59e0b" },
  low: { backgroundColor: "#10b981" },

  deleteBtn: { paddingHorizontal: 6 },

  inputRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },

  list: { marginTop: 8 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 720,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalClose: { padding: 8 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: "#6C5CE7",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
    zIndex: 999,
  },
  fabIcon: { color: "#fff", fontSize: 28, lineHeight: 28 },
});
