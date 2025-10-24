import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from "expo-router";

export default function Layout() {
  const { formid } = useLocalSearchParams(); // get "form id" from the URL (/forms/edit/123)
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Form',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
        initialParams={{ formid }}
      />
      <Tabs.Screen
        name="maps"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
        initialParams={{ formid }}
      />
    </Tabs>
  );
}