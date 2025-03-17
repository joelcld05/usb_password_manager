import { createStaticNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../views/Home";
// import { Suspense, lazy } from "react";

const RootStack = createNativeStackNavigator({
//   screenLayout: ({ children }) => (
//     <Suspense fallback={"Loading"}>{children}</Suspense>
//   ),
  screens: {
    Home: {
      screen: Home,
      options: ({ route }: any) => ({
        title: route?.params?.name || "Contraseñas",
      }),
    },
  },
});

export default createStaticNavigation(RootStack);
