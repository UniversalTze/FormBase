import * as React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Appbar, Button, Card, Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";


// when expo is used to make native apps, expo router is used to set up routes 
// and navigations between different pages in app. 
// app is route directory (where router expects to find all of components)
// instead of using registerRouteComponent in expo
// this file is rendered when application is ran (entry point)


export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}  edges={["top", "bottom"]}>
      {/* Top bar (custom, since headerShown:false) */}
      <Appbar.Header mode="center-aligned" elevated style={styles.header}>
        <Appbar.Action icon="menu" color="white" onPress={() => {/* open drawer if you add one */}} />
        <Appbar.Content title="FormBase" color="white"  />
      </Appbar.Header>

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
          style={styles.cta}
          contentStyle={{ paddingVertical: 6 }}
         // onPress={() => router.push("/builder")} // <-- your next screen route
        >
          Create a New Form
        </Button>
      </View>
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.navButton}> {/* placeholders for now */}
          <Text style={styles.navText}>Home</Text> 
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navText}>Forms</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {backgroundColor: '#3A506B'}, 
  safeArea: { flex: 1, backgroundColor: "#fff" },   // moved here
  container: { flex: 1, paddingHorizontal: 18, alignItems: "center" },
  title: { marginTop: 48, fontWeight: "700", textAlign: "center" },
  secondfont: { marginBottom: 24, fontWeight: "500", textAlign: "center", fontSize: 18 },
  heroCard: { width: 350, overflow: "hidden", marginBottom: 24 },
  heroImage: { height: 220, backgroundColor: "#eaf1ff" },
  cta: { marginTop: 16, alignSelf: "center", borderRadius: 12, elevation: 2, backgroundColor: '#3A506B'},
  bottomBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, backgroundColor: '#1E2A38'},
  navButton: { padding: 8 },
   navText: { color: 'white', fontSize: 16 }
});