import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GearOwnershipScreen = ({ navigation, route }) => {
  const { selectedSpecies } = route.params;
  const [hasGear, setHasGear] = useState(null);

  const handleGearSelection = (hasGear) => {
    setHasGear(hasGear);
  };

  const handleContinue = () => {
    if (hasGear !== null) {
      if (hasGear) {
        // User has gear - could navigate to a gear recommendation screen
        // For now, we'll go to method questions
        navigation.navigate('MethodQuestion', { 
          selectedSpecies, 
          hasGear 
        });
      } else {
        // User needs gear - go to method questions for recommendations
        navigation.navigate('MethodQuestion', { 
          selectedSpecies, 
          hasGear 
        });
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Do you already have fishing gear?</Text>
          <Text style={styles.subtitle}>
            We'll help you choose the right gear for {selectedSpecies?.name}
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              hasGear === true && styles.selectedCard,
            ]}
            onPress={() => handleGearSelection(true)}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-circle" size={48} color="#059669" />
            </View>
            <Text style={styles.optionTitle}>Yes, I have gear</Text>
            <Text style={styles.optionDescription}>
              I already own fishing equipment
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              hasGear === false && styles.selectedCard,
            ]}
            onPress={() => handleGearSelection(false)}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="add-circle" size={48} color="#dc2626" />
            </View>
            <Text style={styles.optionTitle}>No, I need gear</Text>
            <Text style={styles.optionDescription}>
              I'm starting from scratch
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            hasGear === null && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={hasGear === null}
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 48,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
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
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  iconContainer: {
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
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

export default GearOwnershipScreen; 