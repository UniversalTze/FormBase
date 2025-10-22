// components/AddRecordForm.jsx
import React from "react";
import { View, Alert, Image, StyleSheet } from "react-native";
import { Text, TextInput, Button, ActivityIndicator, HelperText, Card, Divider, Icon } from "react-native-paper";
import { apiRequest } from "../api/api";

const iconForType = (type = "") => {
  if (type.includes("Location")) return "map-marker";
  if (type.includes("Photo")) return "camera";
  if (type.includes("Dropdown")) return "chevron-down";
  if (type.includes("Multi-Line-Text")) return "text";
  if (type.includes("Single-Line-Text")) return "form-textbox";
  return "shape";
};


export default function AddRecordForm({
    formId,
    onCreate, // optional: async (payload) => void ; defaults to POST /record
    }) {
    const [loadingFields, setLoadingFields] = React.useState(true);
    const [fields, setFields] = React.useState([]);  
    const [title, setTitle] = React.useState("");
    const [error, setError] = React.useState("");
    const [empty, SetEmpty] = React.useState(true);
    
    
    React.useEffect(() => {
      let mounted = true; 
      (async () => {
      try {
          setLoadingFields(true);
          // Get all fields for this form in display order
          const data = await apiRequest(`/field?form_id=eq.${formId}`);
          if (mounted) { 
            setFields(data || []);
            if (data.length > 0) { 
              SetEmpty(false);
              }
            }  // fields should be an array of fields
      } catch (e) {
          if (mounted) setError(e?.message || "Failed to load fields");
      } finally {
          if (mounted) setLoadingFields(false);
      }
      })(); // runs the async straight away
      return () => mounted = false ;
    }, [formId]);

    const handlePress = (field) => {
    if (onFieldPress) return onFieldPress(field);
    // placeholder action for now
    Alert.alert(field.name, "Open input screen here (coming soon).");
    };

    return (
    <Card mode="elevated" style={styles.card}>
      <Card.Title
        title="Add Records"
        titleStyle={{ fontWeight: "700" }}
        style={styles.addbtn}
      />
      <View>
      <Divider />
       <Card.Content style={{ paddingTop: 8 }}>
      <TextInput
        mode="outlined"
        label="Title *"
        value={title}
        onChangeText={setTitle}
        style={{ marginTop: 8 }}
      />

      {loadingFields ? (
        <View style={{ paddingVertical: 16 }}>
          <ActivityIndicator />
        </View>
      ) : empty ? 
         <View
          style={styles.emptyTextStyle}
        >
          <Text style={styles.mainEmptyText}>
            This form has no fields yet.
          </Text>
          <Text style={styles.subEmptyText}>
            Submitting will create an empty record.
          </Text>
        </View>
        : (
        fields.map((f) => (
          <Button
            key={f.id}
            mode="outlined"
            icon={iconForType(f.field_type)}
            // onPress={() => handlePress(f)}
            style={{ marginTop: 10, borderRadius: 12 }}
            contentStyle={{ paddingVertical: 2 }}
          >
            {`${f.field_type}`}
          </Button>
        ))
      )}

      {!error && (
        <HelperText type="error" visible style={{ marginTop: 6 }}>
          {error}
        </HelperText>
      )}
       <Button
        mode="contained"
        icon="plus"
        //onPress={handleSave}
        //disabled={!canSave}
        //loading={saving}
        style={styles.addbtn}
        contentStyle={{ paddingVertical: 6 }}
      >
        Add Record
      </Button>
      </Card.Content>
      </View>
    </Card>
    );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, backgroundColor: "#fff", marginTop: 12, marginBottom: 16 }, 
  emptyTextStyle: { alignItems: "center", justifyContent: "center", paddingVertical: 10, opacity: 0.7}, 
  mainEmptyText: { marginTop: 10, fontSize: 16, color: "#666" }, 
  subEmptyText: { color: "#999", fontSize: 13 },
  addbtn: { marginTop: 8, borderRadius: 20, marginBottom: 12}
});