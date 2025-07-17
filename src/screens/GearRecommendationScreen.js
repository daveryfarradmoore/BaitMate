import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, FlatList, CheckBox, Button, Platform } from 'react-native';

// Placeholder image
const placeholderImg = 'https://via.placeholder.com/80';

// Mock gear data
const mockGear = [
  {
    group: 'Rod',
    items: [
      { name: 'Budget Spinning Rod', description: 'Affordable and reliable rod for beginners.', price: 29.99, tag: 'Cheapest', image: placeholderImg },
      { name: 'Pro Carbon Rod', description: 'Lightweight, sensitive, and durable.', price: 89.99, tag: 'Best Value', image: placeholderImg },
    ],
  },
  {
    group: 'Reel',
    items: [
      { name: 'Entry Spinning Reel', description: 'Smooth drag, easy to use.', price: 19.99, tag: 'Cheapest', image: placeholderImg },
      { name: 'All-Rounder Reel', description: 'Great for most fishing methods.', price: 49.99, tag: 'Best Value', image: placeholderImg },
    ],
  },
  {
    group: 'Line',
    items: [
      { name: 'Mono Line 8lb', description: 'Basic monofilament line.', price: 4.99, tag: 'Cheapest', image: placeholderImg },
      { name: 'Braided Line 10lb', description: 'Strong and sensitive.', price: 14.99, tag: 'Best Value', image: placeholderImg },
    ],
  },
  {
    group: 'Hooks',
    items: [
      { name: 'Basic Hook Set', description: 'Assorted sizes for various fish.', price: 2.99, tag: 'Cheapest', image: placeholderImg },
      { name: 'Premium Hook Set', description: 'Sharp and rust-resistant.', price: 7.99, tag: 'Best Value', image: placeholderImg },
    ],
  },
  {
    group: 'Bobbers',
    items: [
      { name: 'Plastic Bobbers', description: 'Simple and effective.', price: 1.99, tag: 'Cheapest', image: placeholderImg },
      { name: 'Slip Bobbers', description: 'Versatile for different depths.', price: 4.99, tag: 'Best Value', image: placeholderImg },
    ],
  },
  {
    group: 'Sinkers',
    items: [
      { name: 'Split Shot Sinkers', description: 'Easy to attach and adjust.', price: 1.49, tag: 'Cheapest', image: placeholderImg },
      { name: 'Egg Sinkers', description: 'Ideal for bottom fishing.', price: 3.99, tag: 'Best Value', image: placeholderImg },
    ],
  },
  {
    group: 'Bait',
    items: [
      { name: 'Nightcrawlers', description: 'Classic live bait.', price: 3.99, tag: 'Cheapest', image: placeholderImg },
      { name: 'Soft Plastic Worms', description: 'Reusable and effective.', price: 6.99, tag: 'Best Value', image: placeholderImg },
    ],
  },
];

const GearRecommendationScreen = ({ route, navigation }) => {
  // Accept props or context, robust to missing/incorrect params
  const params = route?.params || {};
  console.log('GearRecommendationScreen params:', params);
  let { species, method, gearOwned } = params;

  // Fallbacks and normalization
  // species: can be string or object
  let displaySpecies = 'Bass';
  if (species) {
    if (typeof species === 'string') displaySpecies = species;
    else if (typeof species === 'object' && species.name) displaySpecies = species.name;
  }
  // method: can be string or object
  let displayMethod = 'Shore Fishing';
  if (method) {
    if (typeof method === 'string') displayMethod = method;
    else if (typeof method === 'object' && method.text) displayMethod = method.text;
  }
  // gearOwned: can be boolean or array
  let normalizedGearOwned = [];
  if (Array.isArray(gearOwned)) normalizedGearOwned = gearOwned;
  else if (typeof gearOwned === 'boolean') normalizedGearOwned = gearOwned;
  else normalizedGearOwned = [];

  // Toggle state: 'Cheapest' or 'Best Value'
  const [toggle, setToggle] = useState('Best Value');
  // Track checked items
  const [owned, setOwned] = useState(() => {
    // If gearOwned is boolean and true, mark all as owned
    if (typeof normalizedGearOwned === 'boolean' && normalizedGearOwned) {
      const all = {};
      mockGear.forEach(group => {
        group.items.forEach(item => {
          all[item.name] = true;
        });
      });
      return all;
    }
    // If array, mark those as owned
    if (Array.isArray(normalizedGearOwned)) {
      const all = {};
      normalizedGearOwned.forEach(name => { all[name] = true; });
      return all;
    }
    return {};
  });

  // Filter gear by toggle
  const recommendedGear = useMemo(() => {
    return mockGear.map(group => {
      const item = group.items.find(i => i.tag === toggle) || group.items[0];
      return { ...item, group: group.group };
    });
  }, [toggle]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    return recommendedGear.reduce((sum, item) => {
      if (!owned[item.name]) sum += item.price;
      return sum;
    }, 0);
  }, [owned, recommendedGear]);

  // Handle checkbox toggle
  const handleToggleOwned = (name) => {
    setOwned(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Render gear card
  const renderGearCard = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.gearName}>{item.group}: {item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.price}>${item.price.toFixed(2)} <Text style={styles.tag}>[{item.tag}]</Text></Text>
        <View style={styles.checkboxRow}>
          <CheckBox
            value={!!owned[item.name]}
            onValueChange={() => handleToggleOwned(item.name)}
            style={styles.checkbox}
          />
          <Text style={styles.checkboxLabel}>I already own this</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recommended Gear for {displaySpecies} ({displayMethod})</Text>
      {/* Toggle Buttons */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, toggle === 'Cheapest' && styles.toggleActive]}
          onPress={() => setToggle('Cheapest')}
        >
          <Text style={[styles.toggleText, toggle === 'Cheapest' && styles.toggleTextActive]}>Cheapest</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, toggle === 'Best Value' && styles.toggleActive]}
          onPress={() => setToggle('Best Value')}
        >
          <Text style={[styles.toggleText, toggle === 'Best Value' && styles.toggleTextActive]}>Best Value</Text>
        </TouchableOpacity>
      </View>
      {/* Gear List */}
      <FlatList
        data={recommendedGear}
        renderItem={renderGearCard}
        keyExtractor={item => item.name}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />
      {/* Sticky Footer */}
      <View style={styles.footer}>
        <Text style={styles.totalText}>Estimated Total: ${totalPrice.toFixed(2)}</Text>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => {
            console.log('Continue pressed');
            // navigation.navigate('NextScreen'); // Uncomment when next screen exists
          }}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#007bff',
  },
  toggleText: {
    fontSize: 16,
    color: '#495057',
  },
  toggleTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#dee2e6',
  },
  gearName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  tag: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: 'bold',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  checkbox: {
    marginRight: 6,
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#495057',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  totalText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#007bff',
  },
  continueBtn: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GearRecommendationScreen; 