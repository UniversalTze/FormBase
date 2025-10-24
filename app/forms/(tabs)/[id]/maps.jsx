// app/forms/(tabs)/[id]/maps.jsx
import React from 'react';
import { View, Text } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import * as Location from 'expo-location';

export default function MapScreen() {
  const { formId } = useLocalSearchParams(); // get "id" from the URL (/forms/edit/123) (form id)


  
  useEffect(() => { // receives permission from user to use maps. 
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>This is the map screen</Text>
    </View>
  );
}