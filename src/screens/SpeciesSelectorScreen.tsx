import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { StackNavigationProp, StackRouteProp } from '../../App';

type Species = { id: string; name: string; icon: string; color: string };

const speciesData: Species[] = [
  { id: 'atlantic-salmon', name: 'Atlantic Salmon', icon: 'fish', color: '#dc2626' },
  { id: 'largemouth-bass', name: 'Bass - Largemouth', icon: 'fish', color: '#059669' },
  { id: 'smallmouth-bass', name: 'Bass - Smallmouth', icon: 'fish', color: '#059669' },
  { id: 'bluegill', name: 'Bluegill', icon: 'fish', color: '#ea580c' },
  { id: 'brook-trout', name: 'Brook Trout', icon: 'fish', color: '#0891b2' },
  { id: 'brown-trout', name: 'Brown Trout', icon: 'fish', color: '#0891b2' },
  { id: 'bullheads', name: 'Bullheads', icon: 'fish', color: '#7c3aed' },
  { id: 'channel-catfish', name: 'Channel Catfish', icon: 'fish', color: '#7c3aed' },
  { id: 'chinook-salmon', name: 'Chinook Salmon', icon: 'fish', color: '#dc2626' },
  { id: 'coho-salmon', name: 'Coho Salmon', icon: 'fish', color: '#dc2626' },
  { id: 'common-carp', name: 'Common Carp and Suckers', icon: 'fish', color: '#6b7280' },
  { id: 'crappie', name: 'Crappie', icon: 'fish', color: '#8b5cf6' },
  { id: 'flathead-catfish', name: 'Flathead Catfish', icon: 'fish', color: '#7c3aed' },
  { id: 'lake-sturgeon', name: 'Lake Sturgeon', icon: 'fish', color: '#374151' },
  { id: 'lake-trout', name: 'Lake Trout', icon: 'fish', color: '#0891b2' },
  { id: 'menominee', name: 'Menominee', icon: 'fish', color: '#f59e0b' },
  { id: 'muskellunge', name: 'Muskellunge', icon: 'fish', color: '#10b981' },
  { id: 'northern-pike', name: 'Northern Pike', icon: 'fish', color: '#10b981' },
  { id: 'pink-salmon', name: 'Pink Salmon', icon: 'fish', color: '#dc2626' },
  { id: 'pumpkinseed', name: 'Pumpkinseed', icon: 'fish', color: '#ea580c' },
  { id: 'rainbow-trout', name: 'Rainbow Trout', icon: 'fish', color: '#0891b2' },
  { id: 'rock-bass', name: 'Rock Bass', icon: 'fish', color: '#059669' },
  { id: 'smelt', name: 'Smelt', icon: 'fish', color: '#6b7280' },
  { id: 'steelhead-trout', name: 'Steelhead Trout', icon: 'fish', color: '#0891b2' },
  { id: 'redear-sunfish', name: 'Redear Sunfish', icon: 'fish', color: '#ea580c' },
  { id: 'walleye', name: 'Walleye', icon: 'fish', color: '#be185d' },
  { id: 'white-bass', name: 'White Bass', icon: 'fish', color: '#059669' },
  { id: 'whitefish', name: 'Whitefish', icon: 'fish', color: '#6b7280' },
  { id: 'yellow-perch', name: 'Yellow Perch', icon: 'fish', color: '#f59e0b' },
];

type Props = {
  navigation: StackNavigationProp;
  route: StackRouteProp<'SpeciesSelector'>;
};

const SpeciesSelectorScreen = ({ navigation }: Props) => {
  const [selectedSpecies, setSelectedSpecies] = useState<string>("");

  const handleContinue = () => {
    if (selectedSpecies) {
      const species = speciesData.find(s => s.id === selectedSpecies);
      if (species) {
        navigation.navigate('GearOwnership', { selectedSpecies: species });
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>What are you fishing for?</Text>
        <Text style={styles.subtitle}>Select your target species</Text>
      </View>

      <View style={styles.dropdownWrapper}>
        <Ionicons name="water" size={20} color="#2563eb" style={styles.dropdownIcon} />
        <Picker
          selectedValue={selectedSpecies}
          onValueChange={(itemValue: string) => setSelectedSpecies(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="-- Select Species --" value="" />
          {speciesData.map((species) => (
            <Picker.Item 
              key={species.id} 
              label={species.name} 
              value={species.id} 
            />
          ))}
        </Picker>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedSpecies && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!selectedSpecies}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name={"arrow-forward"} size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 },
  title: {
    fontSize: 28, fontWeight: 'bold', color: '#1f2937',
    textAlign: 'center', marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: '#6b7280', textAlign: 'center' },
  dropdownWrapper: {
    marginHorizontal: 24,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
  },
  dropdownIcon: { marginLeft: 12 },
  picker: { flex: 1, height: 50 },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  continueButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: { backgroundColor: '#9ca3af' },
  continueButtonText: {
    color: 'white', fontSize: 18, fontWeight: '600', marginRight: 8,
  },
});

export default SpeciesSelectorScreen;
