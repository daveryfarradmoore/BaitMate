import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseClient } from './src/lib/supabase';
import AccountScreen from './src/screens/AccountScreen';
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
import { ActivityIndicator, Platform, TouchableOpacity, View } from 'react-native';
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
  Account: undefined;
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
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    // Subscribe before restoring storage so a newer login/logout event wins
    // over an older getSession result. See docs/CODEBASE_GUIDE.md.
    const client = getSupabaseClient();
    if (!client) { setReady(true); return; }
    let active = true;
    let changed = false;
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, next) => {
      changed = true;
      if (active) { setSession(next); setReady(true); }
    });
    client.auth.getSession().then(({ data, error }) => {
      if (active && !changed) { setSession(error ? null : data.session); setReady(true); }
    }).catch(() => { if (active) setReady(true); });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  if (!ready) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.canvas }}><ActivityIndicator accessibilityLabel="Restoring your account" color={colors.brand} /></View>;
  return (
    <NavigationContainer>
      <Stack.Navigator 
        // Reset navigation history when authentication status changes.
        key={session ? 'signed-in' : 'guest'}
        initialRouteName={session ? 'SpeciesSelector' : 'Welcome'}
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
          headerRight: () => <View style={{ flexDirection: 'row' }}><TouchableOpacity accessibilityRole="button" accessibilityLabel="Your account" onPress={() => navigation.navigate('Account')} style={{ padding: 12 }}><Ionicons name="person-circle-outline" size={24} color={colors.brand} /></TouchableOpacity><TouchableOpacity accessibilityRole="button" accessibilityLabel="Explore fishing map" onPress={() => navigation.navigate('FishingMap')} style={{ padding: 12, marginRight: 12 }}><Ionicons name="map-outline" size={22} color={colors.brand} /></TouchableOpacity></View>,
          // Stack's web CardSheet normally expands for document scrolling,
          // but Expo locks the body. Keep screens bounded so ScrollView and
          // FlatList own scrolling, including when the window is resized.
          cardStyle: {
            backgroundColor: colors.canvas,
            ...(Platform.OS === 'web' ? { flex: 1, minHeight: 0, overflow: 'hidden' as const } : {}),
          },
        })}
      >
        <Stack.Screen name="Account" component={AccountScreen} options={{ title: 'Your Account' }} />
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
