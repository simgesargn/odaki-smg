import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SplashScreen } from "../screens/splash/SplashScreen";
import { OnboardingScreen } from "../screens/onboarding/OnboardingScreen";
import { WelcomeScreen } from "../screens/onboarding/WelcomeScreen";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { HomeScreen } from "../screens/main/HomeScreen";
import { TasksScreen } from "../screens/main/TasksScreen";
import { FocusScreen } from "../screens/main/FocusScreen";
import { OdiChatScreen } from "../screens/main/OdiChatScreen";
import { StatsScreen } from "../screens/main/StatsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { getBool } from "../storage/local";
import { STORAGE_KEYS } from "../storage/keys";
import { auth } from "../firebase/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { Text as RNText } from "react-native";
import { useI18n } from "../i18n/I18nProvider";
import { colors } from "../ui/theme";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  const { t } = useI18n();
  const iconMap: Record<string, string> = {
    Home: "🏠",
    Tasks: "✅",
    Focus: "⏱️",
    Odi: "🤖",
    Stats: "📊",
    Profile: "👤",
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitleAlign: "center",
        tabBarIcon: ({ focused }) => {
          const emoji = iconMap[route.name] ?? "•";
          return <RNText style={{ fontSize: 18, opacity: focused ? 1 : 0.55 }}>{emoji}</RNText>;
        },
        tabBarLabel: ({ focused }) => (
          <RNText style={{ fontSize: 11, marginTop: 2, fontWeight: focused ? "700" : "600", color: focused ? colors.primary : colors.muted }}>
            {route.name}
          </RNText>
        ),
        tabBarStyle: { height: 88, paddingTop: 10, paddingBottom: 24, backgroundColor: "#fff", borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Tasks" component={TasksScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Focus" component={FocusScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Odi" component={OdiChatScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Stats" component={StatsScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

export const RootNavigator: React.FC = () => {
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [onboardingReady, setOnboardingReady] = useState(false);

  useEffect(() => {
    // tek auth listener
    let mounted = true;
    const unsub = onAuthStateChanged(auth, (u: User | null) => {
      if (!mounted) return;
      setSignedIn(!!u);
      setAuthReady(true);
    });
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  useEffect(() => {
    // onboarding flag oku via project helper
    let mounted = true;
    (async () => {
      try {
        const done = await getBool(STORAGE_KEYS.ONBOARDING_DONE, false);
        if (!mounted) return;
        setOnboardingDone(Boolean(done));
      } catch {
        if (!mounted) return;
        setOnboardingDone(false);
      } finally {
        if (!mounted) return;
        setOnboardingReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // splash while either check is not ready
  if (!authReady || !onboardingReady) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {signedIn ? (
        // kullanıcı girişli → ana tab'leri tek bir screen olarak sun
        <Stack.Screen name="RootTabs" component={MainTabs} />
      ) : onboardingDone ? (
        // onboarding tamamlanmış ama giriş yapılmamış → auth ekranları
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        // onboarding yapılmamış → onboarding ekranı
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
