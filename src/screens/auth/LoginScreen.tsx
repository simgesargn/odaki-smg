import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable, Text, Alert } from "react-native";
import { theme } from "../../ui/theme";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";
import { signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../firebase/firebase";

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
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErr(null);
    if (!email.trim() || !password.trim()) {
      setErr("Lütfen e-posta ve şifre girin.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);

      if (auth.currentUser && auth.currentUser.email && !auth.currentUser.displayName) {
        const name = auth.currentUser.email.split("@")[0];
        updateProfile(auth.currentUser, { displayName: name }).catch(() => {});
      }

      // başarılı giriş -> reset to RootTabs
      navigation.reset({ index: 0, routes: [{ name: Routes.RootTabs as any }] });
      return;
    } catch (e: any) {
      console.log("LOGIN_ERROR", e);
      const readable = e?.code ? mapAuthError(e?.code) : "Bir hata oluştu.";
      Alert.alert("Giriş başarısız", readable);
      setErr(readable);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>👋</Text>
        <Text style={styles.heroTitle}>Tekrar hoş geldin</Text>
        <Text style={styles.heroSubtitle}>Hedeflerini toparlayalım. 1 dakikada giriş yap.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>E-posta</Text>
        <TextInput
          style={styles.input}
          placeholder="you@ornek.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            setErr(null);
          }}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Şifre</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            setErr(null);
          }}
        />

        {err ? <Text style={{ color: "red", marginTop: 8 }}>{err}</Text> : null}

        <Pressable style={styles.primaryBtn} onPress={handleLogin} disabled={loading}>
          <Text style={styles.btnText}>{loading ? "Yükleniyor..." : "Giriş Yap"}</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate(Routes.Register as any)} style={styles.link}>
          <Text style={{ color: theme.colors.primary }}>Hesabın yok mu? Kayıt Ol</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  hero: { alignItems: "center", paddingTop: theme.spacing.xl, paddingBottom: theme.spacing.md },
  heroEmoji: { fontSize: 48 },
  heroTitle: { marginTop: 12, fontSize: 28, fontWeight: "900", color: theme.colors.text },
  heroSubtitle: { marginTop: 6, fontSize: 14, color: theme.colors.muted, textAlign: "center", paddingHorizontal: 24 },

  card: { margin: 20, backgroundColor: theme.colors.card, borderRadius: theme.radius.md, padding: 18, ...theme.shadow.card, borderWidth: 1, borderColor: theme.colors.border },
  label: { fontSize: 13, color: theme.colors.muted, marginBottom: 6 },
  input: { minHeight: 52, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 14, backgroundColor: "#fff" },

  primaryBtn: { marginTop: 16, backgroundColor: theme.colors.primary, height: 54, borderRadius: 16, alignItems: "center", justifyContent: "center", ...theme.shadow.card },
  btnText: { color: "#fff", fontWeight: "800" },
  link: { marginTop: 12, alignItems: "center" },
});
