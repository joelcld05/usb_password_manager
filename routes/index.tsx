import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createStaticNavigation } from "@react-navigation/native";

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
        title: route?.params?.name || "Home",
      }),
    },
  },
});

export default createStaticNavigation(RootStack);
