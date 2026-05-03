-- BaitMate seed data.
-- Mirrors `src/services/seedData.ts` so the offline mock fallback in the app
-- and the real Postgres-backed flow return identical recommendations.
-- Re-runnable: `on conflict do nothing` keeps lookup tables idempotent and
-- the gear catalog is rebuilt from scratch.

-- ---------------------------------------------------------------------------
-- Lookup data
-- ---------------------------------------------------------------------------
insert into public.retailers (slug, display_name) values
  ('mock', 'Mock Retailer'),
  ('amazon', 'Amazon'),
  ('walmart', 'Walmart')
on conflict (slug) do nothing;

insert into public.fishing_methods (slug, name) values
  ('shore', 'From Shore'),
  ('wading', 'Wading'),
  ('boat', 'From Boat')
on conflict (slug) do nothing;

insert into public.gear_groups (slug, name, display_order) values
  ('rod', 'Rod', 10),
  ('reel', 'Reel', 20),
  ('line', 'Line', 30),
  ('hooks', 'Hooks', 40),
  ('bait', 'Bait', 50),
  ('lures', 'Lures', 60),
  ('flies', 'Flies', 70),
  ('bobbers', 'Bobbers', 80),
  ('sinkers', 'Sinkers', 90),
  ('terminal', 'Terminal', 100)
on conflict (slug) do nothing;

insert into public.species (slug, name, color) values
  ('largemouth-bass', 'Largemouth Bass', '#059669'),
  ('smallmouth-bass', 'Smallmouth Bass', '#059669'),
  ('trout',           'Trout',           '#0891b2'),
  ('atlantic-salmon', 'Atlantic Salmon', '#dc2626'),
  ('bluegill',        'Bluegill',        '#ea580c'),
  ('catfish',         'Catfish',         '#7c3aed')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Gear catalog + per-species recommendations + mock pricing.
-- Wipes catalog rows so re-running yields a deterministic state.
-- ---------------------------------------------------------------------------
truncate table public.price_results restart identity cascade;
truncate table public.species_method_gear restart identity cascade;
truncate table public.gear_items restart identity cascade;

do $$
declare
  rec record;
  v_item_id uuid;
  v_group_id uuid;
  v_species_id uuid;
  v_method_id uuid;
  v_mock_retailer_id uuid;
