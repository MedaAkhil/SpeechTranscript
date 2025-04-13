// import React from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import HomeScreen from "./screens/HomeScreen";
// import AudioPreviewScreen from "./screens/AudioPreviewScreen";

// export type RootStackParamList = {
//   Home: undefined;
//   AudioPreview: { audioURI: string };
// };

// const Stack = createStackNavigator<RootStackParamList>();

// export default function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="Home">
//         <Stack.Screen name="Home" component={HomeScreen} />
//         <Stack.Screen name="AudioPreview" component={AudioPreviewScreen} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }








import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { Stack } from "expo-router";
import HomeScreen from "./screens/HomeScreen";
import AudioPreviewScreen from "./screens/AudioPreviewScreen";


export type RootStackParamList = {
  Home: undefined;
  AudioPreview: { audioURI: string };
};

const StackNavigator = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <StackNavigator.Navigator initialRouteName="Home">
      <StackNavigator.Screen name="FusionThinkers" component={HomeScreen} />
      <StackNavigator.Screen name="AudioPreview" component={AudioPreviewScreen} />
    </StackNavigator.Navigator>
  );
}