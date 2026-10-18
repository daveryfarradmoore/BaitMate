/**
 * Category-level checklist for gear the user already owns or can borrow.
 * Selected category names travel to Budget, then exclude matching catalog groups.
 * This does not verify individual products or persist an inventory to an account.
 */
import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PlanProgress from '../components/PlanProgress';
import AuroraBackground from '../components/AuroraBackground';
import type { StackNavigationProp, StackRouteProp } from '../../App';
import { colors, shadows } from '../theme';

interface Props {
  navigation: StackNavigationProp;
  route: StackRouteProp<'OwnedGearSelection'>;
}

const GEAR_GROUPS = [
  { name: 'Rod', icon: 'remove-outline' },
  { name: 'Reel', icon: 'sync-outline' },
  { name: 'Line', icon: 'git-branch-outline' },
  { name: 'Hooks', icon: 'link-outline' },
  { name: 'Bobbers', icon: 'ellipse-outline' },
  { name: 'Sinkers', icon: 'triangle-outline' },
  { name: 'Bait', icon: 'bug-outline' },
  { name: 'Lures', icon: 'fish-outline' },
  { name: 'Flies', icon: 'sparkles-outline' },
  { name: 'Terminal', icon: 'construct-outline' },
];

const OwnedGearSelectionScreen = ({ navigation, route }: Props) => {
  const { selectedSpecies } = route.params;
  const [ownedGroups, setOwnedGroups] = useState<Record<string, boolean>>({});
  // False entries remain after toggling off; pass only checked category names.
  const selected = useMemo(() => Object.keys(ownedGroups).filter((key) => ownedGroups[key]), [ownedGroups]);

  const toggleGroup = (group: string) => {
    setOwnedGroups((previous) => ({ ...previous, [group]: !previous[group] }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <AuroraBackground />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <PlanProgress step={2} onSpecies={() => navigation.navigate('SpeciesSelector')} />
          <Text style={styles.title}>What do you already own?</Text>
          <Text style={styles.subtitle}>Select every category you can bring for {selectedSpecies.name}. We’ll remove those from your shopping plan.</Text>
          <View style={styles.grid}>
            {GEAR_GROUPS.map(({ name, icon }) => {
              const isSelected = Boolean(ownedGroups[name]);
              return (
                <TouchableOpacity key={name} style={[styles.gearCard, isSelected && styles.gearCardSelected]} onPress={() => toggleGroup(name)} accessibilityRole="checkbox" accessibilityState={{ checked: isSelected }}>
                  <View style={[styles.iconWrap, isSelected && styles.iconWrapSelected]}><Ionicons name={icon as any} size={24} color={isSelected ? '#fff' : colors.brand} /></View>
                  <Text style={styles.gearName}>{name}</Text>
                  <View style={[styles.check, isSelected && styles.checkSelected]}>
                    {isSelected ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.tipCard}>
            <Ionicons name="information-circle-outline" size={22} color={colors.brand} />
            <Text style={styles.tipText}>Not sure about an item? Leave it unselected and you can mark it as owned on the results screen.</Text>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.navigate('Budget', { selectedSpecies, hasGear: true, ownedGroups: selected })}
          >
            <Text style={styles.continueText}>Continue with {selected.length || 'no'} owned</Text>
            <Ionicons name="arrow-forward" size={19} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 28 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  stepRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepLabel: { fontSize: 11, letterSpacing: 1.5, fontWeight: '800', color: colors.brand },
  stepHint: { fontSize: 13, fontWeight: '700', color: colors.brand },
  progressTrack: { height: 6, borderRadius: 6, backgroundColor: colors.border, marginTop: 10, marginBottom: 30 },
  progressFill: { width: '66%', height: '100%', borderRadius: 6, backgroundColor: colors.brand },
  title: { fontSize: 32, lineHeight: 39, fontWeight: '800', color: colors.ink, textAlign: 'center', marginBottom: 9 },
  subtitle: { fontSize: 15, lineHeight: 23, color: colors.inkMuted, textAlign: 'center', maxWidth: 610, alignSelf: 'center', marginBottom: 26 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  gearCard: { minWidth: 240, width: '46%', flexGrow: 1, margin: 5, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, flexDirection: 'row', alignItems: 'center', position: 'relative', ...shadows.card },
  gearCardSelected: { borderWidth: 1, borderColor: colors.brand, backgroundColor: '#F7FFFC' },
  iconWrap: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.brandSoft, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  iconWrapSelected: { backgroundColor: colors.brand },
  gearName: { fontSize: 15, fontWeight: '700', color: colors.ink, flex: 1 },
  check: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkSelected: { backgroundColor: colors.brand, borderColor: colors.brand },
  tipCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.brandSoft, borderRadius: 14, padding: 14, marginTop: 18 },
  tipText: { flex: 1, fontSize: 13, lineHeight: 19, color: colors.brandDark, marginLeft: 10 },
  continueButton: { alignSelf: 'flex-end', backgroundColor: colors.brand, borderRadius: 14, paddingVertical: 15, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  continueText: { color: '#fff', fontSize: 16, fontWeight: '700', marginRight: 8 },
});

export default OwnedGearSelectionScreen;
