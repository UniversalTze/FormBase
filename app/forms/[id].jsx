// app/forms/[id].jsx

import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/header";
import FormEditor from "../../components/FormEditor";
import { apiRequest } from "../../api/mainapi";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import SummaryCard from "../../components/SummaryCard";
import ManageFieldsPanel from "../../components/ManageFieldsPanel";
import { ScrollView } from "react-native-gesture-handler";

export default function SpecificForm() {
  const { id } = useLocalSearchParams(); // "id" from the URL (/forms/edit/123)
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    (async () => {
        try {
          setError(null); // reset error to null for each request. 
          const data = await apiRequest(`/form?id=eq.${id}`); // Get request
          setForm(data[0]); // data is list of one
        } catch (e) {
          setError(e?.message || "Failed to load form"); // set error if caught. 
        } finally {
          setLoading(false);
        }
      })();
    }, [id]);

    const createField = async(name, field_type, options, required, is_num, order_index) => {
    }
    const console = () => console.log("HERE");

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <Header />
       <View style={styles.summaryScreen}>
        <SummaryCard
          title={`${form?.name ?? "Untitled"}`}
          description={form?.description ?? ""}
        />
        <ScrollView style={styles.container}>
          <ManageFieldsPanel onSave={ console }
          />
        </ScrollView>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create(
    { safe: { flex: 1, backgroundColor: "#fff" },
      container:  { flex: 1, paddingHorizontal: 12, marginTop: 12},
      pageTitle: { fontWeight: "700", marginTop: 8 },
      titleCard: { marginBottom: 24, backgroundColor: "#f7f8fb"},
      summaryScreen: { flex: 1},
    }
);