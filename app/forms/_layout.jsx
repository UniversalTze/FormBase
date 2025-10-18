// app/forms/_layout.tsx
import { Stack } from "expo-router";

export default function FormsLayout() {
  return <Stack screenOptions={{ headerShown: false }} >
            <Stack.Screen name="index" options={{ title: "My Forms" }} />
         </Stack>;
}