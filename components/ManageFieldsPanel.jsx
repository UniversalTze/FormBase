import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, TextInput, Switch, Button, Divider, Menu } from "react-native-paper";


// Optional: pass onSave to do the API call; return a promise so we can show loading
export default function ManageFieldsPanel({
  initialExpanded = false,
  onSave,                   // async ({ name, type, required, numeric }) => void
}) {
  const [expanded, setExpanded] = React.useState(initialExpanded);
  const [name, setName] = React.useState("");
  const [typeOpen, setTypeOpen] = React.useState(false);
  const [type, setType] = React.useState("text");
  const [required, setRequired] = React.useState(false);
  const [numeric, setNumeric] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [dropdownJson, setDropdownJson] = React.useState("");

  const anchorRef = React.useRef(null);
  const [menuKey, setMenuKey] = React.useState(0); // use to re-render dropdown so that 


  const canSave = name.trim().length > 0 && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    try {
      setSaving(true);
      if (onSave) {
       // await onSave({ name: name.trim(), type, dropdownJson, required, numeric, order_index=1 }); // for fields
       await onSave(); 
      }
      // reset & collapse
      setDropdownJson("");
      setName("");
      setType("text");
      setRequired(false);
      setNumeric(false);
      setExpanded(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card mode="elevated" style={styles.card}>
      <Card.Title
        title="Manage Fields"
        titleStyle={{ fontWeight: "700" }}
        style={styles.addbtn}
        right={(props) => (
          <Button
            {...props}
            mode={expanded ? "outlined" : "contained-tonal"}
            icon={expanded ? "close" : "plus"}
            onPress={() => setExpanded((x) => !x)}
          >
            {expanded ? "Cancel" : "Add Field"}
          </Button>
        )}
      />

      {expanded && (
        <View>
          <Divider />
          <Card.Content style={{ paddingTop: 12 }}>
            <Text style={styles.subhead}>Add a Field</Text>

            <TextInput
              mode="outlined"
              label="Field name"
              value={name}
              onChangeText={setName}
              style={{ marginTop: 8 }}
              autoCapitalize="sentences"
              returnKeyType="Finish"
            />

            <View style={{ marginTop: 12 }}>
              <Menu
                key={menuKey}
                visible={typeOpen}
                onDismiss={() => { setTypeOpen(false)
                                   setMenuKey(prev => prev + 1)
                  }
                }
                anchor={
                  <Button
                    ref={anchorRef}
                    mode="outlined"
                    icon="chevron-down"
                    onPress={() => setTypeOpen(true)}
                    contentStyle={{ justifyContent: "space-between" }}
                  >
                    {type}
                  </Button>
                }
              >
                {["text", "multiline", "dropdown", "location"].map((opt) => (
                  <Menu.Item
                    key={opt}
                    onPress={() => {
                      setType(opt);
                      setTypeOpen(false);
                    }}
                    title={opt}
                  />
                ))}
              </Menu>
            </View>
            {type === "dropdown" && (
            <View style={{ marginTop: 12 }}>
            <Text style={styles.subhead}>Dropdown Options (JSON)</Text>
            <TextInput
                mode="outlined"
                label='JSON: {dropdown: ["option1", "option2"]}'
                value={dropdownJson}
                onChangeText={setDropdownJson}
                multiline
                numberOfLines={4}
                style={{ marginTop: 8, fontSize: 12}}
                />
            </View>
            )}

            <View style={styles.row}>
              <Text>Required</Text>
              <Switch value={required} onValueChange={setRequired} />
            </View>

            <View style={styles.row}>
              <Text>Stores Numeric Values</Text>
              <Switch value={numeric} onValueChange={setNumeric} />
            </View>

            <Button
              mode="contained"
              icon="plus"
              onPress={handleSave}
              disabled={!canSave}
              loading={saving}
              style={{ marginTop: 12, borderRadius: 20, marginBottom: 12 }}
              contentStyle={{ paddingVertical: 6 }}
            >
              Save Field
            </Button>
          </Card.Content>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, backgroundColor: "#fff", marginTop: 12, marginBottom: 16 },
  addbtn: { padding: 8},
  subhead: { fontWeight: "600", marginBottom: 4 },
  row: { marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
});
