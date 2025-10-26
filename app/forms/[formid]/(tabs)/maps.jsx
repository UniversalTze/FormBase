// app/forms/(tabs)/[id]/maps.jsx
import React from 'react';
import { View, Text, StyleSheet , Image} from 'react-native';
import { ActivityIndicator } from "react-native-paper";
import { useLocalSearchParams, usePathname } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { apiRequest } from '../../../../api/api';
import { useRefresh } from './_layout';
import MapView, { Marker, Callout } from 'react-native-maps';
import { SafeAreaView } from "react-native-safe-area-context";
import Header from '../../../../components/header';
import SummaryCard from '../../../../components/SummaryCard';


export default function MapScreen() {
  const { formid } = useLocalSearchParams(); // get "form id" from the URL (/forms/edit/123)
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [records, setRecords] = React.useState([]);
  const [fields, setFields] = React.useState([]);
  const [hasLocationField, setHasLocationField] = React.useState(false);
  const [locationFields, setLocationFields] = React.useState([]);
  const [form, setForm] = React.useState(null);
  const { refreshKey } = useRefresh();

  const setLocationData = (record, locationField) => {
    let values = record?.values; // currently a JSON string
     if (values) {
        try { values = JSON.parse(record.values); } catch {}
    }
    let recordVals = values["recordValues"];

    const locationFieldIds = locationField.map(f => String(f.id)); // assuming only one location field
    return recordVals[locationFieldIds[0]];
  }

  const handleRecordvalue = (record) => {
  // record is a JSON object with id, form_id, values.
  let values = record?.values; // currently a JSON string
  if (values) {
    try { values = JSON.parse(record.values); } catch {}
  }
  if (!values || typeof values !== "object") {
    return <Text style={{ opacity: 0.6 }}>No values</Text>;
  }
  // create a map of index to the object
  const fieldsById = new Map(fields.map(f => [String(f.id), f]));
  const rows = Object.entries(values["recordValues"])
    .filter(([, v]) => v !== null) // ignore nulls
    .map(([id, v]) => {
      const meta = fieldsById.get(String(id)) || {};
      const type = meta.field_type;
      let valueNode = null;
      if (type === "Location") {
        const lat = v["latitude"];
        const lng = v["longtitude"];
        valueNode = <Text>Latitude:  {lat} {"\n"}Longtitude: {lng}</Text>
      } else if (type === "Photo") {
        valueNode = <Image source={{uri: v}} style={styles.answerImage} />
      } else {
        valueNode = <Text>{String(v)}</Text>;
      }
      return (
        <View key={id} style={{ paddingVertical: 8 }}>
          {valueNode}
        </View>
      );
    });
  return (
    <View>
      {rows.length ? rows : <Text style={{ opacity: 0.6 }}>No values</Text>}
    </View>
    );
  } ;
  const load = React.useCallback(async () => {
    try {
      setError(null);  // reset variable if an error occured
      const allFieldData = await apiRequest(`/field?form_id=eq.${formid}&order=id.asc`); // GET fields
      setFields(allFieldData);
      const locationdataIds = allFieldData.filter((field) => field.field_type === "Location");
      setLocationFields(locationdataIds);
      const records = await apiRequest(`/record?form_id=eq.${formid}&order=id.asc`);
      setRecords(records);
      if (form === null) { 
        const formMeta = await apiRequest(`/form?id=eq.${formid}`);
        setForm(formMeta[0]);
      }

      if (locationdataIds.length > 0) { 
        setHasLocationField(true);
        setLocationData(locationdataIds, records);
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
    }, [load, refreshKey])
  );

  
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
          <Header />
            <View style={styles.summaryScreen}>
            <SummaryCard
              title={`${form?.name ?? "Untitled"}`}
              description={form?.description ?? ""}
            />
      { hasLocationField ? 
      <MapView 
        style={styles.map}
      >
        {records.map((r) => {
    const coord = setLocationData(r, locationFields);
    if (!coord) return null;
    return (
      <Marker
        key={r.id}
        coordinate={{ latitude: coord["latitude"], longitude: coord["longtitude"] }}
      >
      <Callout tooltip={false}>
        {handleRecordvalue(r)}
        </Callout>
      </Marker>
      
      );
      })}
    </MapView>    
      : error ? (<Text>{error}</Text>) :  <ActivityIndicator />  }
      </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 12 },
  map: { width: '100%', height: '100%', },
  safe: { flex: 1, backgroundColor: "#fff" },
  summaryScreen: { flex: 1},
  answerImage: { marginTop: 6, width: 200, height: 200, borderRadius: 8, resizeMode: "cover" }

});