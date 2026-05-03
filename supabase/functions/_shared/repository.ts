import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { CatalogGearItem, GearTag } from './types.ts';

export interface SlugLookup {
  speciesId: string;
  methodId: string;
}

export async function findSpeciesAndMethodIds(
  db: SupabaseClient,
  speciesSlug: string,
  methodSlug: string,
): Promise<
  | { ok: true; ids: SlugLookup }
  | { ok: false; missing: 'species' | 'method' }
> {
  const [speciesRes, methodRes] = await Promise.all([
    db.from('species').select('id').eq('slug', speciesSlug).maybeSingle(),
    db.from('fishing_methods').select('id').eq('slug', methodSlug).maybeSingle(),
  ]);

  if (speciesRes.error || !speciesRes.data) {
    return { ok: false, missing: 'species' };
  }
  if (methodRes.error || !methodRes.data) {
    return { ok: false, missing: 'method' };
  }
  return { ok: true, ids: { speciesId: speciesRes.data.id, methodId: methodRes.data.id } };
}

export async function fetchCatalogForSpeciesMethod(
  db: SupabaseClient,
  speciesId: string,
  methodId: string,
  ownedGroupSlugs: string[],
): Promise<CatalogGearItem[]> {
  // Pull the species_method_gear rows joined with the item + group metadata.
  // PostgREST returns nested objects when we use the `()` selector syntax.
  const { data, error } = await db
    .from('species_method_gear')
    .select(
      `
      rank,
      gear_items:gear_item_id (
        id,
        name,
        description,
        tag,
        base_price_usd
      ),
      gear_groups:gear_group_id (
        slug,
        name,
        display_order
      )
    `,
    )
    .eq('species_id', speciesId)
    .eq('method_id', methodId)
    .order('rank', { ascending: true });

  if (error) {
    throw new Error(`fetchCatalog failed: ${error.message}`);
  }

  type Row = {
    rank: number;
    gear_items: {
      id: string;
      name: string;
      description: string;
      tag: GearTag;
      base_price_usd: number | string;
    } | null;
    gear_groups: {
      slug: string;
      name: string;
      display_order: number;
    } | null;
  };

  const owned = new Set(ownedGroupSlugs.map((s) => s.toLowerCase()));
  const out: (CatalogGearItem & { displayOrder: number })[] = [];

  for (const row of (data ?? []) as Row[]) {
    if (!row.gear_items || !row.gear_groups) continue;
    if (owned.has(row.gear_groups.slug.toLowerCase())) continue;

    out.push({
      id: row.gear_items.id,
      name: row.gear_items.name,
      description: row.gear_items.description,
      tag: row.gear_items.tag,
      basePriceUSD: Number(row.gear_items.base_price_usd),
      groupSlug: row.gear_groups.slug,
      groupName: row.gear_groups.name,
      displayOrder: row.gear_groups.display_order,
    });
  }

  // Stable ordering: by group display_order, then rank-equivalent (insertion).
  out.sort((a, b) => a.displayOrder - b.displayOrder);
  return out.map(({ displayOrder: _omit, ...rest }) => rest);
}
