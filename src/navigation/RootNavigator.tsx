import React, { useEffect, useMemo, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useUser } from "../context/UserContext";
import { getBool } from "../storage/local";
import { STORAGE_KEYS } from "../storage/keys";
import { Routes } from "./routes";

import { SplashScreen } from "../screens/splash/SplashScreen";
import { OnboardingScreen } from "../screens/onboarding/OnboardingScreen";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { HomeScreen } from "../screens/main/HomeScreen";
import { TasksScreen } from "../screens/main/TasksScreen";
import { FocusScreen } from "../screens/main/FocusScreen";
import { OdiChatScreen } from "../screens/main/OdiChatScreen";
import { StatsScreen } from "../screens/main/StatsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { PrivacyScreen } from "../screens/stack/PrivacyScreen";
import { SettingsScreen } from "../screens/stack/SettingsScreen";
import { NotificationsScreen } from "../screens/stack/NotificationsScreen";
import { PremiumScreen } from "../screens/stack/PremiumScreen";
import { GardenScreen } from "../screens/stack/GardenScreen";
import { FriendsScreen } from "../screens/stack/FriendsScreen";

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
      <Tab.Screen name={Routes.Friends} component={FriendsScreen} />
    </Tab.Navigator>
  );
}

export const RootNavigator: React.FC = () => {
  const { user, loading: userLoading } = useUser();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let mounted = true;
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
    };
  }, []);

  const initialRoute = useMemo(() => {
    if (userLoading || booting) return Routes.Splash;
    if (!user) return Routes.Login;
    if (!onboarded) return Routes.Onboarding;
    return Routes.RootTabs;
  }, [user, userLoading, onboarded, booting]);

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name={Routes.Splash} component={SplashScreen} />
      <Stack.Screen name={Routes.Onboarding} component={OnboardingScreen} />
      <Stack.Screen name={Routes.Login} component={LoginScreen} />
      <Stack.Screen name={Routes.Register} component={RegisterScreen} />
      <Stack.Screen name={Routes.RootTabs} component={MainTabs} />
      <Stack.Screen name={Routes.Notifications} component={NotificationsScreen} />
      <Stack.Screen name={Routes.Settings} component={SettingsScreen} />
      <Stack.Screen name={Routes.Privacy} component={PrivacyScreen} />
      <Stack.Screen name={Routes.Garden} component={GardenScreen} />
      <Stack.Screen name={Routes.Premium} component={PremiumScreen} />
      <Stack.Screen name={Routes.Friends} component={FriendsScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
