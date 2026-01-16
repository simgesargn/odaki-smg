export const Routes = {
  // app flow
  Splash: "Splash",
  Onboarding: "Onboarding",
  Auth: "Auth",
  RootTabs: "RootTabs",

  // auth
  Login: "Login",
  Register: "Register",

  // tabs
  Home: "Home",
  Tasks: "Tasks",
  Focus: "Focus",
  Odi: "Odi",
  Stats: "Stats",
  Profile: "Profile",
  Friends: "Friends",

  // stack extras
  Notifications: "Notifications",
  Settings: "Settings",
  Privacy: "Privacy",
  Garden: "Garden",
  Premium: "Premium",
} as const;

export type RouteName = (typeof Routes)[keyof typeof Routes];
