// app/forms/[formid]/(tabs)/records
import React from "react";
import { View, Image, StyleSheet, ScrollView, Alert, Platform } from "react-native";
import { Text, Button, Card, Divider, useTheme } from "react-native-paper";


export default function SpecificForm() {
  const { formid } = useLocalSearchParams(); // "id" from the URL (/forms/edit/123)
  const [form, setForm] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);


  React.useEffect(() => {
    (async () => {
        try {
          setError(null); // reset error to null for each request. 
          const data = await apiRequest(`/form?id=eq.${formid}`); // Get request
          setForm(data[0]); // data is list of one
        } catch (e) {
          setError(e?.message || "Failed to load form"); // set error if caught. 
        } finally {
          setLoading(false);
        }
      })();
    }, [formid]);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <Header />
       <View style={styles.summaryScreen}>
        <SummaryCard
          title={`${form?.name ?? "Untitled"}`}
          description={form?.description ?? ""}
        />
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create(
    { safe: { flex: 1, backgroundColor: "#fff" },
      container:  { flex: 1, paddingHorizontal: 12},
      pageTitle: { fontWeight: "700", marginTop: 8 },
      titleCard: { marginBottom: 24, backgroundColor: "#f7f8fb"},
      summaryScreen: { flex: 1},
    }
);