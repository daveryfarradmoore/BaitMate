/**
 * Source-of-truth for the seeded gear catalog.
 *
 * - Used by `recommendations.local.ts` so the app keeps working when Supabase
 *   is not yet configured (e.g. demo mode).
 * - Mirrors what `supabase/seed.sql` inserts into Postgres, so the offline and
 *   online flows return identical recommendations.
 *
 * If you change anything here, regenerate `supabase/seed.sql` to match.
 */

import type { GearTag } from '../types/recommendations';

export interface SeedGearItem {
  name: string;
  description: string;
  /** Local placeholder; real product images come from price providers. */
  image: string;
  price: number;
  tag: GearTag;
}

export type SeedSpeciesGear = Record<string, SeedGearItem[]>;

export type SeedSpeciesGearData = Record<string, SeedSpeciesGear>;

const placeholderImg = 'https://via.placeholder.com/80';

export const SEED_FISHING_METHODS: { slug: string; name: string }[] = [
  { slug: 'shore', name: 'From Shore' },
  { slug: 'wading', name: 'Wading' },
  { slug: 'boat', name: 'From Boat' },
];

export const SEED_GEAR_GROUPS: { slug: string; name: string; order: number }[] = [
  { slug: 'rod', name: 'Rod', order: 10 },
  { slug: 'reel', name: 'Reel', order: 20 },
  { slug: 'line', name: 'Line', order: 30 },
  { slug: 'hooks', name: 'Hooks', order: 40 },
  { slug: 'bait', name: 'Bait', order: 50 },
  { slug: 'lures', name: 'Lures', order: 60 },
  { slug: 'flies', name: 'Flies', order: 70 },
  { slug: 'bobbers', name: 'Bobbers', order: 80 },
  { slug: 'sinkers', name: 'Sinkers', order: 90 },
  { slug: 'terminal', name: 'Terminal', order: 100 },
];

export const SEED_RETAILERS: { slug: 'mock' | 'amazon' | 'walmart'; displayName: string }[] = [
  { slug: 'mock', displayName: 'Mock Retailer' },
  { slug: 'amazon', displayName: 'Amazon' },
  { slug: 'walmart', displayName: 'Walmart' },
];

/**
 * Maps a UI-friendly group key (the keys in `SEED_SPECIES_GEAR_DATA` below)
 * to its database slug. New groups must be added to `SEED_GEAR_GROUPS`.
 */
export const GROUP_NAME_TO_SLUG: Record<string, string> = {
  Rod: 'rod',
  Reel: 'reel',
  Line: 'line',
  Hooks: 'hooks',
  Bait: 'bait',
  Lures: 'lures',
  Flies: 'flies',
  Bobbers: 'bobbers',
  Sinkers: 'sinkers',
  Terminal: 'terminal',
};

export const SEED_SPECIES: { slug: string; name: string; color: string }[] = [
  { slug: 'largemouth-bass', name: 'Largemouth Bass', color: '#059669' },
  { slug: 'smallmouth-bass', name: 'Smallmouth Bass', color: '#059669' },
  { slug: 'trout', name: 'Trout', color: '#0891b2' },
  { slug: 'atlantic-salmon', name: 'Atlantic Salmon', color: '#dc2626' },
  { slug: 'bluegill', name: 'Bluegill', color: '#ea580c' },
  { slug: 'catfish', name: 'Catfish', color: '#7c3aed' },
];

