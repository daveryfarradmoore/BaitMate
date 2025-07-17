import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Import screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import SpeciesSelectorScreen from './src/screens/SpeciesSelectorScreen';
import GearOwnershipScreen from './src/screens/GearOwnershipScreen';
import MethodQuestionScreen from './src/screens/MethodQuestionScreen';
import GearRecommendationScreen from './src/screens/GearRecommendationScreen';

const Stack = createStackNavigator();

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
        <Stack.Screen name="MethodQuestion" component={MethodQuestionScreen} />
        <Stack.Screen name="GearRecommendation" component={GearRecommendationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 