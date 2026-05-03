import { describe, expect, it } from 'vitest';
import { buildLocalRecommendation } from '../src/services/recommendations.local';
import {
  SEED_DEFAULT_GEAR,
  SEED_SPECIES_GEAR_DATA,
} from '../src/services/seedData';

describe('buildLocalRecommendation', () => {
  it('returns a Best Value recommendation for a known species + slug input', () => {
    const res = buildLocalRecommendation({
      species: 'largemouth-bass',
      method: 'shore',
      ownedGroups: [],
      budgetTier: 'Best Value',
    });

    expect(res.species).toBe('largemouth-bass');
    expect(res.method).toBe('shore');
    expect(res.source).toEqual({ provider: 'mock', cached: false });
    expect(res.groups.length).toBeGreaterThan(0);
    for (const g of res.groups) {
      expect(g.items).toHaveLength(1);
      const item = g.items[0]!;
      expect(item.estPriceUSD).toBeGreaterThan(0);
      expect(item.prices[0]?.retailer).toBe('mock');
      expect(item.links[0]?.url).toMatch(/^https:\/\/example\.com\/mock\//);
    }
  });

  it('returns a recommendation when species is given by display name', () => {
    const res = buildLocalRecommendation({
      species: 'Largemouth Bass',
      method: 'shore',
      ownedGroups: [],
      budgetTier: 'Best Value',
    });
    expect(res.groups.length).toBeGreaterThan(0);
  });

  it('falls back to default gear for an unknown species', () => {
    const res = buildLocalRecommendation({
      species: 'unknown-fish',
      method: 'shore',
      ownedGroups: [],
      budgetTier: 'Best Value',
    });
    const groupNames = new Set(res.groups.map((g) => g.group));
    for (const expected of Object.keys(SEED_DEFAULT_GEAR)) {
      expect(groupNames.has(expected)).toBe(true);
    }
  });

  it('removes owned gear groups by slug', () => {
    const res = buildLocalRecommendation({
      species: 'largemouth-bass',
      method: 'shore',
      ownedGroups: ['rod', 'reel'],
      budgetTier: 'Best Value',
    });
    const groupNames = res.groups.map((g) => g.group);
    expect(groupNames).not.toContain('Rod');
    expect(groupNames).not.toContain('Reel');
  });

  it('removes owned gear groups by display name (legacy callers)', () => {
    const res = buildLocalRecommendation({
      species: 'largemouth-bass',
      method: 'shore',
      ownedGroups: ['Rod'],
      budgetTier: 'Best Value',
    });
    expect(res.groups.map((g) => g.group)).not.toContain('Rod');
  });

  it('total estimate equals the sum of recommended item prices', () => {
    const res = buildLocalRecommendation({
      species: 'largemouth-bass',
      method: 'shore',
      ownedGroups: [],
      budgetTier: 'Premium',
    });
    const sum = res.groups.reduce(
      (acc, g) => acc + g.items.reduce((s, i) => s + i.estPriceUSD, 0),
      0,
    );
    expect(res.totalEstimateUSD).toBeCloseTo(sum, 2);
  });

  it('prefers exact tier match (Premium when requested)', () => {
    const res = buildLocalRecommendation({
      species: 'largemouth-bass',
      method: 'shore',
      ownedGroups: [],
      budgetTier: 'Premium',
    });
    const rod = res.groups.find((g) => g.group === 'Rod');
    expect(rod).toBeDefined();
    expect(rod!.items[0]!.tag).toBe('Premium');
  });

  it('falls back to Best Value when Premium is unavailable for that group', () => {
    // Trout's "Bait" group only has Best Value and Value Items, so Premium tier
    // should fall back gracefully without dropping the group from the response.
    const res = buildLocalRecommendation({
      species: 'trout',
      method: 'shore',
      ownedGroups: [],
      budgetTier: 'Premium',
    });
    const bait = res.groups.find((g) => g.group === 'Bait');
    expect(bait).toBeDefined();
    expect(bait!.items[0]!.tag).not.toBe('Premium');
  });
});

describe('seed data integrity', () => {
  it('every seeded item has a non-negative price and a known tag', () => {
    const validTags = new Set(['Best Value', 'Premium', 'Value Items', 'Cheapest']);
    for (const [, gear] of Object.entries(SEED_SPECIES_GEAR_DATA)) {
      for (const items of Object.values(gear)) {
        for (const item of items) {
          expect(item.price).toBeGreaterThanOrEqual(0);
          expect(validTags.has(item.tag)).toBe(true);
          expect(item.name.length).toBeGreaterThan(0);
        }
      }
    }
  });
});
