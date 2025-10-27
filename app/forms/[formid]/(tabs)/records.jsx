// app/forms/[formid]/(tabs)/records
import React from "react";
import { View, Image, StyleSheet, ScrollView, Alert, Platform} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import Header from "../../../../components/header";
import RecordsList from "../../../../components/RecordList";
import SummaryCard from "../../../../components/SummaryCard";
import { apiRequest } from "../../../../api/api";
import { useRefresh } from './_layout';

/**
 * SpecificRecordForm component displays all records for a particular form.
 *
 * Fetches form metadata for the given `formid` and renders a SummaryCard
 * with form name and description. Below the summary, the RecordsList component
 * displays all associated records. Refreshes automatically when the parent
 * tab triggers a refresh via `useRefresh`.
 */
export default function SpecificRecordForm() {
  const { formid } = useLocalSearchParams(); // "id" from the URL (/forms/edit/123)
  const [form, setForm] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const { refreshKey } = useRefresh();

  React.useEffect(() => { // load the screen and fill record screen with initial stuff
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
         <RecordsList formId={formid} refreshRecordKey={refreshKey}/>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create(
    { safe: { flex: 1, backgroundColor: "#fff" },
      container:  { flex: 1, paddingHorizontal: 12},
      summaryScreen: { flex: 1},
    }
);