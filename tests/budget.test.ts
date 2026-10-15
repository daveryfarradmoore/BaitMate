import { describe, expect, it } from 'vitest';
import { budgetCents, budgetStatus, cheapestItem } from '../supabase/functions/_shared/budget';
import { buildLocalRecommendation } from '../src/services/recommendations.local';
import { SEED_SPECIES, SEED_SPECIES_GEAR_DATA } from '../src/services/seedData';

const request = { species: 'largemouth-bass', method: 'shore', ownedGroups: [] as string[], budgetTier: 'Best Value' as const, budgetUSD: 100 };

describe('budget limits', () => {
  it('aims at the target and allows at most 15% extra', () => {
    expect(budgetStatus(99, 100).status).toBe('within');
    expect(budgetStatus(100, 100).status).toBe('within');
    expect(budgetStatus(100.01, 100).status).toBe('stretch');
    expect(budgetStatus(115, 100).status).toBe('stretch');
    expect(budgetStatus(115.01, 100).status).toBe('over');
    expect(budgetStatus(115.01, 100).maximumUSD).toBe(115);
  });
  it('never rounds a fractional-cent allowance up beyond 15%', () => {
    expect(budgetStatus(0.12, 0.10).maximumUSD).toBe(0.11);
    expect(budgetStatus(0.12, 0.10).status).toBe('over');
  });
  it('handles a zero budget and all-owned setup', () => {
    expect(budgetStatus(0, 0).status).toBe('within');
    expect(budgetStatus(0.01, 0).status).toBe('over');
    const result = buildLocalRecommendation({ ...request, budgetUSD: 0, ownedGroups: Object.keys(SEED_SPECIES_GEAR_DATA['Largemouth Bass']) });
    expect(result.groups).toEqual([]);
    expect(result.totalEstimateUSD).toBe(0);
  });
  it.each([-1, NaN, Infinity, 100001, 1.001])('rejects invalid budget %s', budgetUSD => {
    expect(() => budgetCents(budgetUSD)).toThrow();
    expect(() => buildLocalRecommendation({ ...request, budgetUSD })).toThrow();
  });
  it('chooses by actual price, not tier label', () => {
    const items = [{ tag: 'Best Value', price: 20 }, { tag: 'Premium', price: 10 }];
    expect(cheapestItem(items, item => item.price)).toEqual(items[1]);
  });
});

describe('budget-aware recommendations', () => {
  it.each(SEED_SPECIES)('keeps every required group at the lowest catalog cost for $name', species => {
    const result = buildLocalRecommendation({ ...request, species: species.slug });
    const catalog = SEED_SPECIES_GEAR_DATA[species.name];
    expect(result.groups).toHaveLength(Object.keys(catalog).length);
    for (const group of result.groups) {
      expect(group.items).toHaveLength(1);
      expect(group.items[0].estPriceUSD).toBe(Math.min(...catalog[group.group].map(item => item.price)));
    }
    expect(result.totalEstimateUSD).toBeCloseTo(result.groups.reduce((sum, g) => sum + g.items[0].estPriceUSD, 0), 2);
  });
  it('excludes owned gear from the budget and remaining cost', () => {
    const full = buildLocalRecommendation(request);
    const remaining = buildLocalRecommendation({ ...request, ownedGroups: ['Rod', 'reel'] });
    expect(remaining.groups.some(g => ['Rod', 'Reel'].includes(g.group))).toBe(false);
    const ownedCost = full.groups.filter(g => ['Rod', 'Reel'].includes(g.group)).reduce((sum, g) => sum + g.items[0].estPriceUSD, 0);
    expect(remaining.totalEstimateUSD).toBeCloseTo(full.totalEstimateUSD - ownedCost, 2);
  });
  it('reports an unaffordable complete estimate without hiding essentials', () => {
    const result = buildLocalRecommendation({ ...request, budgetUSD: 1 });
    expect(budgetStatus(result.totalEstimateUSD, 1).status).toBe('over');
    expect(result.groups.some(g => g.group === 'Rod')).toBe(true);
  });
});
