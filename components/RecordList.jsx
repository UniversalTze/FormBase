// components/RecordList.jsx
import React from "react";
import { View, Text, ScrollView, StyleSheet, Image, Alert } from "react-native";
import { apiRequest } from "../api/api";
import { useFocusEffect } from "@react-navigation/native";
import { Button, Card, ActivityIndicator, Divider, Portal, Dialog, TextInput} from "react-native-paper";
import * as Clipboard from "expo-clipboard";

/**
 * RecordsList Component
 *
 * Displays a scrollable list of records for a given form. Each record shows its
 * title and field values, including support for Location and Photo types.
 * Provides buttons to copy a record to the clipboard or delete it.
 *
 * Props:
 * @param {number|string} formId - The ID of the form whose records are displayed.
 * @param {any} refreshRecordKey - Optional key used to trigger reloading of records
 *                                 when it changes.
 *
 * Internal Functions:
 * - handleRecordvalue(record, fields)
 *   Renders a record's values as JSX. Handles special formatting for Location and Photo fields.
 *
 * - handleCopy(record)
 *   Copies a record to the clipboard in JSON format, excluding Photo fields.
 *   Alerts the user on success.
 *
 * - onDelete(id)
 *   Deletes a record by ID, updating the UI optimistically. Restores state on error.
 *
 * Behavior:
 * - Fetches records and field metadata on mount and when formId changes.
 * - Reloads data whenever the screen gains focus.
 * - Handles loading, empty state, and error state gracefully.
 * - Provides a dialog to add filter criteria (UI only, no filtering logic implemented).
 */