export const SEED_SPECIES_GEAR_DATA: SeedSpeciesGearData = {
  'Largemouth Bass': {
    Rod: [
      { name: "Medium-Heavy Spinning Rod 7'", description: 'Perfect for jigs, soft plastics, and crankbaits.', price: 89.99, tag: 'Best Value', image: placeholderImg },
      { name: "Medium-Heavy Baitcasting Rod 7'", description: 'Ideal for flipping, pitching, and heavy cover fishing.', price: 129.99, tag: 'Premium', image: placeholderImg },
    ],
    Reel: [
      { name: 'Spinning Reel 3000-4000', description: 'Smooth drag system for bass fishing techniques.', price: 79.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Baitcasting Reel 3000-4000', description: 'High-performance reel with precise casting control.', price: 149.99, tag: 'Premium', image: placeholderImg },
    ],
    Line: [
      { name: 'Braided Line 20-30lb + Fluorocarbon Leader 10-12lb', description: 'High-strength braid with invisible leader for clear water.', price: 34.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Premium Braided Line + Fluorocarbon Leader', description: 'Top-tier line system for tournament fishing.', price: 59.99, tag: 'Premium', image: placeholderImg },
    ],
    Lures: [
      { name: 'Jigs 3/8-1/2 oz Set', description: 'Flipping, pitching, and swim jigs in various colors.', price: 24.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Soft Plastics Variety Pack', description: 'Worms, craws, swimbaits, and creature baits.', price: 19.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Crankbaits Shallow Divers', description: 'Craw and shad colored shallow diving crankbaits.', price: 16.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Topwater Lures Set', description: 'Frogs, poppers, and walking baits for surface action.', price: 29.99, tag: 'Premium', image: placeholderImg },
    ],
    Terminal: [
      { name: 'Terminal Tackle Kit', description: 'Hooks, weights, and bobbers for finesse and live bait.', price: 14.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Premium Terminal Kit', description: 'High-quality hooks and weights for all techniques.', price: 24.99, tag: 'Premium', image: placeholderImg },
    ],
  },
  'Smallmouth Bass': {
    Rod: [
      { name: 'Medium Spinning Rod 6\'6"-7\'', description: 'Perfect for tubes, swimbaits, and finesse techniques.', price: 79.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Premium Medium Spinning Rod', description: 'High-sensitivity rod for detecting subtle bites.', price: 149.99, tag: 'Premium', image: placeholderImg },
    ],
    Reel: [
      { name: 'Spinning Reel 2500-3000', description: 'Lightweight reel perfect for smallmouth techniques.', price: 69.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Premium Spinning Reel', description: 'Ultra-smooth drag and precision casting.', price: 129.99, tag: 'Premium', image: placeholderImg },
    ],
    Line: [
      { name: 'Braided Line 15-20lb + Fluorocarbon Leader 8-12lb', description: 'Light braid with fluorocarbon leader for clear water.', price: 28.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Premium Braided Line + Fluorocarbon Leader', description: 'Top-quality line system for finesse fishing.', price: 49.99, tag: 'Premium', image: placeholderImg },
    ],
    Lures: [
      { name: 'Tubes 3-4" Natural Colors', description: 'Green pumpkin and smoke colored tubes for smallmouth.', price: 12.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Swimbaits 2-4" Shad/Perch', description: 'Realistic swimbaits in shad and perch patterns.', price: 18.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Finesse Jigs 1/8-3/8 oz', description: 'Hair and finesse jigs for smallmouth bass.', price: 14.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Inline Spinners Mepps/Rooster Tail', description: 'Size 2-4 spinners for active smallmouth.', price: 9.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Crankbaits Medium Divers', description: 'Shad and craw colored medium diving crankbaits.', price: 16.99, tag: 'Premium', image: placeholderImg },
    ],
  },
  Trout: {
    Rod: [
      { name: 'Trout Ultralight Rod', description: "Sensitive 7' ultralight rod for trout fishing.", price: 129.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Budget Trout Rod', description: 'Light action rod perfect for trout streams.', price: 49.99, tag: 'Value Items', image: placeholderImg },
    ],
    Reel: [
      { name: 'Trout Spinning Reel', description: 'Ultralight reel with smooth drag for trout.', price: 89.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Entry Trout Reel', description: 'Lightweight reel suitable for trout fishing.', price: 34.99, tag: 'Value Items', image: placeholderImg },
    ],
    Line: [
      { name: 'Trout Fluorocarbon 4lb', description: 'Invisible fluorocarbon line for clear trout waters.', price: 18.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Trout Mono 6lb', description: 'Standard monofilament for trout fishing.', price: 6.99, tag: 'Value Items', image: placeholderImg },
    ],
    Hooks: [
      { name: 'Trout Hook Set', description: 'Small hooks size 8-14 for trout flies and bait.', price: 8.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Basic Trout Hooks', description: 'Standard trout hooks in small sizes.', price: 3.99, tag: 'Value Items', image: placeholderImg },
    ],
    Bait: [
      { name: 'Trout PowerBait', description: 'Scented bait specifically designed for trout.', price: 5.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Live Mealworms', description: 'Natural bait that trout love.', price: 2.99, tag: 'Value Items', image: placeholderImg },
    ],
    Flies: [
      { name: 'Trout Fly Set', description: 'Assorted dry flies and nymphs for trout.', price: 24.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Basic Trout Flies', description: 'Essential flies for trout fishing.', price: 9.99, tag: 'Value Items', image: placeholderImg },
    ],
  },
  'Atlantic Salmon': {
    Rod: [
      { name: 'Medium-Heavy Spinning Rod 7\'-7\'6"', description: 'Perfect length and action for Atlantic salmon fishing.', price: 129.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Premium Medium-Heavy Spinning Rod', description: 'High-quality rod with excellent sensitivity and power.', price: 199.99, tag: 'Premium', image: placeholderImg },
    ],
    Reel: [
      { name: 'Spinning Reel 3000-4000', description: 'Smooth drag system essential for salmon fishing.', price: 89.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Premium Spinning Reel', description: 'Heavy-duty reel with superior drag performance.', price: 179.99, tag: 'Premium', image: placeholderImg },
    ],
    Line: [
      { name: 'Braided Line 20-30lb + Fluorocarbon Leader 10-15lb', description: 'High-strength braid with fluorocarbon leader for salmon.', price: 39.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Premium Braided Line + Fluorocarbon Leader', description: 'Top-tier line system for Atlantic salmon.', price: 69.99, tag: 'Premium', image: placeholderImg },
    ],
    Lures: [
      { name: 'Inline Spinners Size 3-5 Silver/Orange', description: 'Classic spinners in silver and orange colors.', price: 14.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Spoons 2-3" Silver/Gold', description: 'Heavy spoons in silver and gold finishes.', price: 12.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Premium Spinner Set', description: 'High-quality spinners in various sizes and colors.', price: 24.99, tag: 'Premium', image: placeholderImg },
    ],
    Bait: [
      { name: 'Beads 8-10mm Natural/Bright', description: 'Natural and bright colored beads for drifting.', price: 8.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Spawn Sacs', description: 'Drifted under float or rig for Atlantic salmon.', price: 6.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Premium Spawn Sacs', description: 'High-quality cured spawn sacs.', price: 12.99, tag: 'Premium', image: placeholderImg },
    ],
    Terminal: [
      { name: 'Salmon Terminal Kit', description: 'Hooks, split shot, and floats for drifting setups.', price: 16.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Premium Salmon Terminal Kit', description: 'High-quality hooks and terminal tackle.', price: 29.99, tag: 'Premium', image: placeholderImg },
    ],
  },
  Bluegill: {
    Rod: [
      { name: 'Bluegill Ultralight Rod', description: "Light 5'6\" rod perfect for bluegill fishing.", price: 69.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Budget Bluegill Rod', description: 'Light action rod for panfish like bluegill.', price: 29.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Reel: [
      { name: 'Bluegill Spinning Reel', description: 'Ultralight reel with smooth operation.', price: 49.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Entry Bluegill Reel', description: 'Small reel perfect for bluegill fishing.', price: 19.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Line: [
      { name: 'Bluegill Fluorocarbon 2lb', description: 'Ultra-light line for bluegill fishing.', price: 12.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Bluegill Mono 4lb', description: 'Light monofilament for bluegill.', price: 4.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Hooks: [
      { name: 'Bluegill Hook Set', description: 'Small hooks size 10-16 for bluegill.', price: 6.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Basic Bluegill Hooks', description: 'Tiny hooks perfect for bluegill.', price: 2.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Bait: [
      { name: 'Bluegill Worms', description: 'Small worms and grubs for bluegill.', price: 3.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Live Crickets', description: 'Natural bait that bluegill love.', price: 1.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Bobbers: [
      { name: 'Bluegill Bobber Set', description: 'Small bobbers perfect for bluegill fishing.', price: 4.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Basic Bluegill Bobbers', description: 'Simple bobbers for bluegill.', price: 1.99, tag: 'Cheapest', image: placeholderImg },
    ],
  },
  Catfish: {
    Rod: [
      { name: 'Catfish Heavy Rod', description: 'Heavy action rod for big catfish.', price: 119.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Budget Catfish Rod', description: 'Strong rod for catfish fishing.', price: 49.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Reel: [
      { name: 'Catfish Spinning Reel', description: 'Heavy-duty reel with strong drag.', price: 99.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Entry Catfish Reel', description: 'Durable reel for catfish.', price: 39.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Line: [
      { name: 'Catfish Braid 50lb', description: 'Heavy braided line for big catfish.', price: 39.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Catfish Mono 25lb', description: 'Strong monofilament for catfish.', price: 14.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Hooks: [
      { name: 'Catfish Hook Set', description: 'Large circle hooks for catfish.', price: 14.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Basic Catfish Hooks', description: 'Heavy hooks for catfish fishing.', price: 6.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Bait: [
      { name: 'Catfish Stink Bait', description: "Scented bait that catfish can't resist.", price: 7.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Live Minnows', description: 'Natural bait for catfish.', price: 4.99, tag: 'Cheapest', image: placeholderImg },
    ],
    Sinkers: [
      { name: 'Catfish Sinker Set', description: 'Heavy sinkers for bottom fishing.', price: 8.99, tag: 'Best Value', image: placeholderImg },
      { name: 'Basic Catfish Sinkers', description: 'Heavy sinkers for catfish.', price: 3.99, tag: 'Cheapest', image: placeholderImg },
    ],
  },
};

/** Used when the requested species is not in the seed catalog. */
export const SEED_DEFAULT_GEAR: SeedSpeciesGear = {
  Rod: [
    { name: 'All-Purpose Rod', description: 'Versatile rod for various fish species.', price: 79.99, tag: 'Best Value', image: placeholderImg },
    { name: 'Budget Fishing Rod', description: 'Affordable rod for general fishing.', price: 34.99, tag: 'Cheapest', image: placeholderImg },
  ],
  Reel: [
    { name: 'All-Purpose Reel', description: 'Versatile spinning reel for various fish.', price: 59.99, tag: 'Best Value', image: placeholderImg },
    { name: 'Budget Fishing Reel', description: 'Reliable reel for general fishing.', price: 24.99, tag: 'Cheapest', image: placeholderImg },
  ],
  Line: [
    { name: 'All-Purpose Line', description: 'Versatile fishing line for various species.', price: 14.99, tag: 'Best Value', image: placeholderImg },
    { name: 'Budget Fishing Line', description: 'Standard monofilament line.', price: 5.99, tag: 'Cheapest', image: placeholderImg },
  ],
  Hooks: [
    { name: 'All-Purpose Hooks', description: 'Assorted hooks for various fish.', price: 9.99, tag: 'Best Value', image: placeholderImg },
    { name: 'Basic Fishing Hooks', description: 'Standard hooks for general fishing.', price: 3.99, tag: 'Cheapest', image: placeholderImg },
  ],
  Bait: [
    { name: 'All-Purpose Bait', description: 'Versatile bait for various fish species.', price: 6.99, tag: 'Best Value', image: placeholderImg },
    { name: 'Live Worms', description: 'Classic live bait for fishing.', price: 2.99, tag: 'Cheapest', image: placeholderImg },
  ],
};

/** Stable URL used by the mock retailer for any seeded gear item. */
export function mockProductUrl(itemName: string): string {
  const slug = itemName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `https://example.com/mock/${slug}`;
}
