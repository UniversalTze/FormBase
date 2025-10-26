// components/AddRecordForm.jsx
import React from "react";
import { View, Alert, Image, StyleSheet, ScrollView } from "react-native";
import { Text, TextInput, Button, ActivityIndicator, HelperText, Card, Divider, 
  Portal, Dialog } 
from "react-native-paper";
import { apiRequest } from "../api/api";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

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
  const [empty, SetEmpty] = React.useState(true); // only set it when there are no fields
  const [values, setValues] = React.useState({}); // for JSON to be sent for record 
  // shape: { [fieldId]: fieldValue } (can hold multiple ids of field for one record...)
  const [unfinishedSub, setunFinishedSub] = React.useState(false);
  const [unfinishedMessage, setunFinishedMessage] = React.useState("");

    // dialog for text entry
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [tempValue, setTempValue] = React.useState("");
  const [activeField, setActiveField] = React.useState(null);

  const isFilled = (v) => {
  if (v == null) return false;                   // null/undefined
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.keys(v).length > 0; // e.g. {label,value}
  return true; // numbers/booleans count as filled
  };

  const validateRequired = React.useCallback(() => { // validate required fields
    const requiredFields = fields.filter((field) => field.required);       // array of field objects
    const answeredSet = new Set(
      Object.entries(values)
        .filter(([, value]) => isFilled(value))   // desturcting with value, as value is only needed, while keepin key-entry pair
        .map(([id]) => Number(id)) //map completed ids to numbers just in case. (type checks)
    );
    const missing = requiredFields.filter((f) => !answeredSet.has(f.id));
    return missing; // array of field objects
    }, [fields, values]);


  const handleCreateRecord = async () => { // for attempting to create record
    const unfinishedparts = [];

    // Title is required
    if (!title.trim()) { 
      unfinishedparts.push("Title");
      setunFinishedSub(true);
    }

    // Required fields not filled
    const missing = validateRequired();
    if (missing.length) {
      // show readable field names; fall back to field_type if name absent
      unfinishedparts.push(...missing.map((field) => field.field_type));
      setunFinishedSub(true);
    }

    if (unfinishedparts.length) {
      setunFinishedMessage(`Please complete: ${unfinishedparts.join(", ")}`);
      return; // stop submit
    }

    setunFinishedSub(false);
    // clear error and submit
    setError(null);
    setunFinishedMessage("");
    setTitle(""); // reset title
    setValues({});
    const record = { 
      "values": JSON.stringify({ 
        "Title": title,
        "recordValues": values
      })
    }
    await onCreate(formId, record);
    Alert.alert("Success", "Record created.", [{ text: "OK" }], { cancelable: true });
  };

  const onFieldPress = async (field) => { // for button presses when filling in fields. Determine active fields...
    // dropdown handled seperately (as long as active field has been set and dialog box is open)
    setActiveField(field);
    if (field.field_type === "Location") { 
      const coords = await requestLocation(field);
      if (coords) {
        // store it in your field values
        const coordinates = { 
          "latitude": coords.latitude,
          "longtitude": coords.longitude
        };
        setValues(prev => ({
          ...prev,
          [field.id]: coordinates
          }));
      }
      return; // optional: skip opening the dialog
    }
    if (field.field_type === "Photo") { 
       await handleChangePress(field);
       return;
    }
    if (field.field_type === "Single-Line-Text" || field.field_type === "Multi-Line-Text") {
      setTempValue((values[field.id] ?? "").toString());  // for string texts
    }
    setDialogOpen(true);
  };

  // text/num fields
  const saveDialog = () => {
      setValues((prev) => ({ ...prev, [activeField.id]: tempValue })); // save previous entries to fields and adds the new selection
      setDialogOpen(false);
      setActiveField(null);
      setTempValue("");
  };
  // drop down
  const saveDropdownSelection = (option) => {
    setValues((prev) => ({ ...prev, [activeField.id]: option }));
    setDialogOpen(false);
    setActiveField(null);
  };

    // location
  async function requestLocation(field) {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted' && field.required) {
      Alert.alert("Permission denied", "Location access is required to use this field.");
      return null;
    }

    let loc = await Location.getCurrentPositionAsync({});
    return loc.coords;
  }

  // dropdown
  const parseDropdownOptions = (dropDownOptions) => {
  if (!dropDownOptions) return [];
    const parsed = JSON.parse(dropDownOptions); // get the options back from Get request.
    const options = parsed["ddOptions"];
    return options;
  };

  // photo
  async function handleChangePress(field) {
        let result = await ImagePicker.launchImageLibraryAsync({
             mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setValues(prev => ({
          ...prev,
          [field.id]: `${result.assets[0].uri}`
          }));
        }
        return;
    }

  const load = React.useCallback(async () => { // for loading all fields onto screen
    try {
      setError(null);  // reset variable if an error occured
      const data = await apiRequest(`/field?form_id=eq.${formId}&order=id.asc`);
      setFields(Array.isArray(data) ? data : []);
      if (data.length > 0) { 
        SetEmpty(false);
      }

    } catch (e) {
      setError(e?.message || "Failed to load forms");
    } finally {
      setLoadingFields(false); // first render complete, set to false
    }
    }, []); // empty dep array as it should be loaded once on mount
    // every other call to load() function will use the mounted function.

  useFocusEffect( // runs every time this screen becomes visible
    React.useCallback(() => {
      // first time: show big spinner; subsequent: pull-to-refresh spinner
      if (fields.length === 0) {
        setLoadingFields(true);
      }
      load(); // load data
    }, [load, refreshFieldKey])
  );

  const showNoFieldsAlert = () => {
    Alert.alert(
      "No Fields Found",
      "Please add fields to this form before submitting. Do you want to add fields now?",
      [
        { text: "No", style: "cancel" },
          {
          text: "Yes",
          onPress: () => {
            // insert record here..
            console.log("User chose to add fields");
          },
        },
      ]
    );
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
            style={{ 
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
              {values[f.id] &&  ((
                f.field_type === "Photo") ? (
                  <Image source={{ uri: values[f.id] }} style={styles.answerImage} />
                ) : f.field_type === "Location" ? 
                 <Text
                    style={styles.answerText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {values[f.id]["latitude"]}   {values[f.id]["longtitude"]}
                  </Text>
                  :
                (
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

    {error && (
      <HelperText type="error" visible style={{ marginTop: 6 }}>
        {error}
      </HelperText>
    )}
    {unfinishedSub && (
       <HelperText type="error" visible style={{ marginTop: 6 }}>
        {unfinishedMessage}
      </HelperText>
    )
    }
      <Button
      mode="contained"
      icon="plus"
      onPress={() => { 
        if (empty) {
          showNoFieldsAlert(); 
        } else { 
          handleCreateRecord();
        }}}
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
                  keyboardType={activeField.is_num ? "numeric" : "default"}
                  inputMode={activeField.is_num ? "numeric" : "text"}
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
  answerText: { marginTop: 4, marginLeft: 6, color: "grey",fontSize: 12, },
  answerImage: { marginTop: 6, width: 240, height: 240, borderRadius: 8, resizeMode: "cover" },
  dialogNoOptionText: { padding: 16, color: '#999', textAlign: 'center' },
  dropdownButtons: { marginVertical: 2, marginHorizontal: 8, justifyContent: 'flex-start'}
});