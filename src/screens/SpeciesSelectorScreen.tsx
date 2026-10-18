/**
 * First planning step: browse/search species from the shared seed catalog.
 * Uses catalog slugs as IDs so later recommendation requests match the backend.
 * The selected species is passed through navigation rather than saved remotely.
 */
import React, { useState } from 'react';
import {
  TextInput,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Species as AppSpecies, StackNavigationProp, StackRouteProp } from '../../App';
import SwimmingFish from '../components/SwimmingFish';
import PlanProgress from '../components/PlanProgress';
import AuroraBackground from '../components/AuroraBackground';
import { SEED_SPECIES, SEED_SPECIES_GEAR_DATA } from '../services/seedData';
import { colors, shadows } from '../theme';

type Species = AppSpecies;

const speciesData: Species[] = SEED_SPECIES.map((species) => ({
  id: species.slug,
  name: species.name,
  color: species.color,

}));

type Props = {
  navigation: StackNavigationProp;
  route: StackRouteProp<'SpeciesSelector'>;
};

const SpeciesSelectorScreen = ({ navigation }: Props) => {
  const { width } = useWindowDimensions();
  const compact = width < 520;
  const [paused, setPaused] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All species');
  const filters = ['All species', 'Bass', 'Trout & salmon', 'Other'];
  const visibleSpecies = speciesData.filter(species => {
    const group = species.id.includes('bass') ? 'Bass' : /trout|salmon/.test(species.id) ? 'Trout & salmon' : 'Other';
    return (filter === 'All species' || group === filter) && species.name.toLowerCase().includes(query.trim().toLowerCase());
  });
  const [selectedId, setSelectedId] = useState('');
  const selectedSpecies = speciesData.find((species) => species.id === selectedId);

  const handleContinue = () => {
    if (selectedSpecies) {
      navigation.navigate('GearOwnership', { selectedSpecies });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AuroraBackground />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <PlanProgress step={1} />
          <Text style={styles.eyebrow}>FIND YOUR NEXT CATCH</Text>
          <Text style={styles.title}>What are you fishing for?</Text>
          <Text style={styles.subtitle}>
            Pick one target species. We’ll tailor the setup and estimated cost around it.
          </Text>

          <View style={styles.search}>
            <Ionicons name="search-outline" size={21} color={colors.inkMuted} />
            <TextInput value={query} onChangeText={setQuery} placeholder="Search fish species…" placeholderTextColor={colors.inkMuted} accessibilityLabel="Search fish species" style={styles.searchInput} autoCorrect={false} />
            {query ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} style={{ padding: 10 }}><Ionicons name="close-circle" size={20} color={colors.inkMuted} /></TouchableOpacity> : null}
          </View>
          <View style={styles.filters}>{filters.map(label => <TouchableOpacity key={label} accessibilityRole="button" accessibilityState={{ selected: filter === label }} onPress={() => setFilter(label)} style={[styles.chip, filter === label && styles.chipActive]}><Text style={{ color: filter === label ? 'white' : colors.inkMuted, fontWeight: '600' }}>{label}</Text></TouchableOpacity>)}</View>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={paused ? 'Resume fish animation' : 'Pause fish animation'} onPress={() => setPaused(value => !value)} style={styles.motionButton}>
            <Ionicons name={paused ? 'play-outline' : 'pause-outline'} size={16} color={colors.brand} /><Text style={styles.motionLabel}>{paused ? 'Resume swimming' : 'Pause swimming'}</Text>
          </TouchableOpacity>
          <Text style={styles.resultCount}>{visibleSpecies.length} of {speciesData.length} available species</Text>
          <View style={styles.grid}>
            {visibleSpecies.map((species) => {
              const selected = species.id === selectedId;
              return (
                <TouchableOpacity
                  key={species.id}
                  accessibilityRole="radio"
                  accessibilityLabel={species.name}
                  accessibilityState={{ checked: selected }}
                  style={[styles.speciesCard, compact && styles.speciesCardCompact, selected && styles.speciesCardSelected]}
                  onPress={() => setSelectedId(species.id)}
                  activeOpacity={0.82}
                >
                  <SwimmingFish speciesId={species.id} paused={paused} />
                  <Text style={styles.speciesName}>{species.name}</Text>
                  <Text style={styles.cardHint}>{selected ? 'Selected for your plan' : 'Tap to explore setup'}</Text>
                  <View style={[styles.radio, selected && styles.radioSelected]}>
                    {selected ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {!visibleSpecies.length && <View style={styles.empty}><Ionicons name="search-outline" size={32} color={colors.brand} /><Text style={styles.speciesName}>No matching species</Text><Text style={styles.cardHint}>Try another name or browse the full catalog.</Text><TouchableOpacity onPress={() => { setQuery(''); setFilter('All species'); }} accessibilityRole="button" style={styles.chip}><Text style={{ color: colors.brand }}>Show all species</Text></TouchableOpacity></View>}
          {selectedSpecies && <View style={styles.preview} accessibilityLiveRegion="polite">
            <Text style={styles.eyebrow}>YOUR TARGET · {selectedSpecies.name.toUpperCase()}</Text>
            <SwimmingFish key={selectedSpecies.id} speciesId={selectedSpecies.id} paused={paused} large />
            <Text style={styles.previewTitle}>A setup built around your catch.</Text>
            <Text style={styles.previewCopy}>Explore {Object.keys(SEED_SPECIES_GEAR_DATA[selectedSpecies.name] ?? {}).join(', ').toLowerCase()} in your gear plan. Next, tell us what you already own.</Text>
          </View>}

        </View>
      </ScrollView>
      <View style={styles.dock}><View style={[styles.footerCard, compact && { flexDirection: 'column', alignItems: 'stretch', gap: 12 }]}>
        <View style={styles.selectionSummary}><Text style={styles.summaryLabel}>YOUR TARGET</Text><Text style={styles.summaryValue}>{selectedSpecies?.name ?? 'Choose a species to start'}</Text></View>
        <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: !selectedSpecies }} style={[styles.continueButton, !selectedSpecies && styles.disabledButton]} onPress={handleContinue} disabled={!selectedSpecies}><Text style={styles.continueText}>Choose my gear</Text><Ionicons name="arrow-forward" size={19} color="white" /></TouchableOpacity>
      </View></View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  motionButton: { alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 8 },
  motionLabel: { fontSize: 12, color: colors.brand, fontWeight: '600' },
  eyebrow: { color: colors.brand, fontSize: 11, fontWeight: '800', letterSpacing: 1.8, marginBottom: 12 },
  search: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingLeft: 16, marginBottom: 14 },
  searchInput: { flex: 1, padding: 16, fontSize: 16, color: colors.ink, minWidth: 0 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24, backgroundColor: colors.brandSoft },
  chipActive: { backgroundColor: colors.brand },
  resultCount: { color: colors.inkMuted, fontSize: 12, marginBottom: 10 },
  cardHint: { color: colors.inkMuted, fontSize: 12, marginTop: 8, textAlign: 'center' },
  empty: { alignItems: 'center', gap: 16, padding: 24 },
  preview: { backgroundColor: colors.brandSoft, padding: 24, borderRadius: 20, marginTop: 24 },
  previewTitle: { color: colors.ink, fontSize: 23, fontWeight: '800', marginBottom: 8 },
  previewCopy: { color: colors.inkMuted, fontSize: 15, lineHeight: 23 },
  dock: { backgroundColor: colors.surface, borderTopWidth: 1, borderColor: colors.border, paddingHorizontal: 20, paddingVertical: 14 },
  container: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 28 },
  content: { width: '100%', maxWidth: 780, alignSelf: 'center' },
  stepRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepLabel: { fontSize: 11, letterSpacing: 1.5, fontWeight: '800', color: colors.brand },
  stepHint: { fontSize: 13, fontWeight: '600', color: colors.inkMuted },
  progressTrack: { height: 6, borderRadius: 6, backgroundColor: colors.border, marginTop: 10, marginBottom: 30 },
  progressFill: { width: '33%', height: '100%', borderRadius: 6, backgroundColor: colors.brand },
  title: { fontSize: 34, lineHeight: 40, fontWeight: '800', color: colors.ink, textAlign: 'left', marginBottom: 10 },
  subtitle: { fontSize: 16, lineHeight: 24, color: colors.inkMuted, textAlign: 'left', maxWidth: 590, marginBottom: 28 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  speciesCard: {
    width: '46%',
    minWidth: 170,
    flexGrow: 1,
    margin: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    position: 'relative',
    ...shadows.card,
  },
  speciesCardSelected: { borderWidth: 1, borderColor: colors.brand, backgroundColor: '#F7FFFC' },
  speciesCardCompact: { width: '45%', minWidth: 0, paddingHorizontal: 10 },
  iconWrap: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  speciesImage: { width: 58, height: 58, borderRadius: 18 },
  speciesName: { fontSize: 15, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  radio: { position: 'absolute', right: 12, top: 12, width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { backgroundColor: colors.brand, borderColor: colors.brand },
  footerCard: {
    width: '100%', maxWidth: 780, alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectionSummary: { flex: 1, marginRight: 16 },
  summaryLabel: { fontSize: 10, letterSpacing: 1.2, fontWeight: '800', color: colors.inkMuted, marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: '700', color: colors.ink },
  continueButton: { backgroundColor: colors.brand, borderRadius: 13, paddingVertical: 13, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center' },
  disabledButton: { backgroundColor: colors.disabled },
  continueText: { color: '#fff', fontSize: 16, fontWeight: '700', marginRight: 8 },
});

export default SpeciesSelectorScreen;
