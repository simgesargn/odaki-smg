import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../ui/Text";
import { useUser } from "../../context/UserContext";
import { db } from "../../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";

export function AddFriendScreen() {
  const nav = useNavigation<any>();
  const { user } = useUser();
  const uid = user?.uid ?? null;
  const [emailOrName, setEmailOrName] = useState("");
  const [loading, setLoading] = useState(false);

  const sendRequest = async () => {
    if (!uid) return Alert.alert("Hata", "Giriş gerekli.");
    if (!emailOrName.trim()) return Alert.alert("Hata", "E-posta veya kullanıcı adı girin.");
    setLoading(true);
    try {
      await addDoc(collection(db, "friendRequests"), {
        fromUid: uid,
        fromEmail: user?.email ?? null,
        toIdentifier: emailOrName.trim(),
        status: "pending",
        createdAt: serverTimestamp(),
      });
      Alert.alert("Başarılı", "İstek gönderildi.");
      nav.navigate(Routes.Friends as any);
    } catch (e: any) {
      Alert.alert("Hata", "İstek gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => nav.navigate(Routes.Friends as any)} style={styles.back}><Text>Geri</Text></Pressable>
        <Text variant="h2">Arkadaş Ekle</Text>
        <View style={{ width: 56 }} />
      </View>

      <View style={styles.container}>
        <TextInput placeholder="Kullanıcı adı veya e-posta" value={emailOrName} onChangeText={setEmailOrName} style={styles.input} autoCapitalize="none" />
        <Pressable style={styles.btn} onPress={sendRequest} disabled={loading}>
          <Text style={{ color: "#fff" }}>{loading ? "Gönderiliyor..." : "İstek Gönder"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  back: { padding: 8 },
  container: { padding: 16 },
  input: { height: 50, borderRadius: 12, borderWidth: 1, borderColor: "#eee", paddingHorizontal: 12, marginBottom: 12 },
  btn: { backgroundColor: "#6C5CE7", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
});
