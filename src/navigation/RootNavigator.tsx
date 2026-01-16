import React, { useEffect, useMemo, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { onAuthStateChanged, User } from "firebase/auth";

import { Routes } from "./routes";
import { auth } from "../firebase/firebase";

import { SplashScreen } from "../screens/splash/SplashScreen";
import { OnboardingScreen } from "../screens/onboarding/OnboardingScreen";

// ZORUNLU: bu iki import sadece bu yoldan gelsin
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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name={Routes.Home} component={HomeScreen} />
      <Tab.Screen name={Routes.Tasks} component={TasksScreen} />
      <Tab.Screen name={Routes.Focus} component={FocusScreen} />
      <Tab.Screen name={Routes.Odi} component={OdiChatScreen} />
      <Tab.Screen name={Routes.Stats} component={StatsScreen} />
      <Tab.Screen name={Routes.Profile} component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export const RootNavigator: React.FC = () => {
  const [booting, setBooting] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    let mounted = true;
    const unsub = onAuthStateChanged(auth, (u: User | null) => {
      if (!mounted) return;
      setSignedIn(!!u);
    });

    (async () => {
      try {
        const done = await getBool(STORAGE_KEYS.ONBOARDING_DONE, false);
        if (!mounted) return;
        setOnboarded(Boolean(done));
      } catch {
        if (!mounted) return;
        setOnboarded(false);
      } finally {
        if (!mounted) return;
        setBooting(false);
      }
    })();

    return () => {
      mounted = false;
      try {
        unsub();
      } catch {
        // ignore
      }
    };
  }, []);

  const initialRouteName = useMemo(() => {
    if (booting) return Routes.Splash;
    if (!onboarded) return Routes.Onboarding;
    if (!signedIn) return Routes.Login;
    return Routes.RootTabs;
  }, [booting, onboarded, signedIn]);

  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
      <Stack.Screen name={Routes.Splash} component={SplashScreen} />
      <Stack.Screen name={Routes.Onboarding} component={OnboardingScreen} />
      <Stack.Screen name={Routes.Login} component={LoginScreen} />
      <Stack.Screen name={Routes.Register} component={RegisterScreen} />
      <Stack.Screen name={Routes.RootTabs} component={MainTabs} />
      {/* Diğer stack ekranlar (Settings, Notifications vb.) varsa buraya ekleyin */}
    </Stack.Navigator>
  );
};

export default RootNavigator;
