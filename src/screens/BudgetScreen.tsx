/**
 * Collects the budget for unowned gear and previews a local catalog estimate.
 * The access popup recommends shore/dock first, or equipped and affordable wading
 * for river species. Continues directly to GearRecommendation with those choices.
 * State is local to this screen; it is not saved to the user's Supabase account.
 */
import React, { useState } from 'react';
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { StackNavigationProp, StackRouteProp } from '../../App';
import AuroraBackground from '../components/AuroraBackground';
import PlanProgress from '../components/PlanProgress';
import { buildLocalRecommendation } from '../services/recommendations.local';
import { budgetStatus } from '../../supabase/functions/_shared/budget';
import { colors } from '../theme';

export default function BudgetScreen({ navigation, route }: { navigation: StackNavigationProp; route: StackRouteProp<'Budget'> }) {
  const { selectedSpecies, ownedGroups, hasGear } = route.params;
  const [amount, setAmount] = useState(route.params.budgetUSD?.toString() ?? '');
  const [showAccess, setShowAccess] = useState(false);
  // Access is a species-specific popup, replacing the legacy MethodQuestion
  // route in this flow. Wading requires owned waders and an affordable tackle plan.
  const [access, setAccess] = useState('shore');
  const [hasWaders, setHasWaders] = useState<boolean | null>(null);
  const riverSpecies = /salmon|trout|steelhead/i.test(selectedSpecies.name);
  const panfish = /bluegill|blue gill|sunfish|crappie|perch/i.test(selectedSpecies.name);
  const wadingEstimate = buildLocalRecommendation({ species: selectedSpecies.id, method: 'wading', ownedGroups, budgetTier: 'Best Value', budgetUSD: 0 }).totalEstimateUSD;
  // Keep text while editing: Number('') is zero, but an empty field is not valid.
  const numeric = Number(amount);
  const valid = /^\d+(\.\d{1,2})?$/.test(amount) && numeric <= 100000;
  const wadingFits = valid && wadingEstimate <= numeric;
  const estimate = buildLocalRecommendation({ species: selectedSpecies.id, method: 'shore', ownedGroups, budgetTier: 'Best Value', budgetUSD: 0 }).totalEstimateUSD;
  const status = valid ? budgetStatus(estimate, numeric) : null;
  return <SafeAreaView style={styles.container}>
    <AuroraBackground />
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <PlanProgress step={3} onSpecies={() => navigation.navigate('SpeciesSelector')} onGear={() => navigation.navigate('GearOwnership', { selectedSpecies })} />
      <Text style={styles.eyebrow}>{selectedSpecies.name} · {ownedGroups.length} owned categories</Text>
      <Text style={styles.title}>Start with what feels comfortable.</Text>
      <Text style={styles.body}>You don’t need the most expensive gear to get started. What would you like to spend on the gear you still need?</Text>
      <View style={styles.card}>
        <Text style={styles.label}>My gear budget (USD)</Text>
        <View style={styles.inputRow}><Text style={styles.dollar}>$</Text><TextInput accessibilityLabel="My gear budget in dollars" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="100" maxLength={9} style={styles.input} /></View>
        <View style={styles.presets}>{[50, 100, 150, 200].map(value => <TouchableOpacity key={value} accessibilityRole="button" accessibilityState={{ selected: numeric === value }} style={[styles.preset, numeric === value && styles.selected]} onPress={() => setAmount(String(value))}><Text style={styles.presetText}>${value}</Text></TouchableOpacity>)}</View>
        {amount !== '' && !valid ? <Text accessibilityRole="alert" style={styles.error}>Enter $0–$100,000, with up to two decimal places.</Text> : null}
        <Text style={styles.body}>{valid ? `We’ll aim for $${numeric.toFixed(2)} or less. Only if needed, your estimated gear limit is $${status!.maximumUSD.toFixed(2)} (15% extra).` : 'We’ll aim below your budget, with at most 15% extra if needed.'}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>{ownedGroups.length ? 'A starting point for your remaining gear' : 'Starting from scratch? Here’s a goal.'}</Text>
        <Text style={styles.estimate}>About ${estimate.toFixed(2)}</Text>
        <Text style={styles.body}>Lowest-cost {selectedSpecies.name} setup in our starter catalog{ownedGroups.length ? ', excluding the categories you own' : ''}. Your final estimate follows your fishing method.</Text>
        {status?.status === 'over' ? <Text style={styles.body}>That’s above your ${status.maximumUSD.toFixed(2)} limit. You can still explore a savings goal, or borrow gear and mark it as owned. There’s no pressure to buy everything today.</Text> : null}
        <Text style={styles.note}>Catalog estimates, not checkout quotes. Allow separately for tax, shipping, a fishing license, and any boat or wading equipment.</Text>
        <TouchableOpacity accessibilityRole="button" onPress={() => setAmount(estimate.toFixed(2))}><Text style={styles.link}>Use this estimate as my budget</Text></TouchableOpacity>
      </View>
      <TouchableOpacity accessibilityRole="button" disabled={!valid} style={[styles.button, !valid && styles.disabled]} onPress={() => setShowAccess(true)}><Text style={styles.buttonText}>See my species plan</Text></TouchableOpacity>
    </ScrollView>
    <Modal visible={showAccess} transparent animationType="slide" onRequestClose={() => setShowAccess(false)}>
      <View style={styles.overlay}><ScrollView contentContainerStyle={styles.modalScroll}><View style={styles.card} accessibilityViewIsModal>
        <Text style={styles.title}>Your {selectedSpecies.name} starting spot</Text>
        <Text style={styles.body}>{panfish ? 'Start from shore or a dock. Bluegill and other panfish are approachable near accessible cover; you don’t need a boat.' : riverSpecies ? 'This species can be caught from shore, while wading, or from a boat. For your beginner plan, focus on shore access or suitable river wading.' : 'Start from shore, a public pier, or a dock. Boat access can offer more options, but isn’t required for this beginner plan.'}</Text>
        <Text style={styles.label}>Recommended: shore or dock</Text>
        <Text style={styles.body}>Your shore tackle estimate is ${estimate.toFixed(2)} after accounting for {ownedGroups.length} owned gear categories. Shore access avoids adding waders to your ${numeric.toFixed(2)} budget.{estimate > numeric ? ' Your remaining tackle is above budget; consider borrowing gear before buying.' : ''}</Text>
        <TouchableOpacity accessibilityRole="radio" accessibilityState={{selected: access === 'shore'}} style={[styles.preset, access === 'shore' && styles.selected]} onPress={() => setAccess('shore')}><Text style={styles.label}>Shore / dock {access === 'shore' ? '✓' : ''}</Text></TouchableOpacity>
        {riverSpecies ? <>
          <TouchableOpacity accessibilityRole="radio" accessibilityState={{selected: access === 'wading'}} style={[styles.preset, access === 'wading' && styles.selected]} onPress={() => setAccess('wading')}><Text style={styles.label}>Explore wading {access === 'wading' ? '✓' : ''}</Text></TouchableOpacity>
          {access === 'wading' ? <><Text style={styles.label}>Do you already own suitable waders?</Text><View style={styles.presets}>{[true, false].map(value => <TouchableOpacity key={String(value)} accessibilityRole="radio" accessibilityState={{selected: hasWaders === value}} style={[styles.preset, hasWaders === value && styles.selected]} onPress={() => setHasWaders(value)}><Text style={styles.presetText}>{value ? 'Yes, I have waders' : 'No waders yet'}</Text></TouchableOpacity>)}</View>
          <Text style={styles.body}>{hasWaders === false ? 'Waders are an extra expense and are not included in our tackle catalog. We recommend shore fishing until you have suitable equipment and a separate budget.' : hasWaders === true ? `Wading tackle: about $${wadingEstimate.toFixed(2)} with your owned gear. ${wadingFits ? 'This fits your budget.' : 'This exceeds your budget; shore is the recommended starting point.'}` : 'Confirm your equipment before choosing wading.'}</Text><Text style={styles.note}>Waders do not make water safe. Avoid strong currents and deep water; learn with an experienced person and use a properly fitted life jacket.</Text></> : null}
        </> : null}
        <TouchableOpacity accessibilityRole="button" disabled={access === 'wading' && hasWaders === null} style={[styles.button, access === 'wading' && hasWaders === null && styles.disabled]} onPress={() => { setShowAccess(false); navigation.navigate('GearRecommendation', { selectedSpecies, method: access === 'wading' && hasWaders && wadingFits ? 'wading' : 'shore', budgetUSD: numeric, ownedGroups: hasGear ? ownedGroups : [] }); }}><Text style={styles.buttonText}>{access === 'wading' && hasWaders && wadingFits ? 'Build my wading plan' : 'Build my shore / dock plan'}</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" onPress={() => setShowAccess(false)}><Text style={styles.link}>Back to budget</Text></TouchableOpacity>
      </View></ScrollView></View>
    </Modal>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' },
  modalScroll: { flexGrow: 1, justifyContent: 'center', padding: 20, width: '100%', maxWidth: 720, alignSelf: 'center' },
  container: { flex: 1 },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center', padding: 24, paddingBottom: 40 },
  eyebrow: { color: colors.brand, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  title: { fontSize: 30, lineHeight: 37, fontWeight: '800', color: colors.ink, textAlign: 'center', marginBottom: 12 },
  body: { fontSize: 15, lineHeight: 23, color: colors.inkMuted, marginBottom: 12 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 20, marginTop: 18 },
  label: { fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.brand, borderRadius: 12, paddingHorizontal: 16 },
  dollar: { fontSize: 28, color: colors.brand },
  input: { flex: 1, minWidth: 0, fontSize: 32, color: colors.ink, padding: 12 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 16 },
  preset: { borderWidth: 1, borderColor: colors.border, padding: 12, borderRadius: 10, flexGrow: 1, alignItems: 'center' },
  selected: { backgroundColor: colors.brandSoft, borderColor: colors.brand },
  presetText: { color: colors.brandDark, fontWeight: '700' },
  estimate: { fontSize: 27, color: colors.brand, fontWeight: '800', marginBottom: 8 },
  note: { fontSize: 12, lineHeight: 18, color: colors.inkMuted },
  error: { color: '#9F341B', marginBottom: 12 },
  link: { color: colors.brand, fontWeight: '700', paddingVertical: 14 },
  button: { backgroundColor: colors.brand, borderRadius: 14, padding: 17, alignItems: 'center', marginTop: 20 },
  disabled: { backgroundColor: colors.disabled },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
