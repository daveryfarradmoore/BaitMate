import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PlanProgress from '../components/PlanProgress';
import AuroraBackground from '../components/AuroraBackground';
import type { StackNavigationProp, StackRouteProp } from '../../App';
import { colors, shadows } from '../theme';

interface Props {
  navigation: StackNavigationProp;
  route: StackRouteProp<'GearOwnership'>;
}

const GearOwnershipScreen = ({ navigation, route }: Props) => {
  const { selectedSpecies } = route.params;
  const [hasGear, setHasGear] = useState<boolean | null>(null);

  const handleGearSelection = (hasGearValue: boolean) => {
    setHasGear(hasGearValue);
  };

  const handleContinue = () => {
    if (hasGear !== null) {
      if (hasGear) {
        // User has gear - select which groups they own
        navigation.navigate('OwnedGearSelection', { selectedSpecies });
      } else {
        // User needs gear - go to method questions for recommendations
        navigation.navigate('Budget', {
          selectedSpecies,
          hasGear,
          ownedGroups: [],
        });
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AuroraBackground />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <PlanProgress step={2} onSpecies={() => navigation.navigate('SpeciesSelector')} />
          <View style={styles.speciesPill}><Ionicons name="fish" size={16} color={colors.brand} /><Text style={styles.speciesPillText}>{selectedSpecies.name}</Text></View>
          <Text style={styles.title}>What are you starting with?</Text>
          <Text style={styles.subtitle}>
            We’ll only recommend what you still need, so your plan stays useful and realistic.
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              hasGear === true && styles.selectedCard,
            ]}
            accessibilityRole="radio" accessibilityState={{ selected: hasGear === true }}
            onPress={() => handleGearSelection(true)}
            activeOpacity={0.82}
          >
            <View style={[styles.iconContainer, styles.ownedIcon]}>
              <Ionicons name="bag-check-outline" size={30} color={colors.brand} />
            </View>
            <View style={styles.optionCopy}>
            <Text style={styles.optionTitle}>I already own some gear</Text>
            <Text style={styles.optionDescription}>
              Tell us which categories to leave out.
            </Text>
            </View>
            <Ionicons name={hasGear === true ? 'checkmark-circle' : 'chevron-forward'} size={24} color={hasGear === true ? colors.brand : colors.inkMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              hasGear === false && styles.selectedCard,
            ]}
            accessibilityRole="radio" accessibilityState={{ selected: hasGear === false }}
            onPress={() => handleGearSelection(false)}
            activeOpacity={0.82}
          >
            <View style={[styles.iconContainer, styles.newIcon]}>
              <Ionicons name="sparkles-outline" size={30} color="#A85E1B" />
            </View>
            <View style={styles.optionCopy}>
            <Text style={styles.optionTitle}>Build a complete setup</Text>
            <Text style={styles.optionDescription}>
              Start fresh with every essential category.
            </Text>
            </View>
            <Ionicons name={hasGear === false ? 'checkmark-circle' : 'chevron-forward'} size={24} color={hasGear === false ? colors.brand : colors.inkMuted} />
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
          <Text style={styles.continueButtonText}>
            {hasGear === null ? 'Continue' : hasGear ? 'Choose owned gear' : 'Set my budget'}
          </Text>
          <Ionicons name={"arrow-forward" as any} size={20} color="white" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flexGrow: 1,
    paddingVertical: 28,
    paddingHorizontal: 24,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  header: {
    marginBottom: 30,
  },
  stepRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepLabel: { fontSize: 11, letterSpacing: 1.5, fontWeight: '800', color: colors.brand },
  stepHint: { fontSize: 13, fontWeight: '600', color: colors.inkMuted },
  progressTrack: { height: 6, borderRadius: 6, backgroundColor: colors.border, marginTop: 10, marginBottom: 30 },
  progressFill: { width: '66%', height: '100%', borderRadius: 6, backgroundColor: colors.brand },
  speciesPill: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', backgroundColor: colors.brandSoft, borderRadius: 99, paddingVertical: 7, paddingHorizontal: 12, marginBottom: 15 },
  speciesPillText: { marginLeft: 6, color: colors.brandDark, fontWeight: '700', fontSize: 13 },
  ownedIcon: { backgroundColor: colors.brandSoft },
  newIcon: { backgroundColor: '#FFF0DF' },
  optionCopy: { flex: 1, marginHorizontal: 16 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 28,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.card,
  },
  selectedCard: {
    borderWidth: 1,
    borderColor: colors.brand,
    backgroundColor: '#F7FFFC',
  },
  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.inkMuted,
  },
  continueButton: {
    backgroundColor: colors.brand,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: colors.disabled,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default GearOwnershipScreen;
