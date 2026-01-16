import React, { useEffect, useMemo, useState } from "react";
import { Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useUser } from "../context/UserContext";
import { getBool } from "../storage/local";
import { STORAGE_KEYS } from "../storage/keys";
import { Routes } from "./routes";
import { theme } from "../ui/theme";

import { SplashScreen } from "../screens/splash/SplashScreen";
import { OnboardingScreen } from "../screens/onboarding/OnboardingScreen";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { HomeScreen } from "../screens/main/HomeScreen";
import { TasksScreen } from "../screens/main/TasksScreen";
import { FocusScreen } from "../screens/main/FocusScreen";
import { OdiChatScreen } from "../screens/main/OdiChatScreen";
import { StatsScreen } from "../screens/main/StatsScreen";
import { ProfileScreen } from "../screens/main/ProfileScreen";

// stack screens (stack altında duran ekranlar)
import { PrivacyScreen } from "../screens/stack/PrivacyScreen";
import { SettingsScreen } from "../screens/stack/SettingsScreen";
import { NotificationsScreen } from "../screens/stack/NotificationsScreen";
import { PremiumScreen } from "../screens/stack/PremiumScreen";
import { GardenScreen } from "../screens/stack/GardenScreen";
import { MenuScreen } from "../screens/stack/MenuScreen";

// optional / extras (may exist in project)
import { AchievementsScreen } from "../screens/stack/AchievementsScreen";
import { FocusSettingsScreen } from "../screens/stack/FocusSettingsScreen";
import { FriendsActivityScreen } from "../screens/stack/FriendsActivityScreen";
import { FriendsRequestsScreen } from "../screens/stack/FriendsRequestsScreen";
import { FriendsLeaderboardScreen } from "../screens/stack/FriendsLeaderboardScreen";
import { FriendsScreen } from "../screens/stack/FriendsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab bar tek merkezde, kısa label + emoji ikon + stil
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarStyle: { height: 66, paddingBottom: 8 },
        tabBarLabelStyle: { fontSize: 10 },
        tabBarItemStyle: { paddingTop: 4 },
      }}
    >
      <Tab.Screen
        name={Routes.Home}
        component={HomeScreen}
        options={{
          tabBarLabel: "Ana",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name={Routes.Tasks}
        component={TasksScreen}
        options={{
          tabBarLabel: "Görev",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>✅</Text>,
        }}
      />
      <Tab.Screen
        name={Routes.Focus}
        component={FocusScreen}
        options={{
          tabBarLabel: "Odak",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>⏳</Text>,
        }}
      />
      <Tab.Screen
        name={Routes.Odi}
        component={OdiChatScreen}
        options={{
          tabBarLabel: "Odi",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>💬</Text>,
        }}
      />
      <Tab.Screen
        name={Routes.Stats}
        component={StatsScreen}
        options={{
          tabBarLabel: "İstat",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name={Routes.Profile}
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profil",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>👤</Text>,
        }}
      />
      <Tab.Screen
        name={Routes.Friends}
        component={FriendsScreen}
        options={{
          tabBarLabel: "Ark",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>👥</Text>,
        }}
      />
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

      {/* Menu opens as modal */}
      <Stack.Screen name={Routes.Menu} component={MenuScreen} options={{ presentation: "transparentModal" }} />

      {/* Stack screens — overrides for header on screens that need back button */}
      <Stack.Screen
        name={Routes.Notifications}
        component={NotificationsScreen}
        options={{ headerShown: true, headerBackTitleVisible: false }}
      />
      <Stack.Screen
        name={Routes.Settings}
        component={SettingsScreen}
        options={{ headerShown: true, headerBackTitleVisible: false }}
      />
      <Stack.Screen
        name={Routes.Privacy}
        component={PrivacyScreen}
        options={{ headerShown: true, headerBackTitleVisible: false }}
      />
      <Stack.Screen
        name={Routes.Garden}
        component={GardenScreen}
        options={{ headerShown: true, headerBackTitleVisible: false }}
      />
      <Stack.Screen
        name={Routes.Premium}
        component={PremiumScreen}
        options={{ headerShown: true, headerBackTitleVisible: false }}
      />

      {/* Optional/extra screens (if present in project) */}
      {typeof AchievementsScreen !== "undefined" && (
        <Stack.Screen
          name={Routes.Achievements}
          component={AchievementsScreen}
          options={{ headerShown: true, headerBackTitleVisible: false }}
        />
      )}
      {typeof FocusSettingsScreen !== "undefined" && (
        <Stack.Screen name={Routes.FocusSettings} component={FocusSettingsScreen} />
      )}

      {typeof FriendsActivityScreen !== "undefined" && <Stack.Screen name={Routes.FriendsActivity} component={FriendsActivityScreen} />}
      {typeof FriendsRequestsScreen !== "undefined" && <Stack.Screen name={Routes.FriendsRequests} component={FriendsRequestsScreen} />}
      {typeof FriendsLeaderboardScreen !== "undefined" && (
        <Stack.Screen name={Routes.FriendsLeaderboard} component={FriendsLeaderboardScreen} />
      )}
    </Stack.Navigator>
  );
};
