// app/forms/_layout.tsx
import { Stack } from "expo-router";

/**
 * Layout for the Forms section of the app.
 * Uses an Expo Router Stack to manage navigation between form-related screens.
 * The header is hidden for all screens in this stack.
 * The default screen ("index") shows the user's forms with a slide-from-left animation.
 */
export default function FormsLayout() {
  return <Stack screenOptions={{ headerShown: false }} >
            <Stack.Screen name="index" options={{ title: "My Forms", animation: "slide_from_left"}} />
         </Stack>;
}