import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";
import { signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";

function mapAuthError(code: string | undefined) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "E-posta veya şifre hatalı.";
    case "auth/invalid-email":
      return "Geçersiz e-posta.";
    default:
      return "Bir hata oluştu. Tekrar dene.";
  }
}

export const LoginScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    setErr(null);
    if (!email.trim() || !password.trim()) {
      setErr("Lütfen e-posta ve şifre girin.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Başarılı giriş: navigation reset ile root'a geç
      if (auth.currentUser && auth.currentUser.email && !auth.currentUser.displayName) {
        const name = auth.currentUser.email.split("@")[0];
        updateProfile(auth.currentUser, { displayName: name }).catch(() => {
          // isteğe bağlı: hata logu, ama kullanıcı akışını bozmayın
        });
      }
      nav.reset({ index: 0, routes: [{ name: Routes.MainTabs as any }] });
      return;
    } catch (e: any) {
      setErr(e?.message || mapAuthError(e?.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <Text variant="h1">Giriş Yap</Text>
      <Input
        placeholder="Email"
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
      {err ? <Text variant="muted" style={{ color: "red" }}>{err}</Text> : null}
      <Button title={loading ? "Yükleniyor..." : "Giriş Yap"} onPress={onLogin} disabled={loading} />
      <View style={{ marginTop: 12, alignItems: "center" }}>
        <TouchableOpacity onPress={() => nav.navigate(Routes.Register as any)}>
          <Text variant="muted">Kayıt Ol</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({ container: { padding: 16 } });
