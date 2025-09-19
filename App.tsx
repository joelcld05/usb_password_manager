import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Icon } from "react-native-elements";
import { StatusBar } from "expo-status-bar";

import Navigation from "./routes";


const DATA = [
  {
    id: "bd7acbea-c1b1-46c2-aed5-3ad53abb28ba",
    title: "Inicio",
    icon: "key",
  },
  {
    id: "3ac68afc-c605-48d3-a4f8-fbd91aa97f63",
    title: "Configuaración",
    icon: "cogleftcircle",
  },
];

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <SafeAreaView style={{ flexDirection: "row" }}>
        <View style={styles.leftMenu}>
          <FlatList
            data={DATA}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Icon name={item.icon} />
                <Text style={styles.title}>{item.title}</Text>
              </View>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Navigation />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  leftMenu: { flex: 1, minWidth: 100, maxWidth: 250, paddingTop: 10 },
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  item: {
    padding: 5,
    marginVertical: 0,
    marginHorizontal: 5,
    flexDirection: "row",
  },
  title: {
    fontSize: 15,
  },
});