export default function RecordsList({ formId, refreshRecordKey }) {
  // pass record and field list. 
  const formid = formId;
  const [records, setRecords] = React.useState([]);
  const [fields, setFields] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [empty, SetEmpty] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(true);
  const [error, setError] = React.useState("");
  const [criteriaOpen, setCriteriaOpen] = React.useState(false);
  
  React.useEffect(() => { // load the screen and fill record screen with initial stuff
      (async () => {
        setCriteriaOpen(false); // no dialog box
          try {
            setError(null); // reset error to null for each request. 
            const data = await apiRequest(`/record?form_id=eq.${formid}&order=id.asc`); // Get request for records
            const fieldData = await apiRequest(`/field?form_id=eq.${formid}&order=id.asc`);
            setRecords(data); // data is list of one
            setFields(fieldData);
          } catch (e) {
            setError(e?.message || "Failed to load form"); // set error if caught. 
          } finally {
            setLoading(false);
          }
        })();
    }, [formid]);

  const load = React.useCallback(async () => {
    try {
      setError(null);  // reset variable if an error occured
      const dataRecord = await apiRequest(`/record?form_id=eq.${formid}&order=id.asc`); // GET
      const fieldData = await apiRequest(`/field?form_id=eq.${formid}&order=id.asc`);
      setRecords(dataRecord);
      setFields(fieldData);
    } catch (e) {
      setError(e?.message || "Failed to load records");
    } finally {
      setLoading(false); // first render complete, set to false
      setRefreshing(false); // set to true when needed to refresh the data
    }
    }, []); // empty dep array as it should function should only be loaded and created once
        
  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);   // programmatic load -> big center spinner
      load();
    }, [load, records, refreshRecordKey])
  ); // for when screen comes into focus. 

  // Deleting a record
  const onDelete = React.useCallback(
    async (id) => {
      const prev = records;
      setRecords((xs) => xs.filter((rec) => rec.id !== id));
      try {
        await apiRequest(`/record?id=eq.${id}`, "DELETE");
      } catch (e) {
        setRecords(prev); // reset if any error
      }
    },
    [records, load] // new closure so delete work with latest form values.
  );

  // copying a record to clipboard
  const handleCopy = (record) => {
    let copied = {"id" : record.id}; // copy id
    let values = record?.values; // currently a JSON string
    if (values) {
      try { values = JSON.parse(record.values); } catch {
        return {}; // hadnle invalid JSON
      }
    }
    copied["Title"] = values["Title"]; // copy title 
    let recordFieldVals = values["recordValues"];
      // create a map of index to the object
    const fieldsById = new Map(fields.map(f => [String(f.id), f]));

    Object.entries(recordFieldVals).forEach(([id, v]) => { // map through each variable in record values { field.id: value}
    const field = fieldsById.get(String(id));
    if (!field) return; // skip missing metadata
    if (field.field_type === "Photo") return; // skip images

    if (field.field_type === "Location") {
      Object.entries(v).forEach(([id, coord]) => {
        copied[id] = coord;
      })

    } else { 
        copied[field.name] = v; // use field name as key
      }
    });
    // optional: copy to clipboard here
    const text = JSON.stringify(copied, null, 2);
    Clipboard.setStringAsync(text);
    Alert.alert("Copied!", "Record copied to clipboard.");
    return copied; 
  }

  const handleRecordvalue = (record, fields) => {
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

  // Title (top of card)
  const titleNode = (
    <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 4 }}>
      {values.Title || "Untitled"}
    </Text>
  );
  
  const rows = Object.entries(values["recordValues"])
    .filter(([, v]) => v !== null) // ignore nulls
    .map(([id, v]) => {
      const meta = fieldsById.get(String(id)) || {};
      const type = meta.field_type;
      const name = meta.name;
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
          <Text style={{ fontSize: 14, color: "#6b7280", marginBottom: 2 }}>
            {name}: ({type})
          </Text>
          {valueNode}
        </View>
      );
    });
  return (
    <View>
      {titleNode}
      <Divider style={{ marginVertical: 6, opacity: 0.3 }} />
      {rows.length ? rows : <Text style={{ opacity: 0.6 }}>No values</Text>}
    </View>
  );
};

  return (
  <ScrollView style={{ flex: 1 }}>
    <View style={{ alignItems: 'flex-end', paddingRight: 16}}>
    <Button 
      compact 
      mode="contained"
      icon="pencil-outline"
      textColor="#fff"
      onPress={() => setCriteriaOpen(true)}
      style={[styles.criteriaBtn, { alignSelf: 'flex-end' }]}
      contentStyle={styles.btnContent}
    >
      Add Criteria
    </Button>
  </View>
    {records.length > 0 ? (
      <View style={styles.container}>
        {records.map((r) => (
          <Card key={r.id} mode="elevated" style={styles.heroCard}>
            <Card.Content>
              {handleRecordvalue(r, fields)}
            </Card.Content>
            <Card.Actions style={{ justifyContent: 'center', alignContent: 'center'}}>
            <Button 
              compact 
              mode="contained"
              icon="pencil-outline"
              buttonColor="#5B7C99"      // Edit = amber
              textColor="#fff"
              style={styles.btn}
              contentStyle={styles.btnContent}
              onPress={() => handleCopy(r)}
              >
              Copy
            </Button>
            <Button
              compact
              mode="contained"
              onPress={() => onDelete(r.id)}
              buttonColor="#EF4444"
              icon="trash-can"
              style={styles.btn}
              contentStyle={styles.btnContent}
            >
              Delete
            </Button>
          </Card.Actions>
          </Card>
        ))}
      </View>
    ) : loading ?  
        <View style={styles.center}>
        <ActivityIndicator />
      <Text style={{ marginTop: 8 }}>Loading…</Text>
      </View> 
      : error ? ( // show message arror
        <View style={styles.center}> 
            <Text>{error}
            </Text>
        </View>)  
      :
    (
      <View style={{ alignItems: 'center', paddingHorizontal: 12}}>
        <Card mode="elevated" style={styles.heroCard}>
          <Card.Cover
            style={styles.heroImage}
            source={require("../assets/images/batmanRain.jpg")}
          />
          <Card.Content style={styles.emptyFont}>
            <Text style={{ fontSize: 16, color: '#555' }}>
              No records found. Start by adding a new record!
            </Text>
          </Card.Content>
        </Card>
      </View>
    )}
    <Portal>
      <Dialog
        visible={criteriaOpen}
        onDismiss={() => setCriteriaOpen(false)}
        style={{ borderRadius: 16 }}
      >
        <Dialog.Title>Add Filter Criteria</Dialog.Title>
        <Dialog.Content>
          <Text>Select a field, operator, and enter a value.</Text>
        </Dialog.Content>

        <Dialog.Actions>
          <Button mode="contained">
            Add
          </Button>
          <Button onPress={() => setCriteriaOpen(false)}>Cancel</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 12, padding: 8 },
  heroCard: { width: 350, marginBottom: 12, borderRadius: 12, marginTop: 8, width: '100%'}, // take 100 % of card space
  heroImage: { height: 220, backgroundColor: "#eaf1ff", borderRadius: 12, padding: 8},
  emptyFont: { fontSize: 16, color: '#555', marginTop: 12 },
  answerImage: { marginTop: 6, width: 280, height: 280, borderRadius: 8, resizeMode: "cover" },
  btnContent: { paddingVertical: 2, paddingHorizontal: 4 },
  btn: { borderRadius: 20 },
  criteriaBtn: { marginTop: 18},
  
});