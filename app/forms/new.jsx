// app/forms/new.jsx
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Alert } from "react-native";
import Header from "../../components/header";
import FormEditor from "../../components/FormEditor";
import { apiRequest } from "../../api/api";
import { router } from "expo-router";

export default function NewFormScreen() {
  const [submitting, setSubmitting] = React.useState(false);

  async function handleCreate(values) {
    try {
      setSubmitting(true); // for loading screen).
      const created = await apiRequest("/form", "POST", {
        name: values.name,
        description: values.description,
      });

      router.replace({ pathname: "/forms", params: { refresh: Date.now().toString() } });
      Alert.alert("Success", "Form created.", [{ text: "OK" }], { cancelable: true });
    } finally {
      setSubmitting(false); // set it back after finishing.
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <Header />
      <FormEditor
        title="Add Form"
        submitting={submitting}
        onSubmit={handleCreate}
        onCancel={() => router.back()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: "#fff" } });