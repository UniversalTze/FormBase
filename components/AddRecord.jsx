// components/AddRecordForm.jsx
import React from "react";
import { View, Alert, Image, StyleSheet, ScrollView } from "react-native";
import { Text, TextInput, Button, ActivityIndicator, HelperText, Card, Divider, 
  Portal, Dialog } 
from "react-native-paper";
import { apiRequest } from "../api/api";
import { useFocusEffect } from "@react-navigation/native";

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
  refreshFieldKey, // key for refresh of component. 
  formDescription
  }) {
  const [loadingFields, setLoadingFields] = React.useState(true);
  const [fields, setFields] = React.useState([]);  
  const [title, setTitle] = React.useState("");
  const [error, setError] = React.useState("");
  const [empty, SetEmpty] = React.useState(true);
  const [values, setValues] = React.useState({}); // for JSON to be sent for record 
  // shape: { [fieldId]: fieldValue } (can hold multiple ids of field for one record...)
  // const [refreshField, setRefreshField] = React.useState(refreshFieldKey);

    // dialog for text entry
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [tempValue, setTempValue] = React.useState("");
  const [activeField, setActiveField] = React.useState(null);
  const [dropdownOpenId, setDropdownOpenId] = React.useState(null); // for drop down

  const onFieldPress = (f) => {
    setActiveField(f);
    if (f.field_type === "Single-Line-Text" || f.field_type === "Multi-Line-Text") { 
      setTempValue((values[f.id] ?? "").toString());  // for string texts
    }
    setDialogOpen(true);
  };

  const saveDialog = () => {
      setValues((prev) => ({ ...prev, [activeField.id]: tempValue })); // save previous entries to fields and adds the new selection
      setDialogOpen(false);
      setActiveField(null);
      setTempValue("");
  };

    const saveDropdownSelection = (option) => {
    setValues((prev) => ({ ...prev, [activeField.id]: option }));
    setDialogOpen(false);
    setActiveField(null);
  };

  const load = React.useCallback(async () => {
    try {
      setError(null);  // reset variable if an error occured
      const data = await apiRequest(`/field?form_id=eq.${formId}`);
      setFields(Array.isArray(data) ? data : []);
      if (data.length > 0) { 
        SetEmpty(false);
      }

    } catch (e) {
      setError(e?.message || "Failed to load forms");
    } finally {
      setLoadingFields(false); // first render complete, set to false
    }
    }, []); // empty dep array as it should be loaded once. 

  useFocusEffect( // runs every time this screen becomes visible
    React.useCallback(() => {
      // first time: show big spinner; subsequent: pull-to-refresh spinner
      if (fields.length === 0) {
        setLoadingFields(true);
      }
      load(); // load data
    }, [load, refreshFieldKey])
  );

  const consolee = () => { 
    console.log("HERE");
  }

  const showNoFieldsAlert = () => {
    Alert.alert(
      "No Fields Found",
      "Please add fields to this form before submitting. Do you want to add fields now?",
      [
        { text: "No", style: "cancel" },
          {
          text: "Yes",
          onPress: () => {
            // Optional: navigate to field creation screen
            console.log("User chose to add fields");
          },
        },
      ]
    );
  };
  const parseDropdownOptions = (dropDownOptions) => {
  if (!dropDownOptions) return [];
    const parsed = JSON.parse(dropDownOptions); // get the options back from Get request.
    const options = parsed["ddOptions"];
    return options;
  };

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
      : 
      fields.map((f) => (
        <View key={f.id} >
          <Button
            mode="outlined"
            icon={iconForType(f.field_type)}
            onPress={() => onFieldPress(f)}
            style={{  // need this here for conditionals
              marginTop: 10,
              borderRadius: 12,
              borderColor: "#007BFF",
              borderWidth: 1.5,
            }}
            contentStyle={{ paddingVertical: 2 }}
            textColor="#007BFF"
          >
            {`${f.field_type}${f.required ? " (*)" : ""}`}
          </Button>
              {values[f.id] &&  (
                f.field_type.includes("Photo") ? (
                  <Image source={{ uri: values[f.id] }} style={styles.answerImage} />
                ) : (
                  <Text
                    style={styles.answerText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {values[f.id]}
                  </Text>
                )
              )}
            </View>
          )
      )
    }

    {!error && (
      <HelperText type="error" visible style={{ marginTop: 6 }}>
        {error}
      </HelperText>
    )}
      <Button
      mode="contained"
      icon="plus"
      onPress={() => { 
        if (empty) {
          showNoFieldsAlert(); 
        } else { 
          consolee();
        }}}
      //disabled={!canSave}
      //loading={saving}
      style={styles.addbtn}
      contentStyle={{ paddingVertical: 6 }}
    >
      Add Record
    </Button>
    </Card.Content>
    </View>
    <Portal>
      <Dialog visible={dialogOpen} 
              onDismiss={() => setDialogOpen(false)}
              style={styles.dialogbox}>
        <Dialog.Title>{activeField?.field_type ?? "Field"}</Dialog.Title>
        <Dialog.Content>
          <Text style={{ color: '#666', fontSize: 14 }}>
            {formDescription}
          </Text>
        </Dialog.Content>
         {/* Text input fields */}
          {activeField && (activeField.field_type === "Single-Line-Text" || activeField.field_type === "Multi-Line-Text") && (
            <>
              <Dialog.Content>
                <TextInput
                  mode="outlined"
                  value={tempValue}
                  onChangeText={setTempValue}
                  multiline={activeField.field_type === "Multi-Line-Text"}
                  numberOfLines={activeField.field_type === "Multi-Line-Text" ? 4 : 1}
                  autoFocus
                />
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setDialogOpen(false)}>Cancel</Button>
                <Button onPress={saveDialog}>Save</Button>
              </Dialog.Actions>
            </>
          )}

          {/* Dropdown field */}
          {activeField && activeField.field_type === "Dropdown" && (
            <>
              <Dialog.ScrollArea style={{ maxHeight: 400, paddingHorizontal: 0 }}>
                <ScrollView>
                  {parseDropdownOptions(activeField.options).length === 0 ? (
                    <Text style={styles.dialogNoOptionText}>
                      No options available
                    </Text>
                  ) : (
                    parseDropdownOptions(activeField.options).map((option) => (
                      <Button
                        key={String(option)}
                        mode={values[activeField.id] === option ? "contained" : "text"}
                        onPress={() => saveDropdownSelection(option)}
                        style={styles.dropdownButtons}
                        contentStyle={{ paddingVertical: 8 }}
                      >
                        {String(option)}
                      </Button>
                    ))
                  )}
                </ScrollView>
              </Dialog.ScrollArea>
              <Dialog.Actions>
                <Button onPress={() => setDialogOpen(false)}>Cancel</Button>
              </Dialog.Actions>
            </>
          )}
        </Dialog>
    </Portal>
  </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, backgroundColor: "#fff", marginTop: 12, marginBottom: 16 }, 
  emptyTextStyle: { alignItems: "center", justifyContent: "center", paddingVertical: 10, opacity: 0.7}, 
  mainEmptyText: { marginTop: 10, fontSize: 16, color: "#666" }, 
  subEmptyText: { color: "#999", fontSize: 13 },
  addbtn: { marginTop: 8, borderRadius: 20, marginBottom: 12},
  dialogbox: { borderRadius: 4, width: '90%', maxWidth: 400, alignSelf: 'center'},   // center horizontally}
  answerText: { marginTop: 4, marginLeft: 6, color: "grey",fontSize: 14, },
  answerImage: { marginTop: 6, marginLeft: 6, width: 80, height: 80, borderRadius: 8, resizeMode: "cover" },
  dialogNoOptionText: { padding: 16, color: '#999', textAlign: 'center' },
  dropdownButtons: { marginVertical: 2, marginHorizontal: 8, justifyContent: 'flex-start'}
});