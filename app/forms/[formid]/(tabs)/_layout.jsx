import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from "expo-router";
import { createContext, useContext, useState, ReactNode } from 'react';

// Create the context
const RefreshContext = createContext();

// Custom hook to use the context
export const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error('useRefresh must be used within RefreshProvider');
  }
  return context;
};

// Provider component
function RefreshProvider({ children }) {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const triggerRefresh = () => setRefreshKey(prev => prev + 1);
  
  return (
    <RefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
}

/**
 * Form detail layout with tabs.
 *
 * Provides a tabbed interface for viewing/editing a form, its records, and map.
 * Uses a RefreshContext to allow child screens to trigger a refresh of data.
 * Passes `formid` from the URL to each tab via initialParams.
 */
export default function Layout() {
  const { formid } = useLocalSearchParams(); // get "form id" from the URL (/forms/edit/123)

  return (
    <RefreshProvider>
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
        initialParams={{ formid  }}
      />
       <Tabs.Screen
        name="records"
        options={{
          title: 'Records',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="clipboard-outline" size={size} color={color} />
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
  </RefreshProvider>
  );
}