// app/about.jsx
import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Appbar,
  Card,
  Text,
  List,
  Divider,
  Surface,
  Button,
} from "react-native-paper";
import Header from "../components/header"
import { useRouter } from "expo-router";

/**
 * About screen component
 * Displays app information, features, technologies used, and a navigation button to Forms.
 * Uses React Native Paper Cards and Lists for structured layout, and SafeAreaView for proper spacing.
 */
export default function About() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <Header />

      <ScrollView contentContainerStyle={styles.content}>
        <Card mode="elevated" style={styles.hero}>
          <Surface style={styles.heroInner}>
            <Card.Cover
              source={require("../assets/images/FormBaseimg.png")}
              style={styles.heroImage}
            />
            <View style={{ alignItems: "center", marginTop: 12 }}>
              <Text variant="titleLarge" style={styles.appName}>
                Build, Collect & Explore
              </Text>
            </View>
          </Surface>
        </Card>

        <Card mode="elevated" style={styles.sectionCard}>
          <Card.Title title="✨ Features" />
          <Divider />
          <Card.Content>
            <List.Section>
              <List.Item
                title="Create forms with a variety of fields"
                titleStyle={styles.cardlistfont}
                left={(p) => <List.Icon {...p} icon="form-select" />}
              />
              <List.Item
                title="Collect records right on your phone"
                titleStyle={styles.cardlistfont}
                left={(p) => <List.Icon {...p} icon="cellphone-check" />}
              />
              <List.Item
                title="Search & filter with flexible conditions"
                titleStyle={styles.cardlistfont}
                left={(p) => <List.Icon {...p} icon="filter-variant" />}
              />
              <List.Item
                title="Visualize location data on a map"
                left={(p) => <List.Icon {...p} icon="map-marker" />}
                titleStyle={styles.cardlistfont}
              />
            </List.Section>
          </Card.Content>
        </Card>

        <Card mode="elevated" style={styles.sectionCard}>
          <Card.Title title="🚀 Powered By" />
          <Divider />
          <Card.Content>
            <List.Section>
              <List.Item
                title="Expo + React Native"
                titleStyle={styles.cardlistfont}
                left={(p) => <List.Icon {...p} icon="react" />}
              />
              <List.Item
                title="PostgREST / REST API backend"
                titleStyle={styles.cardlistfont}
                left={(p) => <List.Icon {...p} icon="database" />}
              />
              <List.Item
                title="React Native Paper UI components"
                titleStyle={styles.cardlistfont}
                left={(p) => <List.Icon {...p} icon="palette-swatch" />}
              />
              <List.Item
                title="React Navigation + expo-router"
                titleStyle={styles.cardlistfont}
                left={(p) => <List.Icon {...p} icon="routes" />}
              />
            </List.Section>
          </Card.Content>
        </Card>
      <Button
        mode="contained"
        icon="file-document-outline"
        style={styles.newFormButton}
        contentStyle={{ paddingVertical: 6 }}
        onPress={() => router.push("/forms")} // <-- your next screen route
      >
        Go to Forms
      </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f7f8fb" },
  content: { padding: 16, gap: 16 },
  hero: { borderRadius: 16 },
  heroInner: { padding: 16, backgroundColor: "#eaf1ff", borderRadius: 16 },
  heroImage: { height: 80, width: 80, alignSelf: "center", borderRadius: 12 },
  appName: { fontWeight: "400", marginTop: 4 },
  tagline: { opacity: 0.7 },
  sectionCard: {
    borderRadius: 16,
  },
  newFormButton: { marginTop: 16, alignSelf: "center", borderRadius: 12, elevation: 2, backgroundColor: '#3A506B'},
  cardlistfont: {fontSize: 13} 
});