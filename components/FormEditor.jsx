// components/FormEditor.jsx
import React from "react";
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";

export default function FormEditor({
  title = "Add Form",
  initial = { name: "", description: "" },
  submitting = false,
  onSubmit, // function pointer/identifer
  onCancel, // function pointer/identifer
  submitLabel = "Submit",
  }) {
  const [name, setName] = React.useState(initial.name || "");
  const [description, setDescription] = React.useState(initial.description || "");
  const canSubmit = name.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await onSubmit({ name: name.trim(), description: description.trim() });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={10} // white space between keyboard and components on screen
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="headlineMedium" style={styles.pageTitle}>
          {title}
        </Text>

        <View style={styles.cardish}>
          <TextInput
            mode="outlined"
            label="Form Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            autoCapitalize="sentences"
            returnKeyType="next"
          />
          <TextInput
            mode="outline"
            label="Description"
            value={description}
            onChangeText={setDescription}
            style={[styles.input, { height: 110 }]}
            multiline
          />
        </View>

        <Button
          mode="contained"
          icon="content-save-outline"
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={submitting}
          style={styles.saveBtn}
          contentStyle={{ paddingVertical: 6 }}
        >
          {submitLabel}
        </Button>

        {onCancel ? (
          <Button mode="text" 
                  onPress={onCancel} 
                  disabled={submitting} 
                  style={styles.cancelBtn}
                  icon="close-circle">
            Cancel
          </Button>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, gap: 16, flexGrow: 1, backgroundColor: "#fff" },
  pageTitle: { fontWeight: "700", marginTop: 8 },
  cardish: {
    backgroundColor: "#f7f8fb",
    borderRadius: 12,
    padding: 12,
  },
  input: { marginBottom: 12 },
  saveBtn: { marginTop: 8, borderRadius: 24, alignSelf: "stretch" },
  cancelBtn: { borderColor: "#EF4444", borderWidth: 1, marginTop: 8 }
});