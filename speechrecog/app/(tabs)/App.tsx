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
      <StackNavigator.Screen name="Home" component={HomeScreen} />
      <StackNavigator.Screen name="AudioPreview" component={AudioPreviewScreen} />
    </StackNavigator.Navigator>
  );
}