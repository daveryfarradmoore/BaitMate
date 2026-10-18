import React, { useState } from 'react';
import { Linking, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme';

export function matchingKits(species: string, budget: number) {
  // Manually researched trial data, not a live retailer feed. Compare cents
  // strictly below budget; tax/shipping and existing owned gear do not reduce it.
  return [{ species: ['largemouth-bass', 'smallmouth-bass'], name: 'Shakespeare Catch More Fish Bass Spinning Kit', price: 36.99, url: 'https://www.purefishing.com/products/shakespeare-catch-more-fish-bass-spinning-1624441' }].filter(kit => kit.species.includes(species) && Math.round(kit.price * 100) < Math.round(budget * 100));
}
export default function BudgetKitTrial({ species, budget, ownedCount }: { species: string; budget: number; ownedCount: number }) {
  const [enabled, setEnabled] = useState(true);
  const [error, setError] = useState('');
  const kits = matchingKits(species, budget);
  return <View style={{ padding: 18, borderRadius: 16, backgroundColor: colors.brandSoft, marginBottom: 18, gap: 12 }}>
    <Text style={{ fontWeight: '800', fontSize: 20 }}>Budget kits · Trial</Text>
    <TouchableOpacity accessibilityRole="switch" accessibilityState={{ checked: enabled }} onPress={() => setEnabled(!enabled)}><Text style={{ color: colors.brand, fontWeight: '700' }}>{enabled ? 'Switch back to individual gear' : 'Try budget kits again'}</Text></TouchableOpacity>
    {enabled ? <>
      <Text>Packaged kits listed below your ${budget.toFixed(2)} gear budget. Choose a kit OR the individual setup below; their costs are separate.</Text>
      {ownedCount > 0 ? <Text>A full kit may duplicate gear you own. Compare against the remaining individual gear cost.</Text> : null}
      {kits.length ? kits.map(kit => <View key={kit.url} style={{ gap: 10 }}>
        <Text style={{ fontWeight: '800' }}>{kit.name} · ${kit.price.toFixed(2)}</Text>
        <Text>Includes medium 6′6″ rod, spinning reel, 8 lb line, tackle box, baits, hooks, jig head, and split shot.</Text>
        <Text>Listed price checked October 18, 2026; not a live quote. Tax, shipping, licenses and accessories are extra. Confirm availability and checkout total before buying.</Text>
        <TouchableOpacity accessibilityRole="link" onPress={() => { void Linking.openURL(kit.url).catch(() => setError('Unable to open the retailer. Please try again.')); }}><Text style={{ color: colors.brand, fontWeight: '800' }}>Check kit price and availability →</Text></TouchableOpacity>
      </View>) : <Text>No verified packaged kit below this budget is in our trial catalog for this species yet. Compare the individual setup below.</Text>}
      {error ? <Text accessibilityRole="alert">{error}</Text> : null}
    </> : <Text>Your original individual recommendations are shown below.</Text>}
  </View>;
}
