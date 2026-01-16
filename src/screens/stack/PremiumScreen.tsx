import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Pressable, Alert, ScrollView, Switch, Text as RNText } from "react-native";
import { Screen } from "../../ui/Screen";
import { Text } from "../../ui/Text";
import { useTheme } from "../../ui/theme/ThemeProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../../firebase/firebase";
import { loadFocusState } from "../../focus/focusStore";
import { getBasePrices, formatPrice, getFlowerDiscountPercent, applyDiscount, type PlanId } from "../../features/premium/premiumPricing";

const TRIAL_KEY = "premium_trial_start_v1";

export const PremiumScreen: React.FC = () => {
  const { colors } = useTheme();
  const [plan, setPlan] = useState<PlanId>("monthly");
  const [student, setStudent] = useState<boolean>(false);
  const [trialStartISO, setTrialStartISO] = useState<string | null>(null);
  const [flowersCount, setFlowersCount] = useState<number>(0);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(TRIAL_KEY);
      if (raw) setTrialStartISO(raw);
      try {
        const st = await loadFocusState();
        setFlowersCount(Array.isArray(st.flowers) ? st.flowers.length : 0);
      } catch {
        setFlowersCount(0);
      }
    })();
  }, []);

  const startTrial = async () => {
    const iso = new Date().toISOString();
    await AsyncStorage.setItem(TRIAL_KEY, iso);
    setTrialStartISO(iso);
    Alert.alert("Demo", "Deneme premium başlatıldı (demo)");
  };

  const endTrial = async () => {
    await AsyncStorage.removeItem(TRIAL_KEY);
    setTrialStartISO(null);
  };

  const trialInfo = useMemo(() => {
    if (!trialStartISO) return null;
    const start = new Date(trialStartISO).getTime();
    const diffDays = Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24));
    const remaining = Math.max(0, 15 - diffDays);
    return { start, diffDays, remaining };
  }, [trialStartISO]);

  const userEmail = auth.currentUser?.email ?? "";

  const isStudentEmail = (email: string) => {
    if (!email) return false;
    const lc = email.toLowerCase();
    return lc.includes(".edu") || lc.includes(".ac.") || lc.includes(".edu.tr") || lc.includes("@ogr.");
  };

  const onUpgrade = () => {
    if (student && !isStudentEmail(userEmail)) {
      Alert.alert("Öğrenci doğrulama", "Öğrenci e-postası gerekli");
      return;
    }
    Alert.alert("Demo", "Satın alma akışı demo amaçlıdır.");
  };

  const base = getBasePrices(student);
  const flowerDiscount = getFlowerDiscountPercent(flowersCount);

  const priceMonthly = applyDiscount(base.monthly, flowerDiscount);
  const priceYearly = applyDiscount(base.yearly, flowerDiscount);

  const priceText = plan === "monthly" ? formatPrice(priceMonthly) : formatPrice(priceYearly);

  const monthlyOld = formatPrice(base.monthly);
  const yearlyOld = formatPrice(base.yearly);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text variant="h2">Premium</Text>
        <Text variant="muted" style={{ marginTop: 6, marginBottom: 12 }}>
          Odaki Premium ile daha fazlası
        </Text>

        <View style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={{ fontWeight: "800", fontSize: 18 }}>Odaki Premium ile daha fazlası</Text>
          <Text variant="muted" style={{ marginTop: 8 }}>
            Ek özellikler, özel çiçekler ve gelişmiş istatistikler.
          </Text>

          {trialInfo ? (
            <Text variant="muted" style={{ marginTop: 8 }}>
              Deneme: {trialInfo.remaining} gün kaldı
            </Text>
          ) : null}
        </View>

        <View style={{ height: 14 }} />

        <View style={[styles.features, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>Özellikler</Text>
          <View style={styles.featureRow}><RNText>•</RNText><Text style={styles.featureText}>Sınırsız izinli uygulama</Text></View>
          <View style={styles.featureRow}><RNText>•</RNText><Text style={styles.featureText}>Premium çiçekler (Lotus, Ayçiçeği, Orkide)</Text></View>
          <View style={styles.featureRow}><RNText>•</RNText><Text style={styles.featureText}>Gelişmiş istatistikler</Text></View>
          <View style={styles.featureRow}><RNText>•</RNText><Text style={styles.featureText}>Oturum başına 1 ayar atlama hakkı</Text></View>
        </View>

        <View style={{ height: 16 }} />

        {/* Öğrenci toggle card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={{ fontWeight: "700" }}>Öğrenci indirimi</Text>
              <Text variant="muted" style={{ marginTop: 6, opacity: student ? 1 : 0.6 }}>
                Öğrenci e-postasıyla kayıt olanlara özel.
              </Text>
            </View>
            <Switch value={student} onValueChange={(v) => setStudent(v)} />
          </View>
        </View>

        <View style={{ height: 12 }} />

        {/* Planlar */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Pressable onPress={() => setPlan("monthly")} style={[styles.pricingCard, { borderColor: colors.border, backgroundColor: plan === "monthly" ? colors.primary : "#fff" }]}>
            <Text style={plan === "monthly" ? { color: "#fff" } : { color: "#000", fontWeight: "700" }}>Aylık</Text>
            <Text variant="muted" style={plan === "monthly" ? { color: "#fff", marginTop: 6 } : { marginTop: 6 }}>
              {plan === "monthly" && flowerDiscount > 0 ? monthlyOld : ""}
            </Text>
            <Text style={plan === "monthly" ? { color: "#fff", fontSize: 22, fontWeight: "800", marginTop: 6 } : { fontSize: 22, fontWeight: "800", marginTop: 6 }}>
              {formatPrice(priceMonthly)}
            </Text>
            <Text variant="muted" style={plan === "monthly" ? { color: "#fff", marginTop: 6 } : { marginTop: 6 }}>
              / ay
            </Text>
          </Pressable>

          <Pressable onPress={() => setPlan("yearly")} style={[styles.pricingCard, { borderColor: colors.border, backgroundColor: plan === "yearly" ? colors.primary : "#fff" }]}>
            <Text style={plan === "yearly" ? { color: "#fff" } : { color: "#000", fontWeight: "700" }}>Yıllık</Text>
            <Text variant="muted" style={plan === "yearly" ? { color: "#fff", marginTop: 6 } : { marginTop: 6 }}>
              {plan === "yearly" && flowerDiscount > 0 ? yearlyOld : ""}
            </Text>
            <Text style={plan === "yearly" ? { color: "#fff", fontSize: 22, fontWeight: "800", marginTop: 6 } : { fontSize: 22, fontWeight: "800", marginTop: 6 }}>
              {formatPrice(priceYearly)}
            </Text>
            <Text variant="muted" style={plan === "yearly" ? { color: "#fff", marginTop: 6 } : { marginTop: 6 }}>
              / yıl
            </Text>
            <View style={styles.badgeRight}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>En avantajlı</Text>
            </View>
          </Pressable>
        </View>

        <View style={{ height: 12 }} />

        {/* Çiçek indirimi info */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={{ fontWeight: "700" }}>Çiçek indirimi</Text>
          <Text variant="muted" style={{ marginTop: 8 }}>3 çiçek → %10</Text>
          <Text variant="muted" style={{ marginTop: 4 }}>10 çiçek → %25</Text>
          {getFlowerDiscountPercent(flowersCount) > 0 ? (
            <View style={styles.pill}>
              <Text style={{ fontWeight: "700" }}>Aktif: %{getFlowerDiscountPercent(flowersCount)}</Text>
            </View>
          ) : null}
          <Text variant="muted" style={{ marginTop: 8 }}>Sahip olduğun çiçek: {flowersCount}</Text>
          <Text variant="muted" style={{ marginTop: 4 }}>Uygulanan indirim: %{getFlowerDiscountPercent(flowersCount)}</Text>
        </View>

        <View style={{ height: 16 }} />

        <Pressable onPress={onUpgrade} style={[styles.primaryCta, { backgroundColor: colors.primary }]}>
          <Text style={{ color: "#fff", fontWeight: "800" }}>Premium'a Geç</Text>
        </Pressable>

        <Pressable onPress={trialInfo ? async () => { await endTrial(); Alert.alert("Demo", "Deneme iptal edildi"); } : startTrial } style={[styles.secondaryCta, { borderColor: colors.border }]}>
          <Text variant="muted">{trialInfo ? `Denemeyi Sonlandır (${trialInfo.remaining} gün kaldı)` : "15 Gün Ücretsiz Dene"}</Text>
        </Pressable>

      </ScrollView>
    </Screen>
  );
};

export default PremiumScreen;

const styles = StyleSheet.create({
  hero: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  features: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  featureText: { marginLeft: 6, color: "#374151" },
  card: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  pricingCard: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    alignItems: "center",
    flex: 1,
  },
  badgeRight: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#FFB800",
    marginTop: 12,
  },
  pill: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 8,
  },
  primaryCta: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryCta: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    backgroundColor: "#fff",
  },
});
