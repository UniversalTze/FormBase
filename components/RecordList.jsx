import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { apiRequest } from "../api/api";

export default function RecordsList({ formId }) {
  const [records, setRecords] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const data = await apiRequest(`/records?form_id=eq.${formId}&order=id.asc`);
        setRecords(data);
      } catch (e) {
        console.log("Error loading records:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [formId]);

  if (loading) return <Text>Loading records...</Text>;
  if (!records.length) return <Text>No records yet</Text>;

  return (
    <ScrollView style={styles.container}>
      {records.map((r) => (
        <View key={r.id} style={styles.recordCard}>
          <Text style={styles.recordTitle}>{r.title}</Text>
          <Text>{JSON.stringify(r.values)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 12 },
  recordCard: { padding: 12, backgroundColor: "#f2f2f2", marginBottom: 8, borderRadius: 8 },
  recordTitle: { fontWeight: "700" }
});