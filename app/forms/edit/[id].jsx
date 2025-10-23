// app/forms/edit/[id].jsx
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import Header from "../../../components/header";
import { useLocalSearchParams, router } from "expo-router";
import { apiRequest } from "../../../api/api";
import FormEditor from "../../../components/FormEditor";

export default function EditFormScreen() {
  const { id } = useLocalSearchParams(); // "id" from the URL (/forms/edit/123)
  const [form, setForm] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);
  // need to add a route here into form too @TODO 


  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setError(null); // reset error to null for each request. 
        const data = await apiRequest(`/form?id=eq.${id}`); // Get request
        if (mounted) setForm(data[0]);
      } catch (e) {
        if (mounted) setError(e?.message || "Failed to load form"); // set error if caught. 
      } finally {
        if (mounted)setLoading(false);
      }
    })();
    return () => { mounted = false};
  }, [id]);

  async function handleUpdate(values) {
    try {
      setSubmitting(true); // submitting status set to true
      await apiRequest(`/form?id=eq.${id}`, "PATCH", {
        name: values.name,
        description: values.description,
      });
      router.back();
    } finally {
      setSubmitting(false); // set submitting back to false
    }
  }
  return (
    <SafeAreaView style={styles.safe} edges={["top","bottom"]}>
      <Header />
      {loading ? ( //loading status (show loadign activity)
        <View style={styles.center}>
            <ActivityIndicator />
                <Text style={{marginTop:8}}>
                    Loading…
                </Text>
        </View>
      ) : error ? ( // show message arror
        <View style={styles.center}> 
            <Text>{error}
            </Text>
        </View>
      ) : (
        <FormEditor
          title="Edit Form"
          initial={{ name: form?.name ?? "", description: form?.description ?? "" }}
          submitting={submitting}
          onSubmit={handleUpdate}
          onCancel={() => router.back()}
          submitLabel="Save"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex:1, backgroundColor:"#fff" },
  center: { flex:1, alignItems:"center", justifyContent:"center" },
});
