import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp, StackRouteProp } from '../../App';

type Species = { id: string; name: string; icon: string; color: string };

const speciesData: Species[] = [
  { id: 'atlantic-salmon', name: 'Atlantic Salmon', icon: 'fish', color: '#dc2626' },
  { id: 'largemouth-bass', name: 'Largemouth Bass', icon: 'fish', color: '#059669' },
  { id: 'smallmouth-bass', name: 'Smallmouth Bass', icon: 'fish', color: '#059669' },
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
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleContinue = () => {
    if (selectedSpecies) {
      const species = speciesData.find(s => s.id === selectedSpecies);
      if (species) {
        navigation.navigate('GearOwnership', { selectedSpecies: species });
      }
    }
  };

  const handleSpeciesSelect = (speciesId: string) => {
    setSelectedSpecies(speciesId);
    setIsModalVisible(false);
  };

  const selectedSpeciesData = speciesData.find(s => s.id === selectedSpecies);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>What are you fishing for?</Text>
        <Text style={styles.subtitle}>Select your target species</Text>
      </View>

      <TouchableOpacity 
        style={styles.dropdownWrapper}
        onPress={() => setIsModalVisible(true)}
      >
        <Ionicons name="water" size={20} color="#2563eb" style={styles.dropdownIcon} />
        <Text style={styles.dropdownText}>
          {selectedSpeciesData ? selectedSpeciesData.name : "-- Select Species --"}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#6b7280" style={styles.chevronIcon} />
      </TouchableOpacity>

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

      {/* Species Selection Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Species</Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={speciesData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.speciesItem,
                    selectedSpecies === item.id && styles.selectedSpeciesItem
                  ]}
                  onPress={() => handleSpeciesSelect(item.id)}
                >
                  <View style={[styles.speciesColor, { backgroundColor: item.color }]} />
                  <Text style={[
                    styles.speciesName,
                    selectedSpecies === item.id && styles.selectedSpeciesName
                  ]}>
                    {item.name}
                  </Text>
                  {selectedSpecies === item.id && (
                    <Ionicons name="checkmark" size={20} color="#2563eb" />
                  )}
                </TouchableOpacity>
              )}
              style={styles.speciesList}
            />
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 15,
    backgroundColor: 'white',
  },
  dropdownIcon: { marginRight: 12 },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  chevronIcon: { marginLeft: 8 },
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  speciesList: {
    flex: 1,
  },
  speciesItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedSpeciesItem: {
    backgroundColor: '#eff6ff',
  },
  speciesColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  speciesName: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  selectedSpeciesName: {
    color: '#2563eb',
    fontWeight: '600',
  },
});

export default SpeciesSelectorScreen;
