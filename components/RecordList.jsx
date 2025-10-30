// components/RecordList.jsx
import React from "react";

import { View, Text, StyleSheet, Image, Alert, Pressable, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { apiRequest } from "../api/api";
import { useFocusEffect } from "@react-navigation/native";
import { Button, Card, ActivityIndicator, Divider, Portal, Dialog, TextInput, List } from "react-native-paper";
import * as Clipboard from "expo-clipboard";

/**
 * RecordsList Component
 *
 * Displays a scrollable list of records for a given form with filtering capabilities.
 * Each record shows its title and field values, including support for Location and Photo types.
 * Users can filter records by field values using various operators (equals, contains, greater than, etc.).
 *
 * Props:
 * @param {number|string} formId - The ID of the form whose records are displayed.
 * @param {any} refreshRecordKey - Optional key used to trigger reloading of records when it changes.
 *
 * Features:
 * - Dynamic filtering with support for text and numeric field types
 * - Filter operators: equals, contains, starts with (text), greater/less than (numeric)
 * - Copy record data to clipboard (excludes photos)
 * - Delete records with optimistic UI updates
 * - Displays active filters with record count
 * - Clear all filters functionality
 *
 * Internal Functions:
 * - addCriterionForField(field, operation, value)
 *   Adds a filter criterion for a specific field to the criteriaByField Map.
 *   Triggers automatic filtering via useEffect.
 *
 * - applyFilter(criteriaMap)
 *   Builds and executes PostgREST query based on active filter criteria.
 *   Handles URL encoding and type-specific operators (ilike for text, numeric comparisons for numbers).
 *
 * - getFilterSummary()
 *   Returns a human-readable string describing all active filters.
 *
 * - clearFilters()
 *   Removes all active filters and displays original unfiltered records.
 *
 * - handleCopy(record)
 *   Copies a record to clipboard in JSON format, excluding Photo fields.
 *
 * - handleRecordvalue(record, fields)
 *   Renders a record's values as JSX with special formatting for Location and Photo fields.
 *
 * - onDelete(id)
 *   Deletes a record by ID with optimistic UI update. Restores on error.
 *
 * Behavior:
 * - Fetches records and field metadata on mount and when formId changes
 * - Reloads data whenever the screen gains focus
 * - Automatically applies filters when criteriaByField Map changes
 * - Handles loading, empty state, and error states gracefully
 * - Shows filtered results count and active filter summary
 */
export default function RecordsList({ formId, refreshRecordKey }) {
  // pass record and field list. 
  const formid = formId;
  // State management 
  const [records, setRecords] = React.useState([]); // original records
  const [filtered, setFilteredRecords] = React.useState([]); // filtered records
  const [fields, setFields] = React.useState([]); // original fields
  const [loading, setLoading] = React.useState(true); // loading state
  const [empty, SetEmpty] = React.useState(true); // empty
  const [refreshing, setRefreshing] = React.useState(true); // refreshing state
  const [error, setError] = React.useState("");
  const [criteriaOpen, setCriteriaOpen] = React.useState(false); // criteria menu

  const [fieldDialogOpen, setFieldDialogOpen] = React.useState(false); // for field picker
  const [opDialogOpen, setOpDialogOpen] = React.useState(false);
  const [criteriaByField, setCriteriaByField] = React.useState(() => new Map()); // Map<fieldId, Criterion[]>

  const [criteriafield, setCriteriaField] = React.useState(null); // current criteria field
  const [operator, setOperator] = React.useState("");  // for selected operator
  const [filterValue, setFilterValue] = React.useState(""); // current value entered in by user
  const [useFilterData, setUseFilterData] = React.useState(false); // boolean for use of filtered records

  let operatorsByType = {
    number: [
      { value: "eq", label: "Equal" },
      { value: "ne", label: "Not Equal" },
      { value: "gt", label: "Greater" },
      { value: "ge", label: "Greater or Equal" },
      { value: "lt", label: "Less" },
      { value: "le", label: "Less or Equal" },
    ],
    text: [
      { value: "eq", label: "Equals" },
      { value: "contains", label: "Contains" },
      { value: "starts", label: "Starts With" },
    ],
  };

// Add one criterion for a picked field
const addCriterionForField = React.useCallback((field, operation, value) => {
  setCriteriaField(null); // reset variables after adding
  setOperator("");
  setFilterValue("");
  setCriteriaByField(prev => {
    const m = new Map(prev);
    const filters = { "filtOp": operation, "filterVal": value, "is_num": field.is_num};
    m.set(field.id, filters); // {field id: {filters}}
    return m;
    });
  const ops = field?.is_num ? operatorsByType.number : operatorsByType.text;
  const label = ops.find(o => o.value === operation)?.label ?? operation;
  Alert.alert("Filter added", `${field?.name ?? "Field"} ${label} ${String(value)}`);
  }, []); // alert

  const applyFilter = React.useCallback(async (criteriaMap) => {
    if (!criteriaMap || criteriaMap.size === 0) { 
       setUseFilterData(false);
       setFilteredRecords([]);
       setCriteriaOpen(false); // reset criterias 
       return;
    }
  
    let query = `/record?form_id=eq.${formid}`;
  
    // Map through criteriaMap
    criteriaMap.forEach((criteria, fieldId) => {
      const { filtOp, filterVal, is_num } = criteria; // Add is_num to your criteria object
      
      let postgrestOp;
      let finalVal = filterVal;
      
      if (is_num) {
        // Number field - use number operators as-is
        postgrestOp = filtOp; // eq, ne, gt, ge, lt, le
        // Keep value as is (PostgREST will handle string-to-number comparison)
      } else {
        // Text field - convert operators
        if (filtOp === "contains") {
          postgrestOp = "ilike";
          finalVal = `*${filterVal}*`;
        } else if (filtOp === "starts") {
          postgrestOp = "ilike";
          finalVal = `${filterVal}*`;
        } else if (filtOp === "eq") {
          postgrestOp = "eq";
        }
      }
      // build query
      if (is_num) {
      // For numbers with cast
        query += `&values-%3ErecordValues-%3E%3E%22${fieldId}%22::int=${postgrestOp}.${finalVal}`;
      } else {
      // For text
        query += `&values-%3ErecordValues-%3E%3E%22${fieldId}%22=${postgrestOp}.${finalVal}`;
    }
      });
    const data = await apiRequest(query);
    setFilteredRecords(data);
    setUseFilterData(true);
    // Use the query for your API call here
    setCriteriaOpen(false);
  }, [formid]);

  // Watch for changes to criteriaByField (if new criterias are added for searching)
  React.useEffect(() => {
    applyFilter(criteriaByField);        // <-- will always get the latest map
  }, [criteriaByField]); // run function when new criteria has been added.

  // Add this helper function near the top with other functions
  const getFilterSummary = React.useCallback(() => {
    if (criteriaByField.size === 0) return null;
    
    const filters = [];
    criteriaByField.forEach((criteria, fieldId) => {
      const field = fields.find(f => f.id === fieldId);
      if (!field) return;
      
      const ops = field.is_num ? operatorsByType.number : operatorsByType.text;
      const opLabel = ops.find(o => o.value === criteria.filtOp)?.label ?? criteria.filtOp;
      filters.push(`${field.name} ${opLabel} "${criteria.filterVal}"`);
    });
    
    return filters.join(", ");
  }, [criteriaByField, fields]);

  // Add clear filters function
  const clearFilters = React.useCallback(() => {
  setCriteriaByField(new Map());
  setUseFilterData(false);
  setFilteredRecords([]);
  }, []);
  // operator choices depend on the selected field
  const operatorOptions = React.useMemo(
    () => (criteriafield ? (criteriafield.is_num ? operatorsByType.number : operatorsByType.text) : []),
    [criteriafield]
  );

  // show the operator's label in the input
  const getOpLabel = React.useCallback(
    (val) => operatorOptions.find((o) => o.value === val)?.label ?? "",
    [operatorOptions]
  );
  const openOpPicker = () => setOpDialogOpen(true);
  const pickOperator = (opt) => {
    setOperator(opt.value);
    setOpDialogOpen(false);
  };

  // clear everything on cancel so original records are used
  const resetCriteria = React.useCallback(() => {
    setCriteriaField(null);
    setOperator("");
    setFilterValue("");
    setFieldDialogOpen(false);
    setOpDialogOpen(false);
    setCriteriaOpen(false); // back to records view
    setCriteriaByField(new Map()); 
    setFilteredRecords([]);
    setUseFilterData(false);
  }, []);

  const openFieldPicker = () => setFieldDialogOpen(true);

  const pickField = (f) => {
   setCriteriaField(f); // set current field
   setFieldDialogOpen(false);
   setOperator("");     // reset these after
   setFilterValue("");         
  };


  React.useEffect(() => { // load the screen and fill record screen with initial stuff
      (async () => {
        setCriteriaOpen(false); // no dialog box
          try {
            setError(null); // reset error to null for each request. 
            const data = await apiRequest(`/record?form_id=eq.${formid}&order=id.asc`); // Get request for records
            const fieldData = await apiRequest(`/field?form_id=eq.${formid}&order=id.asc`);
            setRecords(data); // data is list of one
            setFields(fieldData);
          } catch (e) {
            setError(e?.message || "Failed to load form"); // set error if caught. 
          } finally {
            setLoading(false);
          }
        })();
    }, [formid]);

  const load = React.useCallback(async () => { // loading new data on updates 
    try {
      setError(null);  // reset variable if an error occured
      const dataRecord = await apiRequest(`/record?form_id=eq.${formid}&order=id.asc`); // GET
      const fieldData = await apiRequest(`/field?form_id=eq.${formid}&order=id.asc`);
      setRecords(dataRecord);
      setFields(fieldData);
    } catch (e) {
      setError(e?.message || "Failed to load records");
    } finally {
      setLoading(false); // first render complete, set to false
      setRefreshing(false); // set to true when needed to refresh the data
    }
    }, []); // empty dep array as it should function should only be loaded and created once
        
  useFocusEffect( // runs load when screen in focus or when told to by refresh key (insertion of record)
    React.useCallback(() => {
      setLoading(true);   // programmatic load -> big center spinner
      load();
    }, [load, refreshRecordKey])
  ); // for when screen comes into focus. 

  // Deleting a record
  const onDelete = React.useCallback(
    async (id) => {
      const prev = records;
      setRecords((xs) => xs.filter((rec) => rec.id !== id));
      try {
        await apiRequest(`/record?id=eq.${id}`, "DELETE");
      } catch (e) {
        setRecords(prev); // reset if any error
      }
    },
    [records, load] // new closure so delete work with latest form values.
  );

  // copying a record to clipboard
  const handleCopy = (record) => {
    let copied = {"id" : record.id}; // copy id
    let values = record?.values; // currently a JSON string
    if (typeof values === "string") {
      try { values = JSON.parse(record.values); } catch {
        return {}; // hadnle invalid JSON
      }
    }
    copied["Title"] = values["Title"]; // copy title 
    let recordFieldVals = values["recordValues"];
      // create a map of index to the object
    const fieldsById = new Map(fields.map(f => [String(f.id), f]));

    Object.entries(recordFieldVals).forEach(([id, v]) => { // map through each variable in record values { field.id: value}
    const field = fieldsById.get(String(id));
    if (!field) return; // skip missing metadata
    if (field.field_type === "Photo") return; // skip images

    if (field.field_type === "Location") {
      Object.entries(v).forEach(([id, coord]) => {
        copied[id] = coord;
      })

    } else { 
        copied[field.name] = v; // use field name as key
      }
    });
    // copy Json format
    const text = JSON.stringify(copied, null, 2);
    Clipboard.setStringAsync(text);
    Alert.alert("Copied!", "Record copied to clipboard.");
    return copied; 
  }

  // for representing a record and displaying it
  const handleRecordvalue = (record, fields) => {
    // record is a JSON object with id, form_id, values.
    let values = record?.values; // currently a JSON string
    if (typeof values === "string") {
      try { values = JSON.parse(record.values); } catch {}
    }
    if (!values || typeof values !== "object") {
      return <Text style={{ opacity: 0.6 }}>No values</Text>;
    }

    // create a map of index to the object
    const fieldsById = new Map(fields.map(f => [String(f.id), f]));

    // Title (top of card)
    const titleNode = (
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 4 }}>
        {values.Title || "Untitled"}
      </Text>
      );
  
    const rows = Object.entries(values["recordValues"])
      .filter(([, v]) => v !== null) // ignore nulls
      .map(([id, v]) => {
        const meta = fieldsById.get(String(id)) || {};
        const type = meta.field_type;
        const name = meta.name;
        let valueNode = null;
        if (type === "Location") {
          const lat = v["latitude"];
          const lng = v["longtitude"];
          valueNode = <Text>Latitude:  {lat} {"\n"}Longtitude: {lng}</Text>
        } else if (type === "Photo") {
          valueNode = <Image source={{uri: v}} style={styles.answerImage} />
        } else {
          valueNode = <Text>{String(v)}</Text>;
        }
        return (
          <View key={id} style={{ paddingVertical: 8 }}>
            <Text style={{ fontSize: 14, color: "#6b7280", marginBottom: 2 }}>
              {name}: ({type})
            </Text>
            {valueNode}
          </View>
        );
      });
    return (
      <View>
        {titleNode}
        <Divider style={{ marginVertical: 6, opacity: 0.3 }} />
        {rows.length ? rows : <Text style={{ opacity: 0.6 }}>No values</Text>}
      </View>
    );
  };

  return (
      <KeyboardAwareScrollView
     style={{ flex: 1 }}
     contentContainerStyle={{ paddingBottom: 24 }}
     enableOnAndroid
     keyboardShouldPersistTaps="handled"
     extraScrollHeight={24}   // pushes field above keyboard
     keyboardOpeningTime={0}
   >
    <View style={{ alignItems: 'flex-end', paddingRight: 16}}>
    <Button 
      compact 
      mode="contained"
      icon="pencil-outline"
      textColor="#fff"
      onPress={() => setCriteriaOpen(true)}
      style={[styles.criteriaBtn, { alignSelf: 'flex-end' }]}
      contentStyle={styles.btnContent}
    >
      Add Criteria
    </Button>
  </View>
    {useFilterData && criteriaByField.size > 0 && (
      <Card style={[styles.card, { backgroundColor: '#e0f2fe' }]}>
        <Card.Content>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600', marginBottom: 4 }}>
                Active Filters ({filtered.length} record{filtered.length !== 1 ? 's' : ''})
              </Text>
              <Text style={{ fontSize: 13, color: '#555' }}>
                {getFilterSummary()}
              </Text>
            </View>
            <Button 
              mode="contained" 
              compact
              buttonColor="#ef4444"
              onPress={clearFilters}
              icon="close"
              style={{ borderRadius: 20 }}
            >
              Clear
            </Button>
          </View>
        </Card.Content>
      </Card>
    )}
    {criteriaOpen ? 
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <Text style={styles.title}>
          Add Filter Criteria
        </Text>
        <Text variant="bodyMedium" style={styles.sub}>
          Select a field, operator and enter a value:
        </Text>
        {/* Field picker (fake dropdown using TextInput + Dialog) */}
        <Pressable accessibilityRole="button" onPress={openFieldPicker}>
    {/* Let the parent Pressable get the touch */}
    <View pointerEvents="none">
      <TextInput
        mode="outlined"
        label="Field"
        value={criteriafield?.name || ""}   // use your actual field shape
        editable={false}
        right={<TextInput.Icon icon="chevron-down" />}
        style={styles.input}
    />
    </View>
  </Pressable>
  <Pressable
      accessibilityRole="button"
      onPress={openOpPicker}
      disabled={!criteriafield}
      style={{ opacity: criteriafield ? 1 : 0.5, marginTop: 8}}
    >
      <View pointerEvents="none">
        <TextInput
          mode="outlined"
          label="Operator"
          value={getOpLabel(operator)}
          editable={false}
          right={<TextInput.Icon icon="chevron-down" />}
          style={styles.input}
        />
      </View>
    </Pressable>
    <TextInput
      mode="outlined"
      label={criteriafield?.is_num ? "Value (number)" : "Value"}
      value={filterValue}
      onChangeText={setFilterValue}
      keyboardType={criteriafield?.is_num ? "numeric" : "default"}
      editable={Boolean(criteriafield) && Boolean(operator)}   // require field + operator first
      style={[styles.input, { marginTop: 8, opacity: criteriafield && operator ? 1 : 0.5 }]}
    />
  <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
  <Button
    mode="contained"
    disabled={!criteriafield || !operator || !filterValue}
    onPress={() => {
      if (!criteriafield) return;
      addCriterionForField(criteriafield, operator, filterValue);
    }}
  >
    Add
  </Button>
  <Button
    mode="text"
    onPress={resetCriteria}
  >
    Cancel
  </Button>
  </View>
  <Portal>
  <Dialog visible={fieldDialogOpen} onDismiss={() => setFieldDialogOpen(false)} style={styles.dialog}>
    <Dialog.Title>Select field</Dialog.Title>
        <Dialog.ScrollArea style={{ maxHeight: 400, paddingHorizontal: 0 }}>
          <List.Section>
            {fields.filter((f) => (f.field_type === "Single-Line-Text" || f.field_type === "Multi-Line-Text" 
                                    || f.field_type === "Dropdown")).map((f) => (
              <List.Item
                key={f.id}
                title={f.name}                     // was f.label
                description={f.field_type}         // was f.type
                onPress={() => pickField(f)}
              />
            ))}
            </List.Section>
          </Dialog.ScrollArea>
        </Dialog>
        </Portal>
        <Portal>
          <Dialog visible={opDialogOpen} onDismiss={() => setOpDialogOpen(false)} style={styles.dialog}>
            <Dialog.Title>Select operator</Dialog.Title>
            <Dialog.Content style={{ paddingLeft: 0 }}>
              {operatorOptions.map((opt, i) => (
                <List.Item
                  key={opt.value}
                  title={opt.label}
                  onPress={() => pickOperator(opt)}
                />
              ))}
            </Dialog.Content>
          </Dialog>
        </Portal>
      </Card.Content>
       </Card>
    : (useFilterData ? filtered : records).length > 0 ? (
      <View style={styles.container}>
        {(useFilterData ? filtered : records).map((r) => (
          <Card key={r.id} mode="elevated" style={styles.heroCard}>
            <Card.Content>
              {handleRecordvalue(r, fields)}
            </Card.Content>
            <Card.Actions style={{ justifyContent: 'center', alignContent: 'center'}}>
            <Button 
              compact 
              mode="contained"
              icon="pencil-outline"
              buttonColor="#5B7C99"      // Edit = amber
              textColor="#fff"
              style={styles.btn}
              contentStyle={styles.btnContent}
              onPress={() => handleCopy(r)}
              >
              Copy
            </Button>
            <Button
              compact
              mode="contained"
              onPress={() => onDelete(r.id)}
              buttonColor="#EF4444"
              icon="trash-can"
              style={styles.btn}
              contentStyle={styles.btnContent}
            >
              Delete
            </Button>
          </Card.Actions>
          </Card>
        ))}
      </View>
    ) : loading ?  
        <View style={styles.center}>
        <ActivityIndicator />
      <Text style={{ marginTop: 8 }}>Loading…</Text>
      </View> 
      : error ? ( // show message arror
        <View style={styles.center}> 
            <Text>{error}
            </Text>
        </View>)  
      :
    (
      <View style={{ alignItems: 'center', paddingHorizontal: 12}}>
        <Card mode="elevated" style={styles.heroCard}>
          <Card.Cover
            style={styles.heroImage}
            source={require("../assets/images/batmanRain.jpg")}
          />
          <Card.Content style={styles.emptyFont}>
            <Text style={{ fontSize: 16, color: '#555' }}>
              No records found. Start by adding a new record or changing your filters....
            </Text>
          </Card.Content>
        </Card>
      </View>
    )}
  </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 12, padding: 8 },
  heroCard: { width: 350, marginBottom: 12, borderRadius: 12, marginTop: 8, width: '100%'}, // take 100 % of card space
  heroImage: { height: 220, backgroundColor: "#eaf1ff", borderRadius: 12, padding: 8},
  emptyFont: { fontSize: 16, color: '#555', marginTop: 12 },
  answerImage: { marginTop: 6, width: 280, height: 280, borderRadius: 8, resizeMode: "cover" },
  btnContent: { paddingVertical: 2, paddingHorizontal: 4 },
  btn: { borderRadius: 20 },
  criteriaBtn: { marginTop: 18 },
  card: { marginHorizontal: 16, marginTop: 16, borderRadius: 16 }, 
  sub: { color: "#6b7280", marginBottom: 12 },
  title: { fontWeight: "700",  color: "#000", marginBottom: 4,fontSize: 18},
  dialog: { borderRadius: 16, marginHorizontal: 14, alignSelf: "center", width: "92%" },
});