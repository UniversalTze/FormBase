import { Text, View } from "react-native";

// when expo is used to make native apps, expo router is used to set up routes 
// and navigations between different pages in app. 
// app is route directory (where router expects to find all of components)
// instead of using registerRouteComponent in expo
// this file is rendered when application is ran (entry point)
export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
