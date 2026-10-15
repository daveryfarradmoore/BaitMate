import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PlanProgress from '../components/PlanProgress';
import AuroraBackground from '../components/AuroraBackground';
import type { StackNavigationProp, StackRouteProp } from '../../App';
import { colors, shadows } from '../theme';

interface Props {
  navigation: StackNavigationProp;
  route: StackRouteProp<'MethodQuestion'>;
}

const METHODS = [
  { id: 'shore', title: 'From shore', description: 'Banks, piers, docks, and beaches', icon: 'location-outline' },
  { id: 'wading', title: 'Wading', description: 'Rivers, streams, and shallow flats', icon: 'water-outline' },
  { id: 'boat', title: 'From a boat', description: 'Open water, trolling, and deeper spots', icon: 'boat-outline' },
];

const MethodQuestionScreen = ({ navigation, route }: Props) => {
  const { selectedSpecies, hasGear, ownedGroups, budgetUSD } = route.params;
  const [method, setMethod] = useState('');

  const handleFinish = () => {
    if (!method) return;
    navigation.navigate('GearRecommendation', {
      selectedSpecies,
      method,
      budgetUSD,
      ownedGroups: hasGear ? ownedGroups : [],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <AuroraBackground />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PlanProgress step={4} onBudget={() => navigation.navigate('Budget', route.params)} onSpecies={() => navigation.navigate('SpeciesSelector')} onGear={() => navigation.navigate('GearOwnership', { selectedSpecies })} />
        <View style={styles.summaryRow}>
          <View style={styles.summaryPill}><Ionicons name="fish" size={15} color={colors.brand} /><Text style={styles.summaryText}>{selectedSpecies.name}</Text></View>
          <View style={styles.summaryPill}>
            <Ionicons name="bag-check-outline" size={15} color={colors.brand} />
            <Text style={styles.summaryText}>{ownedGroups.length} owned categories</Text>
          </View>
        </View>

        <Text style={styles.title}>How will you fish most often?</Text>
        <Text style={styles.subtitle}>This changes the tackle and setup that will work best in the water.</Text>

        <View style={styles.options}>
          {METHODS.map((option) => {
            const selected = option.id === method;
            return (
              <TouchableOpacity
                key={option.id}
                style={[styles.optionCard, selected && styles.optionCardSelected]}
                onPress={() => setMethod(option.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
              >
                <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
                  <Ionicons name={option.icon as any} size={27} color={selected ? '#fff' : colors.brand} />
                </View>
                <View style={styles.optionCopy}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected ? <Ionicons name="checkmark" size={15} color="#fff" /> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerHint}>{method ? 'Your personalized plan is ready to build.' : 'Choose one method to continue.'}</Text>
          <TouchableOpacity style={[styles.finishButton, !method && styles.disabledButton]} onPress={handleFinish} disabled={!method}>
            <Text style={styles.finishText}>Build my gear plan</Text>
            <Ionicons name="sparkles" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { flexGrow: 1, width: '100%', maxWidth: 720, alignSelf: 'center', justifyContent: 'center', paddingHorizontal: 22, paddingVertical: 28 },
  stepRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepLabel: { fontSize: 11, letterSpacing: 1.5, fontWeight: '800', color: colors.brand },
  stepHint: { fontSize: 13, fontWeight: '600', color: colors.inkMuted },
  progressTrack: { height: 6, borderRadius: 6, backgroundColor: colors.border, marginTop: 10, marginBottom: 26 },
  progressFill: { width: '100%', height: '100%', borderRadius: 6, backgroundColor: colors.brand },
  summaryRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 18 },
  summaryPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.brandSoft, borderRadius: 99, paddingVertical: 7, paddingHorizontal: 11, margin: 4 },
  summaryText: { marginLeft: 6, fontSize: 12, fontWeight: '700', color: colors.brandDark },
  title: { fontSize: 32, lineHeight: 39, fontWeight: '800', color: colors.ink, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 22, color: colors.inkMuted, textAlign: 'center', marginBottom: 26 },
  options: { marginBottom: 20 },
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 17, marginBottom: 11, ...shadows.card },
  optionCardSelected: { borderWidth: 1, borderColor: colors.brand, backgroundColor: '#F7FFFC' },
  iconWrap: { width: 52, height: 52, borderRadius: 16, backgroundColor: colors.brandSoft, alignItems: 'center', justifyContent: 'center' },
  iconWrapSelected: { backgroundColor: colors.brand },
  optionCopy: { flex: 1, marginHorizontal: 15 },
  optionTitle: { fontSize: 17, fontWeight: '800', color: colors.ink, marginBottom: 4 },
  optionDescription: { fontSize: 13, lineHeight: 18, color: colors.inkMuted },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { backgroundColor: colors.brand, borderColor: colors.brand },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' },
  footerHint: { flex: 1, minWidth: 190, fontSize: 13, color: colors.inkMuted, marginRight: 16, marginBottom: 8 },
  finishButton: { backgroundColor: colors.brand, borderRadius: 14, paddingVertical: 15, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center' },
  disabledButton: { backgroundColor: colors.disabled },
  finishText: { color: '#fff', fontSize: 16, fontWeight: '800', marginRight: 9 },
});

export default MethodQuestionScreen;
