import React, { useState } from "react";
import { View, TextInput, StyleSheet, Pressable, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import AuthHero from "../../ui/components/AuthHero";
import { theme } from "../../ui/theme";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "../../navigation/routes";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { Text } from "../../ui/Text";

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email.trim() || !password.trim()) return Alert.alert("Hata", "E-posta ve şifre gerekli.");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigation.reset({ index: 0, routes: [{ name: Routes.RootTabs as any }] });
    } catch (e: any) {
      const msg = e?.code?.includes("user-not-found") ? "Hesap bulunamadı." : e?.message || "Giriş başarısız.";
      Alert.alert("Giriş hatası", msg);
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
            value={email}
            onChangeText={(t) => setEmail(t)}
            placeholder="you@ornek.com"
            placeholderTextColor={theme.colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Şifre</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={(t) => setPassword(t)}
            placeholder="••••••••"
            placeholderTextColor={theme.colors.muted}
            secureTextEntry
          />

          <Pressable style={[styles.primaryBtn, loading && styles.btnDisabled]} onPress={onLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Giriş Yap</Text>}
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
  primaryBtn: {
    marginTop: 18,
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
