import React, { useState } from "react";
import { View, TextInput, StyleSheet, Pressable, Text, KeyboardAvoidingView, Platform, Alert } from "react-native";
import AuthHero from "../../ui/components/AuthHero";
import { theme } from "../../ui/theme";
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
  const navigation = useNavigation<any>();
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
      await setDoc(
        doc(db, "users", uid),
        {
          uid,
          email: email.trim(),
          name: name.trim(),
          username: username.trim(),
          avatarEmoji,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      if (auth.currentUser && auth.currentUser.email && !auth.currentUser.displayName) {
        const displayName = auth.currentUser.email.split("@")[0];
        updateProfile(auth.currentUser, { displayName }).catch(() => {});
      }

      // başarılı kayıt -> RootTabs'e reset
      navigation.reset({ index: 0, routes: [{ name: Routes.RootTabs as any }] });
      return;
    } catch (e: any) {
      console.log("REGISTER_ERROR", e);
      const readable = e?.code ? mapAuthError(e?.code) : "Bir hata oluştu.";
      Alert.alert("Kayıt başarısız", readable);
      setErr(readable);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.colors.background }} behavior={Platform.select({ ios: "padding", android: undefined })}>
      <AuthHero emoji="✨" title="Hesabını oluştur" subtitle="Odak, görev ve Odi seni bekliyor." />

      <View style={styles.container}>
        <View style={[styles.card, theme.shadow?.card]}>
          <Text style={styles.label}>Ad Soyad</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={(t) => {
              setName(t);
              setErr(null);
            }}
            placeholder="Ad Soyad"
            placeholderTextColor={theme.colors.muted}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Kullanıcı Adı</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={(t) => {
              setUsername(t);
              setErr(null);
            }}
            placeholder="kullaniciadi"
            placeholderTextColor={theme.colors.muted}
            autoCapitalize="none"
          />

          <Text style={[styles.label, { marginTop: 16 }]}>E-posta</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setErr(null);
            }}
            placeholder="you@ornek.com"
            placeholderTextColor={theme.colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Şifre</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setErr(null);
            }}
            placeholder="••••••••"
            placeholderTextColor={theme.colors.muted}
            secureTextEntry
          />

          {err ? <Text style={styles.errorText}>{err}</Text> : null}

          <Pressable style={[styles.primaryBtn, loading && styles.btnDisabled]} onPress={onRegister} disabled={loading}>
            <Text style={styles.btnText}>{loading ? "Kayıt oluyor..." : "Kayıt Ol"}</Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate(Routes.Login as any)} style={styles.bottomRow}>
            <Text style={styles.bottomText}>
              Zaten hesabın var mı? <Text style={{ color: theme.colors.primary, fontWeight: "700" }}>Giriş Yap</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

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
