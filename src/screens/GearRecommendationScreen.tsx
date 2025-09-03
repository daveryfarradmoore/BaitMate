import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, FlatList, Switch, Button, Platform } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Placeholder image
const placeholderImg = 'https://via.placeholder.com/80';

// Type definitions
interface GearItem {
  name: string;
  description: string;
  price: number;
  tag: 'Cheapest' | 'Best Value';
  image: string;
}

interface SpeciesGear {
  [key: string]: GearItem[];
}

interface SpeciesGearData {
  [species: string]: SpeciesGear;
}

interface NavigationParams {
  species?: string | { name: string };
  method?: string | { text: string };
  gearOwned?: boolean | string[];
}

type RootStackParamList = {
  GearRecommendation: NavigationParams;
};

type GearRecommendationScreenRouteProp = RouteProp<RootStackParamList, 'GearRecommendation'>;
type GearRecommendationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GearRecommendation'>;

interface Props {
  route: GearRecommendationScreenRouteProp;
  navigation: GearRecommendationScreenNavigationProp;
}

// Species-specific gear data
const speciesGearData: SpeciesGearData = {
  'Bass': {
    Rod: [
      { name: 'Bass Pro Spinning Rod', description: 'Medium-heavy action, perfect for bass fishing with lures.', price: 89.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Budget Bass Rod', description: 'Affordable 6\'6" medium action rod for beginners.', price: 39.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Reel: [
      { name: 'Bass Master Spinning Reel', description: 'Smooth drag system, ideal for bass fishing techniques.', price: 79.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Entry Bass Reel', description: 'Reliable spinning reel for bass fishing.', price: 29.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Line: [
      { name: 'Bass Braid 20lb', description: 'High-strength braided line for heavy bass fishing.', price: 24.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Bass Mono 12lb', description: 'Standard monofilament for bass fishing.', price: 8.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Hooks: [
      { name: 'Bass Hook Set', description: 'Assorted sizes 2/0 to 5/0 for various bass lures.', price: 12.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Basic Bass Hooks', description: 'Standard bass hooks in popular sizes.', price: 4.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Bait: [
      { name: 'Soft Plastic Worms', description: 'Realistic worms in natural colors for bass.', price: 9.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Live Nightcrawlers', description: 'Classic live bait for bass fishing.', price: 3.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Lures: [
      { name: 'Bass Crankbait Set', description: 'Diving crankbaits in bass-attracting colors.', price: 19.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Spinnerbait', description: 'Effective spinnerbait for bass in various conditions.', price: 7.99, tag: 'Cheapest', image: placeholderImg },
    ]
  },
  'Trout': {
    Rod: [
      { name: 'Trout Ultralight Rod', description: 'Sensitive 7\' ultralight rod for trout fishing.', price: 129.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Budget Trout Rod', description: 'Light action rod perfect for trout streams.', price: 49.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Reel: [
      { name: 'Trout Spinning Reel', description: 'Ultralight reel with smooth drag for trout.', price: 89.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Entry Trout Reel', description: 'Lightweight reel suitable for trout fishing.', price: 34.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Line: [
      { name: 'Trout Fluorocarbon 4lb', description: 'Invisible fluorocarbon line for clear trout waters.', price: 18.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Trout Mono 6lb', description: 'Standard monofilament for trout fishing.', price: 6.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Hooks: [
      { name: 'Trout Hook Set', description: 'Small hooks size 8-14 for trout flies and bait.', price: 8.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Basic Trout Hooks', description: 'Standard trout hooks in small sizes.', price: 3.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Bait: [
      { name: 'Trout PowerBait', description: 'Scented bait specifically designed for trout.', price: 5.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Live Mealworms', description: 'Natural bait that trout love.', price: 2.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Flies: [
      { name: 'Trout Fly Set', description: 'Assorted dry flies and nymphs for trout.', price: 24.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Basic Trout Flies', description: 'Essential flies for trout fishing.', price: 9.99, tag: 'Cheapest', image: placeholderImg },
    ]
  },
  'Salmon': {
    Rod: [
      { name: 'Salmon Heavy Action Rod', description: '9\' heavy action rod for salmon fishing.', price: 199.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Budget Salmon Rod', description: 'Heavy action rod for salmon and steelhead.', price: 79.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Reel: [
      { name: 'Salmon Spinning Reel', description: 'Heavy-duty reel with strong drag for salmon.', price: 149.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Entry Salmon Reel', description: 'Durable reel for salmon fishing.', price: 59.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Line: [
      { name: 'Salmon Braid 30lb', description: 'Heavy braided line for salmon fishing.', price: 34.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Salmon Mono 20lb', description: 'Strong monofilament for salmon.', price: 12.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Hooks: [
      { name: 'Salmon Hook Set', description: 'Large hooks size 1/0 to 4/0 for salmon.', price: 16.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Basic Salmon Hooks', description: 'Heavy-duty hooks for salmon fishing.', price: 7.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Bait: [
      { name: 'Salmon Eggs', description: 'Cured salmon eggs for salmon fishing.', price: 8.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Live Shrimp', description: 'Natural bait that salmon find irresistible.', price: 6.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Lures: [
      { name: 'Salmon Spinner Set', description: 'Heavy spinners designed for salmon.', price: 29.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Salmon Spoon', description: 'Classic spoon lure for salmon fishing.', price: 12.99, tag: 'Cheapest', image: placeholderImg },
    ]
  },
  'Bluegill': {
    Rod: [
      { name: 'Bluegill Ultralight Rod', description: 'Light 5\'6" rod perfect for bluegill fishing.', price: 69.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Budget Bluegill Rod', description: 'Light action rod for panfish like bluegill.', price: 29.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Reel: [
      { name: 'Bluegill Spinning Reel', description: 'Ultralight reel with smooth operation.', price: 49.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Entry Bluegill Reel', description: 'Small reel perfect for bluegill fishing.', price: 19.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Line: [
      { name: 'Bluegill Fluorocarbon 2lb', description: 'Ultra-light line for bluegill fishing.', price: 12.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Bluegill Mono 4lb', description: 'Light monofilament for bluegill.', price: 4.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Hooks: [
      { name: 'Bluegill Hook Set', description: 'Small hooks size 10-16 for bluegill.', price: 6.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Basic Bluegill Hooks', description: 'Tiny hooks perfect for bluegill.', price: 2.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Bait: [
      { name: 'Bluegill Worms', description: 'Small worms and grubs for bluegill.', price: 3.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Live Crickets', description: 'Natural bait that bluegill love.', price: 1.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Bobbers: [
      { name: 'Bluegill Bobber Set', description: 'Small bobbers perfect for bluegill fishing.', price: 4.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Basic Bluegill Bobbers', description: 'Simple bobbers for bluegill.', price: 1.99, tag: 'Cheapest', image: placeholderImg },
    ]
  },
  'Catfish': {
    Rod: [
      { name: 'Catfish Heavy Rod', description: 'Heavy action rod for big catfish.', price: 119.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Budget Catfish Rod', description: 'Strong rod for catfish fishing.', price: 49.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Reel: [
      { name: 'Catfish Spinning Reel', description: 'Heavy-duty reel with strong drag.', price: 99.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Entry Catfish Reel', description: 'Durable reel for catfish.', price: 39.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Line: [
      { name: 'Catfish Braid 50lb', description: 'Heavy braided line for big catfish.', price: 39.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Catfish Mono 25lb', description: 'Strong monofilament for catfish.', price: 14.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Hooks: [
      { name: 'Catfish Hook Set', description: 'Large circle hooks for catfish.', price: 14.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Basic Catfish Hooks', description: 'Heavy hooks for catfish fishing.', price: 6.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Bait: [
      { name: 'Catfish Stink Bait', description: 'Scented bait that catfish can\'t resist.', price: 7.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Live Minnows', description: 'Natural bait for catfish.', price: 4.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Sinkers: [
      { name: 'Catfish Sinker Set', description: 'Heavy sinkers for bottom fishing.', price: 8.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Basic Catfish Sinkers', description: 'Heavy sinkers for catfish.', price: 3.99, tag: 'Cheapest', image: placeholderImg },
    ]
  }
};

// Default gear for unknown species
const defaultGear: SpeciesGear = {
  Rod: [
    { name: 'All-Purpose Rod', description: 'Versatile rod for various fish species.', price: 79.99, tag: 'Best Value', image: placeholderImg },
    { name: 'Budget Fishing Rod', description: 'Affordable rod for general fishing.', price: 34.99, tag: 'Cheapest', image: placeholderImg },
  ],
  Reel: [
    { name: 'All-Purpose Reel', description: 'Versatile spinning reel for various fish.', price: 59.99, tag: 'Best Value', image: placeholderImg },
    { name: 'Budget Fishing Reel', description: 'Reliable reel for general fishing.', price: 24.99, tag: 'Cheapest', image: placeholderImg },
  ],
  Line: [
    { name: 'All-Purpose Line', description: 'Versatile fishing line for various species.', price: 14.99, tag: 'Best Value', image: placeholderImg },
    { name: 'Budget Fishing Line', description: 'Standard monofilament line.', price: 5.99, tag: 'Cheapest', image: placeholderImg },
  ],
  Hooks: [
    { name: 'All-Purpose Hooks', description: 'Assorted hooks for various fish.', price: 9.99, tag: 'Best Value', image: placeholderImg },
    { name: 'Basic Fishing Hooks', description: 'Standard hooks for general fishing.', price: 3.99, tag: 'Cheapest', image: placeholderImg },
  ],
  Bait: [
    { name: 'All-Purpose Bait', description: 'Versatile bait for various fish species.', price: 6.99, tag: 'Best Value', image: placeholderImg },
    { name: 'Live Worms', description: 'Classic live bait for fishing.', price: 2.99, tag: 'Cheapest', image: placeholderImg },
  ]
};

const GearRecommendationScreen: React.FC<Props> = ({ route, navigation }) => {
  // Accept props or context, robust to missing/incorrect params
  const params = route?.params || {};
  console.log('GearRecommendationScreen params:', params);
  let { species, method, gearOwned } = params;

  // Fallbacks and normalization
  // species: can be string or object
  let displaySpecies: string = 'Bass';
  if (species) {
    if (typeof species === 'string') displaySpecies = species;
    else if (typeof species === 'object' && species.name) displaySpecies = species.name;
  }
  // method: can be string or object
  let displayMethod: string = 'Shore Fishing';
  if (method) {
    if (typeof method === 'string') displayMethod = method;
    else if (typeof method === 'object' && method.text) displayMethod = method.text;
  }
  // gearOwned: can be boolean or array
  let normalizedGearOwned: boolean | string[] = [];
  if (Array.isArray(gearOwned)) normalizedGearOwned = gearOwned;
  else if (typeof gearOwned === 'boolean') normalizedGearOwned = gearOwned;
  else normalizedGearOwned = [];

  // Get species-specific gear or default gear
  const getGearForSpecies = (speciesName: string): SpeciesGear => {
    return speciesGearData[speciesName] || defaultGear;
  };

  // Toggle state: 'Cheapest' or 'Best Value'
  const [toggle, setToggle] = useState<'Cheapest' | 'Best Value'>('Best Value');
  // Track checked items
  const [owned, setOwned] = useState<Record<string, boolean>>(() => {
    const speciesGear = getGearForSpecies(displaySpecies);
    // If gearOwned is boolean and true, mark all as owned
    if (typeof normalizedGearOwned === 'boolean' && normalizedGearOwned) {
      const all: Record<string, boolean> = {};
      Object.values(speciesGear).forEach(group => {
        group.forEach(item => {
          all[item.name] = true;
        });
      });
      return all;
    }
    // If array, mark those as owned
    if (Array.isArray(normalizedGearOwned)) {
      const all: Record<string, boolean> = {};
      normalizedGearOwned.forEach(name => { all[name] = true; });
      return all;
    }
    return {};
  });

  // Filter gear by toggle and species
  const recommendedGear = useMemo<(GearItem & { group: string })[]>(() => {
    const speciesGear = getGearForSpecies(displaySpecies);
    return Object.entries(speciesGear).flatMap(([group, items]) => {
      if (!items || items.length === 0) return [] as (GearItem & { group: string })[];
      const item: GearItem = (items.find(i => i.tag === toggle) ?? items[0]) as GearItem;
      return [{ ...item, group }];
    });
  }, [toggle, displaySpecies]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    return recommendedGear.reduce((sum, item) => {
      if (!owned[item.name]) sum += item.price;
      return sum;
    }, 0);
  }, [owned, recommendedGear]);

  // Handle checkbox toggle
  const handleToggleOwned = (name: string): void => {
    setOwned(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Render gear card
  const renderGearCard = ({ item }: { item: GearItem & { group: string } }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.gearName}>{item.group}: {item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.price}>${item.price.toFixed(2)} <Text style={styles.tag}>[{item.tag}]</Text></Text>
        <View style={styles.checkboxRow}>
          <Switch
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

