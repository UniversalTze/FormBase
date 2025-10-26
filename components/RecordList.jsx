import React from "react";
import { View, Text, ScrollView, StyleSheet, Image } from "react-native";
import { apiRequest } from "../api/api";
import { useFocusEffect } from "@react-navigation/native";
import { Button, Card, ActivityIndicator, Divider } from "react-native-paper";
import { useLocalSearchParams } from "expo-router";

/* 
TODO's: 
Represent records -> Logic needs to be written
Map markers and display information about it. 
Copy clipboard
Search Criteria
*/
export default function RecordsList({ formId, recordRefreshKey }) {
  // pass record and field list. 
  const formid = formId;
  const [records, setRecords] = React.useState([]);
  const [fields, setFields] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [empty, SetEmpty] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(true);
  const [error, setError] = React.useState("");
  
  React.useEffect(() => { // load the screen and fill record screen with initial stuff
      (async () => {
          try {
            setError(null); // reset error to null for each request. 
            const data = await apiRequest(`/record?form_id=eq.${formid}`); // Get request for records
            const fieldData = await apiRequest(`/field?form_id=eq.${formid}`);
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
    } catch (e) {
      setError(e?.message || "Failed to load records");
    } finally {
      setLoading(false); // first render complete, set to false
      setRefreshing(false); // set to true when needed to refresh the data
    }
    }, []); // empty dep array as it should be loaded once.
        
  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);   // programmatic load -> big center spinner
      load();
    }, [load, records, recordRefreshKey])
  );

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
            {type || "Unknown"}:
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
    ) : (
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
  </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 12, padding: 8 },
  heroCard: { width: 350, marginBottom: 12, borderRadius: 12, marginTop: 12, width: '100%'}, // take 100 % of card space
  heroImage: { height: 220, backgroundColor: "#eaf1ff", borderRadius: 12, padding: 8},
  emptyFont: { fontSize: 16, color: '#555', marginTop: 12 },
  answerImage: { marginTop: 6, width: 280, height: 280, borderRadius: 8, resizeMode: "cover" }
});