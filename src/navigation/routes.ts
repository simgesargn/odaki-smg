export const Routes = {
  Splash: "Splash",
  Onboarding: "Onboarding",
  AuthStack: "AuthStack",
  Login: "Login",
  Register: "Register",

  RootTabs: "RootTabs",
  Home: "Home",
  Tasks: "Tasks",
  Focus: "Focus",
  Odi: "Odi",
  Stats: "Stats",
  Profile: "Profile",

  Notifications: "Notifications",
  Settings: "Settings",
} as const;

export type RouteName = (typeof Routes)[keyof typeof Routes];
