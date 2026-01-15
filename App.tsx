import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { enableScreens } from "react-native-screens";
import { ThemeProvider } from "./src/ui/theme/ThemeProvider";
import { I18nProvider } from "./src/i18n/I18nProvider";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { GestureHandlerRootView } from "react-native-gesture-handler";

enableScreens();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nProvider>
        <ThemeProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </ThemeProvider>
      </I18nProvider>
    </GestureHandlerRootView>
  );
}
