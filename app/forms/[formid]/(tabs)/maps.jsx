// app/forms/(tabs)/[id]/maps.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ActivityIndicator } from "react-native-paper";
import * as Location from 'expo-location';
import { useLocalSearchParams, usePathname } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { apiRequest } from '../../../../api/api';

export default function MapScreen() {
  const { formid } = useLocalSearchParams(); // get "form id" from the URL (/forms/edit/123)
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [location, setLocation] = React.useState(null);
  const [hasLocationField, setHasLocationField] = React.useState(false);

  React.useEffect(() => { // receives permission from user to use maps. 
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
    }, []);

    const load = React.useCallback(async () => {
    try {
      setError(null);  // reset variable if an error occured
      const allFieldData = await apiRequest(`/field?form_id=eq.${formid}`); // GET fields
      const locationdata = allFieldData.filter((field) => field.field_type === "Location");
      if (locationdata.length > 1) { 
        setHasLocationField(true);
      } else { 
        setError("Form has no location field. Please add a location field for a Map...");
      }
    } catch (e) {
      setError(e?.message || "Failed to load forms");
    } finally {
      setLoading(false); // first render complete, set to false
    }
    }, [formid]); // empty dep array as it should be loaded once.
  
  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);   // programmatic load -> big center spinner
      load();
    }, [load])
  );
  return (
    <View style={ styles.container }>
      { hasLocationField ? 
      <MapView 
        style={styles.map}
      >
      </MapView>
      : error ? (<Text>{error}</Text>) :  <ActivityIndicator />  }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 12 },
  map: { width: '100%', height: '100%', },
});