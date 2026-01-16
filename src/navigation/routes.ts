export const Routes = {
  // Root flow
  Splash: "Splash",
  Onboarding: "Onboarding",
  Login: "Login",
  Register: "Register",
  RootTabs: "RootTabs",
  Menu: "Menu",

  // Tabs
  Home: "Home",
  Tasks: "Tasks",
  Focus: "Focus",
  Odi: "Odi",
  Stats: "Stats",
  Profile: "Profile",
  Friends: "Friends",

  // Stack screens
  Notifications: "Notifications",
  Settings: "Settings",
  Privacy: "Privacy",
  Garden: "Garden",
  Premium: "Premium",
  Achievements: "Achievements",

  // Sub / extra screens used in code
  FocusSettings: "FocusSettings",
  FriendsActivity: "FriendsActivity",
  FriendsRequests: "FriendsRequests",
  FriendsLeaderboard: "FriendsLeaderboard",
} as const;

export type RouteName = (typeof Routes)[keyof typeof Routes];
