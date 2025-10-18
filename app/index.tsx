import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { useRouter, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/header";


// when expo is used to make native apps, expo router is used to set up routes 
// and navigations between different pages in app. 
// app is route directory (where router expects to find all of components)
// instead of using registerRouteComponent in expo
// this file is rendered when application is ran (entry point)


export default function Welcome() {
  // const router = useRouter();
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea}  edges={["top", "bottom"]}>
      <Header />
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Welcome to FormBase!
        </Text>

        <Text variant="headlineMedium" style={styles.secondfont}>
          Build, Collect & Explore
        </Text>

        <Card mode="elevated" style={styles.heroCard}>
          <Card.Cover
            style={styles.heroImage}
            source={require("../assets/images/FormBaseimg.png")}
          />
        </Card>

        <Button
          mode="contained"
          icon="file-document-outline"
          style={styles.newFormButton}
          contentStyle={{ paddingVertical: 6 }}
          onPress={() => router.push("/forms")} // <-- your next screen route
        >
          Create a New Form
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },   // moved here
  container: { flex: 1, paddingHorizontal: 18, alignItems: "center" },
  title: { marginTop: 48, fontWeight: "700", textAlign: "center" },
  secondfont: { marginBottom: 24, fontWeight: "500", textAlign: "center", fontSize: 18 },
  heroCard: { width: 350, marginBottom: 24 },
  heroImage: { height: 220, backgroundColor: "#eaf1ff" },
  newFormButton: { marginTop: 16, alignSelf: "center", borderRadius: 12, elevation: 2, backgroundColor: '#3A506B'},
  bottomBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, backgroundColor: '#1E2A38'},
  navButton: { padding: 8 },
   navText: { color: 'white', fontSize: 16 }
});