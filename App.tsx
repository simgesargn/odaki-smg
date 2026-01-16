import React from "react";
import { enableScreens } from "react-native-screens";
import { ThemeProvider } from "./src/ui/ThemeProvider";
import { I18nProvider } from "./src/i18n/I18nProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { UserProvider } from "./src/context/UserContext";

enableScreens();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nProvider>
        <ThemeProvider>
          <SafeAreaProvider>
            <UserProvider>
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            </UserProvider>
          </SafeAreaProvider>
        </ThemeProvider>
      </I18nProvider>
    </GestureHandlerRootView>
  );
}
