import React from "react";
import { Text, Button, ActivityIndicator, Card } from "react-native-paper";
import { useRouter } from "expo-router";
import Header from "../../components/header";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View, RefreshControl } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { apiRequest } from "../../api/mainapi";

export default function FormsHome() {
  const router = useRouter();

  const [forms, setForms] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState(null);

  const load = React.useCallback(async () => {
    try {
      setError(null);  // reset variable if an error occured
      const data = await apiRequest("/form"); // GET
      setForms(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Failed to load forms");
    } finally {
      setLoading(false); // first render complete, set to false
      setRefreshing(false); // set to true when needed to refresh the data
    }
    }, []); // empty dep array as it should be loaded once. 

  React.useEffect(() => { // runs after render
    load();
  }, [load]); // effect depends on load function deps; runs once due to no deps.

  const onRefresh = React.useCallback(() => { // callback function
    setRefreshing(true);
    load();
  }, [load]); // dep array, load never changes so cbf never changes. 

  const onDelete = React.useCallback(
    async (id) => {
      const prev = forms;
      setForms((xs) => xs.filter((f) => f.id !== id));
      try {
        await apiRequest(`/form/${id}`, "DELETE");
        // optionally: await load(); // re-fetch instead of optimistic
      } catch (e) {
        setForms(prev); // reset if any error
      }
    },
    [forms, load] // new closure so delete work with latest form values.
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <Header />

      <View style={styles.container}>

        <Button
          mode="contained"
          onPress={() => router.push("/forms/new")}
          style={styles.addBtn}
        >
          New form
        </Button>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator />
            <Text style={{ marginTop: 8 }}>Loading…</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text>{error}</Text>
            <Button
              style={{ marginTop: 8 }}
              onPress={() => {
                setLoading(true);
                load();
              }}
            >
              Retry
            </Button>
          </View>
        ) : (
          <FlatList
            data={forms}
            keyExtractor={(it) => it.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text variant="titleMedium" style={{ fontWeight: "700" }}>
                  {item.title}
                </Text>
                {item.description ? (
                  <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                    {item.description}
                  </Text>
                ) : null}

                <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                  <Button compact onPress={() => router.push(`/forms/${item.id}`)}>
                    Open
                  </Button>
                  <Button
                    compact
                    mode="contained"
                    onPress={() => onDelete(item.id)}
                    buttonColor="#EF4444"
                  >
                    Delete
                  </Button>
                </View>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            contentContainerStyle={{ paddingBottom: 16 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={[styles.center, { paddingVertical: 48 }]}>
                 <Card mode="elevated" style={styles.imgCard}>
                    <Card.Cover
                      style={styles.Image}
                      source={require("../../assets/images/204-status-code.png")}
                    />
                  </Card>
                <Text>No Forms Created....</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, paddingHorizontal: 18 },
  title: { fontWeight: "700", marginTop: 12, marginBottom: 12 },
  addBtn: { marginBottom: 4, borderRadius: 10, marginTop: 24 },
  center: { alignItems: "center", justifyContent: "center", paddingVertical: 24 },
  row: { padding: 16, borderRadius: 12, backgroundColor: "#f7f8fb" },
  imgCard: { width: 350, marginBottom: 24 },
  Image: { height: 220, backgroundColor: "#eaf1ff" },
});