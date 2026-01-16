import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable, Text, KeyboardAvoidingView, Platform } from "react-native";
import AuthHero from "../ui/components/AuthHero";
import { theme } from "../ui/theme";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../navigation/routes";
import { signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase/firebase";

function mapAuthError(code: string | undefined) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "E-posta veya şifre hatalı.";
    case "auth/invalid-email":
      return "Geçersiz e-posta.";
    default:
      return "Bir hata oluştu. Tekrar deneyin.";
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
      // navigate to main tab flow (RootTabs)
      navigation.reset({ index: 0, routes: [{ name: Routes.RootTabs as any }] });
      return;
    } catch (e: any) {
      setErr(e?.message || mapAuthError(e?.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.colors.background }} behavior={Platform.select({ ios: "padding", android: undefined })}>
      <AuthHero emoji="👋" title="Tekrar hoş geldin" subtitle="Hedeflerini toparlayalım. 1 dakikada giriş yap." />

      <View style={styles.container}>
        <View style={[styles.card, theme.shadow?.card]}>
          <Text style={styles.label}>E-posta</Text>
          <TextInput
            style={styles.input}
            placeholder="you@ornek.com"
            placeholderTextColor={theme.colors.muted}
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
            placeholderTextColor={theme.colors.muted}
            secureTextEntry
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setErr(null);
            }}
          />

          {err ? <Text style={styles.errorText}>{err}</Text> : null}

          <Pressable style={[styles.primaryBtn, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading}>
            <Text style={styles.btnText}>{loading ? "Yükleniyor..." : "Giriş Yap"}</Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate(Routes.Register as any)} style={styles.bottomRow}>
            <Text style={styles.bottomText}>
              Hesabın yok mu? <Text style={{ color: theme.colors.primary, fontWeight: "700" }}>Kayıt Ol</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "flex-start", alignItems: "center" },
  card: {
    width: "92%",
    marginTop: 18,
    backgroundColor: theme.colors.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  label: { fontSize: 13, color: theme.colors.muted, marginBottom: 6 },
  input: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    fontSize: 16,
    color: theme.colors.text,
  },
  errorText: { color: theme.colors.danger, marginTop: 8 },

  primaryBtn: {
    marginTop: 16,
    backgroundColor: theme.colors.primary,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 16 },

  bottomRow: { marginTop: 12, alignItems: "center" },
  bottomText: { color: theme.colors.muted, fontSize: 14 },
});
