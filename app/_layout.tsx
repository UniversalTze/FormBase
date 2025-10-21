// app/_layout.jsx
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Provider as PaperProvider, MD3LightTheme as DefaultTheme, Icon } from "react-native-paper";
import { Drawer } from "expo-router/drawer";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const theme = {
  ...DefaultTheme,
  roundness: 12,
  colors: { ...DefaultTheme.colors, primary: "#3B82F6", secondary: "#1E3A8A" },
};

export default function RootLayout() {

  return (
    <PaperProvider theme={theme}>
      <StatusBar style="dark" />
      <Drawer           //for global side bar
          screenOptions={{
            headerShown: false,
            drawerType: "front",    // "slide" or "permanent" also valid
          }}
        >
          {/* Map drawer items to routes */}
          <Drawer.Screen
            name="index"
            options={{
              drawerLabel: "Home",
              drawerIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="home-search" color={color} size={size} />
              ),
            }}
          />
          <Drawer.Screen 
            name="about" 
            options={{ 
                drawerLabel: "About Us",
                drawerIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="account-group" color={color} size={size} />
                ),
              }
          } />
          <Drawer.Screen 
            name="forms" 
            options={{ 
                drawerLabel: "Forms",
                drawerIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="dropbox" color={color} size={size} />
                ),
              }
          } />
        </Drawer>
    </PaperProvider>
  );
}