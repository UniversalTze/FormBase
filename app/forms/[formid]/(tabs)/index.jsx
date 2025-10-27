// app/forms/(tabs)/[id]/index.jsx (for a particular form)

import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../../components/header";
import { apiRequest, insertField, insertRecord } from "../../../../api/api";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import { StyleSheet, View } from "react-native";
import SummaryCard from "../../../../components/SummaryCard";
import ManageFieldsPanel from "../../../../components/ManageFieldsPanel";
import AddRecordForm from "../../../../components/AddRecord";
import { ScrollView } from "react-native-gesture-handler";
import { IconButton } from "react-native-paper";
import { useRefresh } from './_layout';
import { KeyboardAvoidingView, Platform } from 'react-native';

/**
 * Screen for viewing and managing a specific form.
 *
 * Fetches the form data based on `formid` from the URL.
 * Displays a summary of the form, allows editing fields, and adding records.
 * Uses `useRefresh` from the parent tab layout to trigger refreshes in sibling tabs.
 * Supports keyboard avoiding behavior on iOS and Android.
 */

export default function SpecificForm() {
  const { formid } = useLocalSearchParams(); // "id" from the URL (/forms/edit/123)
  const [form, setForm] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const { triggerRefresh } = useRefresh();

  const [refreshFieldsKey, setRefreshFieldsKey] = React.useState(0);

  const handleFieldSave = React.useCallback(async (formId, field) => {
    await insertField(formId, field);     // existing API
    setRefreshFieldsKey(k => k + 1);      // tell AddRecordForm to reload its fields
  }, []);

  const handleRecordCreate = React.useCallback(async (formId, record) => {
    await insertRecord(formId, record);     // existing API to add record
    triggerRefresh();
  }, []);

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
    <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={{ flex: 1 }}
    >
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <Header />
       <View style={styles.summaryScreen}>
        <SummaryCard
          title={`${form?.name ?? "Untitled"}`}
          description={form?.description ?? ""}
        />
          <View style={styles.backRow}>
          <IconButton
            icon="arrow-left"
            size={24}
            style={{marginTop: 12}}
            iconColor="#000"
            onPress={() => router.replace("/forms")} // always go to /forms
            accessibilityLabel="Back to Forms"
          />
        </View>
        <ScrollView style={styles.container}>
          <ManageFieldsPanel onSave={handleFieldSave} formId={formid}
          />
          <AddRecordForm formId={formid} onCreate={handleRecordCreate} refreshFieldKey={refreshFieldsKey} formDescription={form?.description}
          />
        </ScrollView>
        </View>
    </SafeAreaView>
    </KeyboardAvoidingView>
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