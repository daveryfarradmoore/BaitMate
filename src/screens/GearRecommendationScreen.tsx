import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import AuroraBackground from '../components/AuroraBackground';
import {
  fetchGearRecommendations,
  RecommendationServiceError,
} from '../services/recommendations';
import type {
  BudgetTier,
  GearGroup,
  GearItem,
  GearRecommendationResponse,
} from '../types/recommendations';

interface NavigationParams {
  species?: string | { name?: string; id?: string };
  method?: string | { text?: string; id?: string };
  gearOwned?: boolean | string[];
}

type RecommendationRouteParams = RootStackParamList['GearRecommendation'] & NavigationParams;

type GearRecommendationScreenRouteProp = RouteProp<
  { GearRecommendation: RecommendationRouteParams },
  'GearRecommendation'
>;
type GearRecommendationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'GearRecommendation'
>;

interface Props {
  route: GearRecommendationScreenRouteProp;
  navigation: GearRecommendationScreenNavigationProp;
}

const placeholderImg = 'https://via.placeholder.com/80';

interface NormalizedSpecies {
  slug: string;
  display: string;
}

function normalizeSpecies(raw: unknown): NormalizedSpecies {
  if (typeof raw === 'string' && raw.length > 0) {
    return { slug: raw, display: raw };
  }
  if (raw && typeof raw === 'object') {
    const obj = raw as { id?: string; name?: string; slug?: string };
    const slug = obj.id ?? obj.slug;
    const display = obj.name ?? slug ?? 'Bass';
    if (slug) return { slug, display };
    if (obj.name) return { slug: obj.name, display: obj.name };
  }
  return { slug: 'largemouth-bass', display: 'Largemouth Bass' };
}

function normalizeMethod(raw: unknown): { slug: string; display: string } {
  if (typeof raw === 'string' && raw.length > 0) {
    return { slug: raw, display: prettifyMethod(raw) };
  }
  if (raw && typeof raw === 'object') {
    const obj = raw as { id?: string; text?: string };
    const slug = obj.id ?? 'shore';
    return { slug, display: obj.text ?? prettifyMethod(slug) };
  }
  return { slug: 'shore', display: 'From Shore' };
}

function prettifyMethod(slug: string): string {
  switch (slug) {
    case 'shore':
      return 'From Shore';
    case 'wading':
      return 'Wading';
    case 'boat':
      return 'From Boat';
    default:
      return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

function normalizeOwnedGroups(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((s): s is string => typeof s === 'string');
  return [];
}

const GearRecommendationScreen: React.FC<Props> = ({ route, navigation }) => {
  const params = route?.params ?? {};

  const speciesNorm = useMemo(() => normalizeSpecies(params.species), [params.species]);
  const methodNorm = useMemo(() => normalizeMethod(params.method), [params.method]);
  const ownedGroupsParam = useMemo(
    () => normalizeOwnedGroups(params.gearOwned),
    [params.gearOwned],
  );

  const [budgetTier, setBudgetTier] = useState<BudgetTier>('Best Value');
  const [response, setResponse] = useState<GearRecommendationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ownedItemIds, setOwnedItemIds] = useState<Record<string, boolean>>({});

  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchGearRecommendations({
        species: speciesNorm.slug,
        method: methodNorm.slug,
        ownedGroups: ownedGroupsParam,
        budgetTier,
      });
      setResponse(result);
    } catch (e) {
      const message = e instanceof RecommendationServiceError
        ? e.body.message
        : 'Could not load recommendations. Please try again.';
      setError(message);
      setResponse(null);
    } finally {
      setLoading(false);
    }
  }, [speciesNorm.slug, methodNorm.slug, ownedGroupsParam, budgetTier]);

  useEffect(() => {
    void loadRecommendations();
  }, [loadRecommendations]);

  const flatItems: (GearItem & { groupLabel: string })[] = useMemo(() => {
    if (!response) return [];
    return response.groups.flatMap((g: GearGroup) =>
      g.items.map((item) => ({ ...item, groupLabel: g.group })),
    );
  }, [response]);

  const adjustedTotal = useMemo(() => {
    if (!response) return 0;
    const ownedSubtotal = flatItems.reduce(
      (sum, item) => (ownedItemIds[item.id] ? sum + item.estPriceUSD : sum),
      0,
    );
    return Math.max(0, response.totalEstimateUSD - ownedSubtotal);
  }, [response, flatItems, ownedItemIds]);

  const handleToggleOwned = useCallback((id: string) => {
    setOwnedItemIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleOpenLink = useCallback((item: GearItem) => {
    const url = item.links[0]?.url ?? item.prices[0]?.url;
    if (!url) return;
    void Linking.openURL(url).catch(() => {
      // Silently swallow; we don't want to crash the screen if a URL is bad.
    });
  }, []);

  const renderGearCard = ({ item }: { item: GearItem & { groupLabel: string } }) => {
    const image = item.prices[0]?.image ?? placeholderImg;
    const isOwned = !!ownedItemIds[item.id];
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => handleOpenLink(item)}
      >
        <Image source={{ uri: image }} style={styles.image} />
        <View style={styles.cardBody}>
          <Text style={styles.gearName}>{item.groupLabel}: {item.name}</Text>
          <Text style={styles.description}>{item.description}</Text>
          {item.rationale ? (
            <Text style={styles.rationale}>{item.rationale}</Text>
          ) : null}
          <Text style={styles.price}>
            ${item.estPriceUSD.toFixed(2)}{' '}
            <Text style={styles.tag}>[{item.tag}]</Text>
          </Text>
          <View style={styles.checkboxRow}>
            <Switch
              value={isOwned}
              onValueChange={() => handleToggleOwned(item.id)}
              style={styles.checkbox}
            />
            <Text style={styles.checkboxLabel}>I already own this</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <AuroraBackground />
      <Text style={styles.title}>
        Recommended Gear for {speciesNorm.display} ({methodNorm.display})
      </Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, budgetTier === 'Best Value' && styles.toggleActive]}
          onPress={() => setBudgetTier('Best Value')}
        >
          <Text style={[styles.toggleText, budgetTier === 'Best Value' && styles.toggleTextActive]}>
            Best Value
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, budgetTier === 'Premium' && styles.toggleActive]}
          onPress={() => setBudgetTier('Premium')}
        >
          <Text style={[styles.toggleText, budgetTier === 'Premium' && styles.toggleTextActive]}>
            Premium
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.statusText}>Curating gear for {speciesNorm.display}…</Text>
        </View>
      ) : error ? (
        <View style={styles.statusContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.statusText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadRecommendations}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : flatItems.length === 0 ? (
        <View style={styles.statusContainer}>
          <Text style={styles.errorTitle}>No recommendations yet</Text>
          <Text style={styles.statusText}>
            We don&apos;t have curated gear for {speciesNorm.display} ({methodNorm.display}) yet.
            Try a different combination.
          </Text>
        </View>
      ) : (
        <FlatList
          data={flatItems}
          renderItem={renderGearCard}
          keyExtractor={(item) => item.id}
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator
        />
      )}

      <View style={styles.footer}>
        <Text style={styles.totalText}>Estimated Total: ${adjustedTotal.toFixed(2)}</Text>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => navigation.navigate('Welcome')}
        >
          <Text style={styles.continueText}>Start Over</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
  statusContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  statusText: {
    marginTop: 12,
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
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
  cardBody: {
    flex: 1,
    marginLeft: 12,
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
  rationale: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#2563eb',
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
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 120,
    paddingTop: 10,
  },
});

export default GearRecommendationScreen;
