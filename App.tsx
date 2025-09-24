import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp as RNStackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import WelcomeScreen from './src/screens/WelcomeScreen';
import SpeciesSelectorScreen from './src/screens/SpeciesSelectorScreen';
import GearOwnershipScreen from './src/screens/GearOwnershipScreen';
import OwnedGearSelectionScreen from './src/screens/OwnedGearSelectionScreen';
import MethodQuestionScreen from './src/screens/MethodQuestionScreen';
import GearRecommendationScreen from './src/screens/GearRecommendationScreen';

// Define the Species type
export type Species = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

// Define navigation types
export type RootStackParamList = {
  Welcome: undefined;
  SpeciesSelector: undefined;
  GearOwnership: { selectedSpecies: Species };
  OwnedGearSelection: { selectedSpecies: Species; hasGear: boolean };
  MethodQuestion: { selectedSpecies: Species; hasGear: boolean; ownedGear: string[] };
  GearRecommendation: { selectedSpecies: Species; hasGear: boolean; ownedGear: string[]; method: string };
};

export type StackNavigationProp = RNStackNavigationProp<RootStackParamList>;
export type StackRouteProp<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>;

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Welcome"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2563eb',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen} 
          options={{ title: 'BaitMate' }}
        />
        <Stack.Screen 
          name="SpeciesSelector" 
          component={SpeciesSelectorScreen} 
          options={{ title: 'Select Species' }}
        />
        <Stack.Screen 
          name="GearOwnership" 
          component={GearOwnershipScreen} 
          options={{ title: 'Gear Ownership' }}
        />
        <Stack.Screen 
          name="OwnedGearSelection" 
          component={OwnedGearSelectionScreen} 
          options={{ title: 'Select Owned Gear' }}
        />
        <Stack.Screen 
          name="MethodQuestion" 
          component={MethodQuestionScreen} 
          options={{ title: 'Fishing Method' }}
        />
        <Stack.Screen 
          name="GearRecommendation" 
          component={GearRecommendationScreen} 
          options={{ title: 'Recommendations' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;