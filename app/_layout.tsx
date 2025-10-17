import { Stack } from "expo-router";
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { Provider as PaperProvider, MD3LightTheme as DefaultTheme } from "react-native-paper";
import { Drawer } from "expo-router/drawer";

const theme = {
  ...DefaultTheme,
  roundness: 12,
  colors: { ...DefaultTheme.colors, primary: "#3B82F6", secondary: "#1E3A8A" },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <StatusBar style="dark" />
      {/* Use router headers or hide and render your own Appbar in screens */}
      <Drawer           //for global side bar
          screenOptions={{
            headerShown: false,     // you'll render your own Appbar in screens
            drawerType: "front",    // "slide" or "permanent" also valid
          }}
        >
          {/* Map drawer items to routes */}
          <Drawer.Screen name="index" options={{ drawerLabel: "Home" }} />
          <Drawer.Screen name="about" options={{ drawerLabel: "About" }} />
        </Drawer>
    </PaperProvider>
  );
}