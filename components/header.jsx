// components/header.jsx
import * as React from "react";
import { StyleSheet } from "react-native";
import { Appbar } from "react-native-paper";
import { useNavigation } from "expo-router";
import { DrawerActions } from "@react-navigation/native";

/**
 * Header component
 *
 * Renders a top app bar with a menu button to open the drawer and a centered title.
 * Includes a spacer action to keep the title visually centered.
 *
 * Uses:
 * - `useNavigation` from React Navigation for drawer control.
 * - `Appbar` from react-native-paper for consistent UI styling.
 *
 * No props are required.
 */
export default function Header() {
  const navigation = useNavigation();

  return (
    <Appbar.Header
      mode="center-aligned"
      elevated
      style={styles.header}
    >
      <Appbar.Action
        icon="menu"
        color="white"
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      />
      <Appbar.Content title="FormBase" color="white" />
      {/* spacer to balance layout; keeps title visually centered */}
      <Appbar.Action icon="dots-horizontal" 
                     disabled
                     style={{ opacity: 0 }}  />
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: "#3A506B" },  // uniform brand color
});