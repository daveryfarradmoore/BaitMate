import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const speciesData = [
  { id: 'salmon', name: 'Salmon', icon: 'fish', color: '#dc2626' },
  { id: 'bass', name: 'Bass', icon: 'fish', color: '#059669' },
  { id: 'catfish', name: 'Catfish', icon: 'fish', color: '#7c3aed' },
  { id: 'trout', name: 'Trout', icon: 'fish', color: '#0891b2' },
  { id: 'bluegill', name: 'Bluegill', icon: 'fish', color: '#ea580c' },
  { id: 'walleye', name: 'Walleye', icon: 'fish', color: '#be185d' },
];

const SpeciesSelectorScreen = ({ navigation }) => {
  const [selectedSpecies, setSelectedSpecies] = useState(null);

  const handleSpeciesSelect = (species) => {
    setSelectedSpecies(species);
  };

  const handleContinue = () => {
    if (selectedSpecies) {
      navigation.navigate('GearOwnership', { selectedSpecies });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>What are you fishing for?</Text>
        <Text style={styles.subtitle}>Select your target species</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {speciesData.map((species) => (
            <TouchableOpacity
              key={species.id}
              style={[
                styles.speciesCard,
                selectedSpecies?.id === species.id && styles.selectedCard,
              ]}
              onPress={() => handleSpeciesSelect(species)}
            >
              <View style={[styles.iconContainer, { backgroundColor: species.color }]}>
                <Ionicons name={species.icon} size={32} color="white" />
              </View>
              <Text style={styles.speciesName}>{species.name}</Text>
              {selectedSpecies?.id === species.id && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={24} color="#2563eb" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

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
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  speciesCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  speciesName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
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
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default SpeciesSelectorScreen; 