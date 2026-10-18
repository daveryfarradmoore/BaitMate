/**
 * Displays the setup produced from species, access method, owned gear and budget.
 * The service handles cloud/local selection; this screen handles loading/retry,
 * retailer links and ownership toggles that reduce the remaining estimated total.
 * The packaged-kit trial is a separate purchase alternative, not an added cost.
 * Prices may be catalog estimates, and ownership toggles are not saved remotely.
 */
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
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import AuroraBackground from '../components/AuroraBackground';
import {
  fetchGearRecommendations,
  RecommendationServiceError,
} from '../services/recommendations';
import type {
  GearGroup,
  GearItem,
  GearRecommendationResponse,
  PriceResult,
} from '../types/recommendations';
import {
  CATALOG_RETAILER_DISPLAY,
  CATALOG_RETAILER_SLUGS,
  type CatalogRetailerSlug,
} from '../lib/retailerSearchUrls';
import { budgetStatus } from '../../supabase/functions/_shared/budget';
import BudgetKitTrial from '../components/BudgetKitTrial';
import { colors, shadows } from '../theme';

type GearRecommendationScreenRouteProp = RouteProp<
  RootStackParamList,
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

/** Single curated tier shown in the UI (backend still uses Best Value selection). */
const BEST_RESULTS_TIER = 'Best Value' as const;

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
  const compact = useWindowDimensions().width < 520;
  const params = route?.params ?? {};

  const speciesNorm = useMemo(
    () => normalizeSpecies(params.selectedSpecies),
    [params.selectedSpecies],
  );
  const methodNorm = useMemo(() => normalizeMethod(params.method), [params.method]);
  const ownedGroupsParam = useMemo(
    () => normalizeOwnedGroups(params.ownedGroups),
    [params.ownedGroups],
  );

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
        budgetTier: BEST_RESULTS_TIER,
        budgetUSD: params.budgetUSD,
      });
      setOwnedItemIds({});
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
  }, [speciesNorm.slug, methodNorm.slug, ownedGroupsParam, params.budgetUSD]);

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
    // Subtract only newly marked items; previously owned categories were already
    // excluded by the service, so subtracting those again would understate costs.
    if (!response) return 0;
    const ownedSubtotal = flatItems.reduce(
      (sum, item) => (ownedItemIds[item.id] ? sum + item.estPriceUSD : sum),
      0,
    );
    return Math.max(0, response.totalEstimateUSD - ownedSubtotal);
  }, [response, flatItems, ownedItemIds]);

  const budget = params.budgetUSD === undefined ? null : budgetStatus(adjustedTotal, params.budgetUSD);
  const budgetTitle = budget?.status === 'over' ? 'A savings goal, not a plan within your budget'
    : budget?.status === 'stretch' ? 'A little above your target, within your 15% limit'
    : 'Your setup fits your budget';
  const budgetCard = budget && !loading && !error ? <View style={[styles.budgetCard, budget.status === 'over' && { backgroundColor: '#FFF0DF' }]}>
    <Text style={styles.budgetTitle}>{budgetTitle}</Text>
    <Text style={styles.budgetCopy}>Your target: ${params.budgetUSD.toFixed(2)} · Maximum estimate: ${budget.maximumUSD.toFixed(2)}</Text>
    <Text style={styles.budgetCopy}>{budget.status === 'over'
      ? `The lowest-cost complete setup in our catalog is $${adjustedTotal.toFixed(2)} for the gear you still need. Save $${budget.gapUSD.toFixed(2)} more than your target, or borrow gear and mark it as owned below.`
      : budget.status === 'stretch'
      ? `This estimate is $${budget.gapUSD.toFixed(2)} above your target. Borrowing gear could bring it down further.`
      : `You’re $${Math.max(0, params.budgetUSD - adjustedTotal).toFixed(2)} below your target. No need to spend the rest.`}</Text>
    <Text style={styles.budgetNote}>Estimates exclude tax, shipping, licenses, and boat or wading equipment. Check retailer prices before buying.</Text>
    <TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate('Budget', { selectedSpecies: params.selectedSpecies, ownedGroups: [...ownedGroupsParam, ...flatItems.filter(item => ownedItemIds[item.id]).map(item => item.groupLabel)], hasGear: true, budgetUSD: params.budgetUSD })}><Text style={styles.editBudget}>Change my budget</Text></TouchableOpacity>
  </View> : null;

  const handleToggleOwned = useCallback((id: string) => {
    setOwnedItemIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleOpenUrl = useCallback((url: string) => {
    if (!url) return;
    void Linking.openURL(url).catch(() => {
      // Silently swallow; we don't want to crash the screen if a URL is bad.
    });
  }, []);

  const getRetailerOffer = (
    item: GearItem,
    slug: CatalogRetailerSlug,
  ): PriceResult | undefined =>
    item.prices.find((p) => p.retailer === slug);

  const renderGearCard = ({ item }: { item: GearItem & { groupLabel: string } }) => {
    const image = item.prices.find((p) => p.image)?.image;
    const isOwned = !!ownedItemIds[item.id];
    const hasLivePrice = item.prices.some((p) => p.priceUSD != null);

    return (
      <View style={[styles.card, compact && { flexDirection: 'column' }]}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="fish-outline" size={30} color={colors.brand} />
          </View>
        )}
        <View style={[styles.cardBody, compact && { marginLeft: 0, marginTop: 12 }]}>
          <View style={styles.cardHeading}>
            <View style={styles.groupPill}><Text style={styles.groupPillText}>{item.groupLabel}</Text></View>
            <Text style={styles.price}>{hasLivePrice ? 'From ' : 'Est. '}${item.estPriceUSD.toFixed(2)}</Text>
          </View>
          <Text style={styles.gearName}>{item.name}</Text>
          <Text style={styles.description}>{item.description}</Text>
          {item.rationale ? (
            <Text style={styles.rationale}>{item.rationale}</Text>
          ) : null}
          {!hasLivePrice ? (
            <Text style={styles.priceHint}>Tap a retailer below to check current price</Text>
          ) : null}

          <View style={styles.retailerRow}>
            {CATALOG_RETAILER_SLUGS.map((slug) => {
              const offer = getRetailerOffer(item, slug);
              if (!offer?.url) return null;
              const label = CATALOG_RETAILER_DISPLAY[slug];
              const sublabel =
                offer.priceUSD != null
                  ? `$${offer.priceUSD.toFixed(2)}`
                  : 'Check current price';
              return (
                <TouchableOpacity
                  key={slug}
                  style={styles.retailerBtn}
                  onPress={() => handleOpenUrl(offer.url)}
                  activeOpacity={0.85}
                >
                  <View>
                    <Text style={styles.retailerBtnLabel}>{label}</Text>
                    <Text style={styles.retailerBtnSublabel}>{sublabel}</Text>
                  </View>
                  <Ionicons name="open-outline" size={15} color={colors.brand} />
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.checkboxRow}>
            <Switch
              value={isOwned}
              onValueChange={() => handleToggleOwned(item.id)}
              style={styles.checkbox}
            />
            <Text style={styles.checkboxLabel}>I already own this</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AuroraBackground />
      <View style={styles.headerCard}>
        <View style={styles.resultBadge}>
          <Ionicons name="checkmark-circle" size={16} color={colors.brand} />
          <Text style={styles.resultBadgeText}>YOUR GEAR PLAN</Text>
        </View>
        <Text style={styles.title}>{speciesNorm.display} setup</Text>
        <Text style={styles.subtitle}>{methodNorm.display} · {params.budgetUSD === undefined ? 'Best-value picks' : 'Starter-budget picks'} · {flatItems.length} categories</Text>
      </View>

      {loading ? (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="large" color={colors.brand} />
          <Text style={styles.statusText}>Finding the best results for {speciesNorm.display}…</Text>
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
          <BudgetKitTrial species={speciesNorm.slug} budget={params.budgetUSD} ownedCount={ownedGroupsParam.length} />
          {budgetCard}
          <Text style={styles.errorTitle}>{ownedGroupsParam.length ? "You’re ready with the gear you own" : "No recommendations yet"}</Text>
          <Text style={styles.statusText}>
            {ownedGroupsParam.length ? "No additional gear from this catalog is needed. Your estimated gear cost is $0." : `We don’t have curated gear for ${speciesNorm.display} (${methodNorm.display}) yet. Try a different combination.`}
          </Text>
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={<><BudgetKitTrial species={speciesNorm.slug} budget={params.budgetUSD} ownedCount={ownedGroupsParam.length} />{budgetCard}</>}
          data={flatItems}
          renderItem={renderGearCard}
          keyExtractor={(item) => item.id}
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator
        />
      )}

      {!loading && !error ? <View style={[styles.footer, compact && { flexDirection: 'column', alignItems: 'stretch', gap: 10 }]}>
        <View>
          <Text style={styles.totalLabel}>{budget?.status === 'over' ? 'STARTER SAVINGS GOAL' : 'ESTIMATED GEAR TOTAL'}</Text>
          <Text style={styles.totalText}>${adjustedTotal.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => navigation.reset({ index: 1, routes: [{ name: 'Welcome' }, { name: 'SpeciesSelector' }] })}
        >
          <Ionicons name="refresh" size={17} color="#fff" />
          <Text style={styles.continueText}>Build another plan</Text>
        </TouchableOpacity>
      </View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  budgetCard: { backgroundColor: colors.brandSoft, borderRadius: 16, padding: 18, marginBottom: 18 },
  budgetTitle: { color: colors.ink, fontSize: 18, fontWeight: '800', marginBottom: 8 },
  budgetCopy: { color: colors.ink, fontSize: 14, lineHeight: 21, marginBottom: 8 },
  budgetNote: { color: colors.inkMuted, fontSize: 12, lineHeight: 18 },
  editBudget: { color: colors.brand, fontWeight: '700', paddingTop: 14, paddingBottom: 4 },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: Platform.OS === 'android' ? 20 : 26,
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 920,
    alignSelf: 'center',
  },
  headerCard: {
    alignItems: 'center',
    marginBottom: 18,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brandSoft,
    borderRadius: 99,
    paddingVertical: 7,
    paddingHorizontal: 11,
    marginBottom: 11,
  },
  resultBadgeText: {
    fontSize: 10,
    letterSpacing: 1.3,
    fontWeight: '800',
    color: colors.brandDark,
    marginLeft: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.inkMuted,
    textAlign: 'center',
    marginBottom: 16,
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
    backgroundColor: colors.brand,
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
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14,
    ...shadows.card,
  },
  cardBody: {
    flex: 1,
    marginLeft: 16,
  },
  cardHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupPill: {
    backgroundColor: colors.brandSoft,
    borderRadius: 99,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  groupPillText: {
    fontSize: 10,
    letterSpacing: 0.8,
    fontWeight: '800',
    color: colors.brandDark,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: colors.brandSoft,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 5,
  },
  description: {
    fontSize: 13,
    color: colors.inkMuted,
    marginBottom: 4,
  },
  rationale: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.brand,
    marginBottom: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.ink,
  },
  priceHint: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  retailerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  retailerBtn: {
    backgroundColor: colors.canvas,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    width: '48%',
    marginBottom: 6,
    marginRight: '2%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  retailerBtnLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
  },
  retailerBtnSublabel: {
    fontSize: 11,
    color: colors.brand,
    marginTop: 2,
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
    color: colors.inkMuted,
  },
  footer: {
    flexShrink: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 20,
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
    fontSize: 24,
    fontWeight: '800',
    color: colors.ink,
  },
  totalLabel: {
    fontSize: 9,
    letterSpacing: 1.1,
    fontWeight: '800',
    color: colors.inkMuted,
    marginBottom: 2,
  },
  continueBtn: {
    backgroundColor: colors.brand,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 7,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 10,
  },
});

export default GearRecommendationScreen;