begin
  select id into v_mock_retailer_id from public.retailers where slug = 'mock';
  if v_mock_retailer_id is null then
    raise exception 'Mock retailer must be seeded before gear data';
  end if;

  for rec in
    select * from (values
      -- ===================== Largemouth Bass =====================
      ('largemouth-bass', 'rod',      'Medium-Heavy Spinning Rod 7''',                                'Perfect for jigs, soft plastics, and crankbaits.',          'Best Value', 89.99::numeric),
      ('largemouth-bass', 'rod',      'Medium-Heavy Baitcasting Rod 7''',                             'Ideal for flipping, pitching, and heavy cover fishing.',    'Premium',    129.99::numeric),
      ('largemouth-bass', 'reel',     'Largemouth Spinning Reel 3000-4000',                           'Smooth drag system for bass fishing techniques.',           'Best Value', 79.99::numeric),
      ('largemouth-bass', 'reel',     'Baitcasting Reel 3000-4000',                                   'High-performance reel with precise casting control.',       'Premium',    149.99::numeric),
      ('largemouth-bass', 'line',     'Braided Line 20-30lb + Fluorocarbon Leader 10-12lb',           'High-strength braid with invisible leader for clear water.', 'Best Value', 34.99::numeric),
      ('largemouth-bass', 'line',     'Largemouth Premium Braided Line + Fluorocarbon Leader',        'Top-tier line system for tournament fishing.',              'Premium',    59.99::numeric),
      ('largemouth-bass', 'lures',    'Jigs 3/8-1/2 oz Set',                                          'Flipping, pitching, and swim jigs in various colors.',      'Best Value', 24.99::numeric),
      ('largemouth-bass', 'lures',    'Soft Plastics Variety Pack',                                   'Worms, craws, swimbaits, and creature baits.',              'Best Value', 19.99::numeric),
      ('largemouth-bass', 'lures',    'Crankbaits Shallow Divers',                                    'Craw and shad colored shallow diving crankbaits.',          'Best Value', 16.99::numeric),
      ('largemouth-bass', 'lures',    'Topwater Lures Set',                                           'Frogs, poppers, and walking baits for surface action.',     'Premium',    29.99::numeric),
      ('largemouth-bass', 'terminal', 'Terminal Tackle Kit',                                          'Hooks, weights, and bobbers for finesse and live bait.',    'Best Value', 14.99::numeric),
      ('largemouth-bass', 'terminal', 'Premium Terminal Kit',                                         'High-quality hooks and weights for all techniques.',        'Premium',    24.99::numeric),

      -- ===================== Smallmouth Bass =====================
      ('smallmouth-bass', 'rod',      'Medium Spinning Rod 6''6"-7''',                                'Perfect for tubes, swimbaits, and finesse techniques.',     'Best Value', 79.99::numeric),
      ('smallmouth-bass', 'rod',      'Premium Medium Spinning Rod',                                  'High-sensitivity rod for detecting subtle bites.',          'Premium',    149.99::numeric),
      ('smallmouth-bass', 'reel',     'Spinning Reel 2500-3000',                                      'Lightweight reel perfect for smallmouth techniques.',       'Best Value', 69.99::numeric),
      ('smallmouth-bass', 'reel',     'Smallmouth Premium Spinning Reel',                             'Ultra-smooth drag and precision casting.',                  'Premium',    129.99::numeric),
      ('smallmouth-bass', 'line',     'Braided Line 15-20lb + Fluorocarbon Leader 8-12lb',            'Light braid with fluorocarbon leader for clear water.',     'Best Value', 28.99::numeric),
      ('smallmouth-bass', 'line',     'Smallmouth Premium Braided Line + Fluorocarbon Leader',        'Top-quality line system for finesse fishing.',              'Premium',    49.99::numeric),
      ('smallmouth-bass', 'lures',    'Tubes 3-4" Natural Colors',                                    'Green pumpkin and smoke colored tubes for smallmouth.',     'Best Value', 12.99::numeric),
      ('smallmouth-bass', 'lures',    'Swimbaits 2-4" Shad/Perch',                                    'Realistic swimbaits in shad and perch patterns.',           'Best Value', 18.99::numeric),
      ('smallmouth-bass', 'lures',    'Finesse Jigs 1/8-3/8 oz',                                      'Hair and finesse jigs for smallmouth bass.',                'Best Value', 14.99::numeric),
      ('smallmouth-bass', 'lures',    'Inline Spinners Mepps/Rooster Tail',                           'Size 2-4 spinners for active smallmouth.',                  'Best Value', 9.99::numeric),
      ('smallmouth-bass', 'lures',    'Crankbaits Medium Divers',                                     'Shad and craw colored medium diving crankbaits.',           'Premium',    16.99::numeric),

      -- ===================== Trout =====================
      ('trout', 'rod',   'Trout Ultralight Rod',          'Sensitive 7'' ultralight rod for trout fishing.',  'Best Value',  129.99::numeric),
      ('trout', 'rod',   'Budget Trout Rod',              'Light action rod perfect for trout streams.',      'Value Items', 49.99::numeric),
      ('trout', 'reel',  'Trout Spinning Reel',           'Ultralight reel with smooth drag for trout.',      'Best Value',  89.99::numeric),
      ('trout', 'reel',  'Entry Trout Reel',              'Lightweight reel suitable for trout fishing.',     'Value Items', 34.99::numeric),
      ('trout', 'line',  'Trout Fluorocarbon 4lb',        'Invisible fluorocarbon line for clear trout waters.', 'Best Value',  18.99::numeric),
      ('trout', 'line',  'Trout Mono 6lb',                'Standard monofilament for trout fishing.',         'Value Items', 6.99::numeric),
      ('trout', 'hooks', 'Trout Hook Set',                'Small hooks size 8-14 for trout flies and bait.',  'Best Value',  8.99::numeric),
      ('trout', 'hooks', 'Basic Trout Hooks',             'Standard trout hooks in small sizes.',             'Value Items', 3.99::numeric),
      ('trout', 'bait',  'Trout PowerBait',               'Scented bait specifically designed for trout.',    'Best Value',  5.99::numeric),
      ('trout', 'bait',  'Live Mealworms',                'Natural bait that trout love.',                    'Value Items', 2.99::numeric),
      ('trout', 'flies', 'Trout Fly Set',                 'Assorted dry flies and nymphs for trout.',         'Best Value',  24.99::numeric),
      ('trout', 'flies', 'Basic Trout Flies',             'Essential flies for trout fishing.',               'Value Items', 9.99::numeric),

      -- ===================== Atlantic Salmon =====================
      ('atlantic-salmon', 'rod',      'Medium-Heavy Spinning Rod 7''-7''6"',                          'Perfect length and action for Atlantic salmon fishing.',    'Best Value', 129.99::numeric),
      ('atlantic-salmon', 'rod',      'Premium Medium-Heavy Spinning Rod',                            'High-quality rod with excellent sensitivity and power.',    'Premium',    199.99::numeric),
      ('atlantic-salmon', 'reel',     'Salmon Spinning Reel 3000-4000',                               'Smooth drag system essential for salmon fishing.',          'Best Value', 89.99::numeric),
      ('atlantic-salmon', 'reel',     'Salmon Premium Spinning Reel',                                 'Heavy-duty reel with superior drag performance.',           'Premium',    179.99::numeric),
      ('atlantic-salmon', 'line',     'Braided Line 20-30lb + Fluorocarbon Leader 10-15lb',           'High-strength braid with fluorocarbon leader for salmon.',  'Best Value', 39.99::numeric),
      ('atlantic-salmon', 'line',     'Salmon Premium Braided Line + Fluorocarbon Leader',            'Top-tier line system for Atlantic salmon.',                 'Premium',    69.99::numeric),
      ('atlantic-salmon', 'lures',    'Inline Spinners Size 3-5 Silver/Orange',                       'Classic spinners in silver and orange colors.',             'Best Value', 14.99::numeric),
      ('atlantic-salmon', 'lures',    'Spoons 2-3" Silver/Gold',                                      'Heavy spoons in silver and gold finishes.',                 'Best Value', 12.99::numeric),
      ('atlantic-salmon', 'lures',    'Premium Spinner Set',                                          'High-quality spinners in various sizes and colors.',        'Premium',    24.99::numeric),
      ('atlantic-salmon', 'bait',     'Beads 8-10mm Natural/Bright',                                  'Natural and bright colored beads for drifting.',            'Best Value', 8.99::numeric),
      ('atlantic-salmon', 'bait',     'Spawn Sacs',                                                   'Drifted under float or rig for Atlantic salmon.',           'Best Value', 6.99::numeric),
      ('atlantic-salmon', 'bait',     'Premium Spawn Sacs',                                           'High-quality cured spawn sacs.',                            'Premium',    12.99::numeric),
      ('atlantic-salmon', 'terminal', 'Salmon Terminal Kit',                                          'Hooks, split shot, and floats for drifting setups.',        'Best Value', 16.99::numeric),
      ('atlantic-salmon', 'terminal', 'Premium Salmon Terminal Kit',                                  'High-quality hooks and terminal tackle.',                   'Premium',    29.99::numeric),

      -- ===================== Bluegill =====================
      ('bluegill', 'rod',     'Bluegill Ultralight Rod',     'Light 5''6" rod perfect for bluegill fishing.',  'Best Value', 69.99::numeric),
      ('bluegill', 'rod',     'Budget Bluegill Rod',         'Light action rod for panfish like bluegill.',    'Cheapest',   29.99::numeric),
      ('bluegill', 'reel',    'Bluegill Spinning Reel',      'Ultralight reel with smooth operation.',         'Best Value', 49.99::numeric),
      ('bluegill', 'reel',    'Entry Bluegill Reel',         'Small reel perfect for bluegill fishing.',       'Cheapest',   19.99::numeric),
      ('bluegill', 'line',    'Bluegill Fluorocarbon 2lb',   'Ultra-light line for bluegill fishing.',         'Best Value', 12.99::numeric),
      ('bluegill', 'line',    'Bluegill Mono 4lb',           'Light monofilament for bluegill.',               'Cheapest',   4.99::numeric),
      ('bluegill', 'hooks',   'Bluegill Hook Set',           'Small hooks size 10-16 for bluegill.',           'Best Value', 6.99::numeric),
      ('bluegill', 'hooks',   'Basic Bluegill Hooks',        'Tiny hooks perfect for bluegill.',               'Cheapest',   2.99::numeric),
      ('bluegill', 'bait',    'Bluegill Worms',              'Small worms and grubs for bluegill.',            'Best Value', 3.99::numeric),
      ('bluegill', 'bait',    'Live Crickets',               'Natural bait that bluegill love.',               'Cheapest',   1.99::numeric),
      ('bluegill', 'bobbers', 'Bluegill Bobber Set',         'Small bobbers perfect for bluegill fishing.',    'Best Value', 4.99::numeric),
      ('bluegill', 'bobbers', 'Basic Bluegill Bobbers',      'Simple bobbers for bluegill.',                   'Cheapest',   1.99::numeric),

      -- ===================== Catfish =====================
      ('catfish', 'rod',     'Catfish Heavy Rod',           'Heavy action rod for big catfish.',              'Best Value', 119.99::numeric),
      ('catfish', 'rod',     'Budget Catfish Rod',          'Strong rod for catfish fishing.',                'Cheapest',   49.99::numeric),
      ('catfish', 'reel',    'Catfish Spinning Reel',       'Heavy-duty reel with strong drag.',              'Best Value', 99.99::numeric),
      ('catfish', 'reel',    'Entry Catfish Reel',          'Durable reel for catfish.',                      'Cheapest',   39.99::numeric),
      ('catfish', 'line',    'Catfish Braid 50lb',          'Heavy braided line for big catfish.',            'Best Value', 39.99::numeric),
      ('catfish', 'line',    'Catfish Mono 25lb',           'Strong monofilament for catfish.',               'Cheapest',   14.99::numeric),
      ('catfish', 'hooks',   'Catfish Hook Set',            'Large circle hooks for catfish.',                'Best Value', 14.99::numeric),
      ('catfish', 'hooks',   'Basic Catfish Hooks',         'Heavy hooks for catfish fishing.',               'Cheapest',   6.99::numeric),
      ('catfish', 'bait',    'Catfish Stink Bait',          'Scented bait that catfish can''t resist.',       'Best Value', 7.99::numeric),
      ('catfish', 'bait',    'Live Minnows',                'Natural bait for catfish.',                      'Cheapest',   4.99::numeric),
      ('catfish', 'sinkers', 'Catfish Sinker Set',          'Heavy sinkers for bottom fishing.',              'Best Value', 8.99::numeric),
      ('catfish', 'sinkers', 'Basic Catfish Sinkers',       'Heavy sinkers for catfish.',                     'Cheapest',   3.99::numeric)
    ) as t(species_slug, group_slug, item_name, item_desc, item_tag, item_price)
  loop
    select id into v_species_id from public.species        where slug = rec.species_slug;
    select id into v_group_id   from public.gear_groups    where slug = rec.group_slug;

    if v_species_id is null or v_group_id is null then
      raise exception 'Missing species or gear_group for seed row: % / %', rec.species_slug, rec.group_slug;
    end if;

    insert into public.gear_items (gear_group_id, name, description, tag, base_price_usd)
    values (v_group_id, rec.item_name, rec.item_desc, rec.item_tag, rec.item_price)
    returning id into v_item_id;

    insert into public.price_results (gear_item_id, retailer_id, price_usd, url, title)
    values (
      v_item_id,
      v_mock_retailer_id,
      rec.item_price,
      'https://example.com/mock/' || regexp_replace(lower(rec.item_name), '[^a-z0-9]+', '-', 'g'),
      rec.item_name
    );

    -- Same gear list applies to every method until method-specific data is curated.
    for v_method_id in select id from public.fishing_methods loop
      insert into public.species_method_gear (species_id, method_id, gear_group_id, gear_item_id, rank)
      values (v_species_id, v_method_id, v_group_id, v_item_id, 0);
    end loop;
  end loop;
end $$;
