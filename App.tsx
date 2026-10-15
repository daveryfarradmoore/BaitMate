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
import BudgetScreen from './src/screens/BudgetScreen';
import FishingMapScreen from './src/screens/FishingMapScreen';
import { Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './src/theme';

// Define the Species type
export type Species = {
  id: string;
  name: string;
  icon?: string | number;
  color: string;
};

// Define navigation types
export type RootStackParamList = {
  Welcome: undefined;
  SpeciesSelector: undefined;
  GearOwnership: { selectedSpecies: Species };
  OwnedGearSelection: { selectedSpecies: Species };
  Budget: { selectedSpecies: Species; hasGear: boolean; ownedGroups: string[]; budgetUSD?: number };
  MethodQuestion: { selectedSpecies: Species; hasGear: boolean; ownedGroups: string[]; budgetUSD: number };
  GearRecommendation: { selectedSpecies: Species; ownedGroups: string[]; method: string; budgetUSD: number };
  FishingMap: undefined;
};

export type StackNavigationProp = RNStackNavigationProp<RootStackParamList>;
export type StackRouteProp<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>;

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Welcome"
        screenOptions={({ navigation }) => ({
          headerStyle: {
            backgroundColor: colors.canvas,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTintColor: colors.ink,
          headerTitleStyle: {
            fontWeight: '700',
          },
          headerBackTitleVisible: false,
          headerRight: () => <TouchableOpacity accessibilityRole="button" accessibilityLabel="Explore fishing map" onPress={() => navigation.navigate('FishingMap')} style={{ padding: 12, marginRight: 12 }}><Ionicons name="map-outline" size={22} color={colors.brand} /></TouchableOpacity>,
          // Stack's web CardSheet normally expands for document scrolling,
          // but Expo locks the body. Keep screens bounded so ScrollView and
          // FlatList own scrolling, including when the window is resized.
          cardStyle: {
            backgroundColor: colors.canvas,
            ...(Platform.OS === 'web' ? { flex: 1, minHeight: 0, overflow: 'hidden' as const } : {}),
          },
        })}
      >
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen} 
          options={{ headerShown: false }}
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
        <Stack.Screen name="Budget" component={BudgetScreen} options={{ title: 'Your Budget' }} />
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
        <Stack.Screen
          name="FishingMap"
          component={FishingMapScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
