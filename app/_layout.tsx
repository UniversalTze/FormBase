import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { Provider as PaperProvider, MD3LightTheme as DefaultTheme } from "react-native-paper";

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
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
  );
}