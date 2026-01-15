import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../../firebase/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

function mapAuthError(code: string | undefined) {
  switch (code) {
    case "auth/email-already-in-use":
      return "Bu e-posta zaten kayıtlı.";
    case "auth/invalid-email":
      return "Geçersiz e-posta.";
    case "auth/weak-password":
      return "Şifre çok zayıf (en az 6 karakter).";
    default:
      return "Bir hata oluştu. Tekrar dene.";
  }
}

export const RegisterScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    setErr(null);
    if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) {
      setErr("Lütfen tüm alanları doldurun.");
      return;
    }
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = userCred.user.uid;
      const avatarEmoji = "🙂";
      // create user doc
      await setDoc(doc(db, "users", uid), {
        uid,
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        avatarEmoji,
        createdAt: serverTimestamp(),
      });

      if (auth.currentUser && auth.currentUser.email && !auth.currentUser.displayName) {
        const name = auth.currentUser.email.split("@")[0];
        updateProfile(auth.currentUser, { displayName: name }).catch(() => {
          // hata yutuluyor, UI akışı etkilenmesin
        });
      }

      nav.replace(Routes.MainTabs as any);
    } catch (e: any) {
      const code = e?.code;
      setErr(mapAuthError(code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <Text variant="h1">Kayıt Ol</Text>

      <Input
        placeholder="Ad Soyad"
        value={name}
        onChangeText={(t) => {
          setName(t);
          setErr(null);
        }}
      />
      <Input
        placeholder="Kullanıcı Adı"
        value={username}
        onChangeText={(t) => {
          setUsername(t);
          setErr(null);
        }}
      />
      <Input
        placeholder="E-posta"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          setErr(null);
        }}
        keyboardType="email-address"
      />
      <Input
        placeholder="Şifre"
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          setErr(null);
        }}
        secureTextEntry
      />

      {err ? <Text variant="muted" style={{ color: "red", marginBottom: 8 }}>{err}</Text> : null}

      <Button title={loading ? "Kayıt..." : "Kayıt Ol"} onPress={onRegister} />

      <View style={{ marginTop: 12, alignItems: "center" }}>
        <TouchableOpacity onPress={() => nav.navigate(Routes.Login as any)}>
          <Text variant="muted">Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
});
