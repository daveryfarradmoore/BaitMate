import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

import WelcomeScreen from './src/screens/WelcomeScreen';
import SpeciesSelectorScreen from './src/screens/SpeciesSelectorScreen';
import GearOwnershipScreen from './src/screens/GearOwnershipScreen';
import MethodQuestionScreen from './src/screens/MethodQuestionScreen';
import OwnedGearSelectionScreen from './src/screens/OwnedGearSelectionScreen';
import GearRecommendationScreen from './src/screens/GearRecommendationScreen';

export type RootStackParamList = {
  Welcome: undefined;
  SpeciesSelector: { selectedSpecies?: { name: string } } | undefined;
  GearOwnership: { selectedSpecies?: { name: string } } | undefined;
  OwnedGearSelection: { selectedSpecies?: { name: string } } | undefined;
  MethodQuestion: { selectedSpecies?: { name: string }; hasGear?: boolean; ownedGroups?: string[] } | undefined;
  GearRecommendation: {
    species?: string | { name: string };
    method?: string | { text: string };
    gearOwned?: boolean | string[];
  } | undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#f8f9fa' }
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="SpeciesSelector" component={SpeciesSelectorScreen} />
        <Stack.Screen name="GearOwnership" component={GearOwnershipScreen} />
        <Stack.Screen name="OwnedGearSelection" component={OwnedGearSelectionScreen} />
        <Stack.Screen name="MethodQuestion" component={MethodQuestionScreen} />
        <Stack.Screen name="GearRecommendation" component={GearRecommendationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}