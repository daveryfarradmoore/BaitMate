import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Switch } from 'react-native';

type Navigation = { navigate: (screen: string, params?: unknown) => void };
type Route = { params: { selectedSpecies?: { name?: string } } };

interface Props { navigation: Navigation; route: Route }

const GEAR_GROUPS: string[] = [
  'Rod',
  'Reel',
  'Line',
  'Hooks',
  'Bobbers',
  'Sinkers',
  'Bait',
  'Lures',
  'Flies'
];

const OwnedGearSelectionScreen = ({ navigation, route }: Props) => {
  const { selectedSpecies } = route.params || {};
  const [ownedGroups, setOwnedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (group: string) => {
    setOwnedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const handleContinue = () => {
    const selected = Object.keys(ownedGroups).filter(k => ownedGroups[k]);
    navigation.navigate('MethodQuestion', {
      selectedSpecies,
      hasGear: true,
      ownedGroups: selected,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>What gear do you already own?</Text>
        <Text style={styles.subtitle}>Select all that apply for {selectedSpecies?.name ?? 'your species'}</Text>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.list}>
        {GEAR_GROUPS.map(group => (
          <View key={group} style={styles.row}>
            <Text style={styles.rowText}>{group}</Text>
            <Switch value={!!ownedGroups[group]} onValueChange={() => toggleGroup(group)} />
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  rowText: { fontSize: 16, color: '#111827', fontWeight: '600' },
  continueButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: { color: 'white', fontSize: 18, fontWeight: '600' },
});

export default OwnedGearSelectionScreen;


