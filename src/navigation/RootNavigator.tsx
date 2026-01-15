import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Routes } from "./routes";
import { SplashScreen } from "../screens/splash/SplashScreen";
import { WelcomeScreen } from "../screens/onboarding/WelcomeScreen";
import { OnboardingScreen } from "../screens/onboarding/OnboardingScreen";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { HomeScreen } from "../screens/main/HomeScreen";
import { TasksScreen } from "../screens/main/TasksScreen";
import { FocusScreen } from "../screens/main/FocusScreen";
import { OdiChatScreen } from "../screens/main/OdiChatScreen";
import { StatsScreen } from "../screens/main/StatsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { NotificationsScreen } from "../screens/NotificationsScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { PrivacyScreen } from "../screens/PrivacyScreen";
import { GardenScreen } from "../screens/stack/GardenScreen";
import { FriendsScreen } from "../screens/stack/FriendsScreen";
import { AchievementsScreen } from "../screens/stack/AchievementsScreen";
import { PremiumScreen } from "../screens/stack/PremiumScreen";
import { EditTaskScreen } from "../screens/main/EditTaskScreen";
import { MenuScreen } from "../screens/stack/MenuScreen";
import { auth } from "../firebase/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { getBool } from "../storage/local";
import { STORAGE_KEYS } from "../storage/keys";
import { Pressable, Text as RNText } from "react-native";
import { useI18n } from "../i18n/I18nProvider";

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const AuthInner = createNativeStackNavigator();

function MainTabs() {
  const { t } = useI18n();

  return (
    <Tab.Navigator
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerTitleAlign: "center",
        headerLeft: () => (
          <Pressable onPress={() => navigation.navigate(Routes.Notifications as any)} style={{ padding: 8 }}>
            <RNText style={{ fontSize: 18 }}>🔔</RNText>
          </Pressable>
        ),
        headerRight: () => (
          <Pressable onPress={() => navigation.navigate("Menu" as any)} style={{ padding: 8 }}>
            <RNText style={{ fontSize: 18 }}>☰</RNText>
          </Pressable>
        ),
      })}
    >
      <Tab.Screen
        name={Routes.Home}
        component={HomeScreen}
        options={{ title: t("home"), tabBarLabel: t("home"), headerShown: false }}
      />
      <Tab.Screen
        name={Routes.Tasks}
        component={TasksScreen}
        options={{ title: t("tasks"), tabBarLabel: t("tasks") }}
      />
      <Tab.Screen
        name={Routes.Focus}
        component={FocusScreen}
        options={{ title: t("focus"), tabBarLabel: t("focus") }}
      />
      <Tab.Screen
        name={Routes.Odi}
        component={OdiChatScreen}
        options={{ title: t("odi"), tabBarLabel: t("odi") }}
      />
      <Tab.Screen
        name={Routes.Friends}
        component={FriendsScreen}
        options={{ title: "Arkadaşlar", tabBarLabel: "Arkadaşlar" }}
      />
      <Tab.Screen
        name={Routes.Stats}
        component={StatsScreen}
        options={{ title: t("stats"), tabBarLabel: t("stats") }}
      />
      <Tab.Screen
        name={Routes.Profile}
        component={ProfileScreen}
        options={{ title: t("profile"), tabBarLabel: t("profile") }}
      />
    </Tab.Navigator>
  );
}

function AuthStackComponent() {
  return (
    <AuthInner.Navigator screenOptions={{ headerShown: false }}>
      <AuthInner.Screen name={Routes.Login} component={LoginScreen} />
      <AuthInner.Screen name={Routes.Register} component={RegisterScreen} />
    </AuthInner.Navigator>
  );
}

export const RootNavigator: React.FC = () => {
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const done = await getBool(STORAGE_KEYS.ONBOARDING_DONE, false);
      if (!mounted) return;
      setOnboarded(done);
    })();

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setBooting(false);
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const initialRoute = booting ? Routes.Splash : !user ? Routes.Welcome : onboarded ? Routes.MainTabs : Routes.Welcome;

  return (
    <RootStack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <RootStack.Screen name={Routes.Splash} component={SplashScreen} />
      <RootStack.Screen name={Routes.Welcome} component={WelcomeScreen} />
      <RootStack.Screen name={Routes.Onboarding} component={OnboardingScreen} />
      <RootStack.Screen name={Routes.AuthStack} component={AuthStackComponent} />
      <RootStack.Screen name={Routes.MainTabs} component={MainTabs} />
      <RootStack.Screen name="Menu" component={MenuScreen} options={{ headerShown: true, title: "Menü" }} />
      <RootStack.Screen name={Routes.Notifications} component={NotificationsScreen} options={{ headerShown: true, title: "Bildirimler" }} />
      <RootStack.Screen name={Routes.Settings} component={SettingsScreen} options={{ headerShown: true, title: "Ayarlar" }} />
      <RootStack.Screen name={Routes.Privacy} component={PrivacyScreen} options={{ headerShown: true, title: "Gizlilik" }} />
      <RootStack.Screen name={Routes.Garden} component={GardenScreen} options={{ headerShown: true, title: "Bahçe" }} />
      <RootStack.Screen name={Routes.Friends} component={FriendsScreen} />
      <RootStack.Screen name={Routes.Achievements} component={AchievementsScreen} />
      <RootStack.Screen name={Routes.Premium} component={PremiumScreen} />
      <RootStack.Screen name={Routes.EditTask} component={EditTaskScreen} options={{ headerShown: true, title: "Görevi Düzenle" }} />
    </RootStack.Navigator>
  );
};
