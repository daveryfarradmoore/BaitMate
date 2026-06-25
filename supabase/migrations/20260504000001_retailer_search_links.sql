-- Retailer search links: extend retailers, nullable live prices, URL helpers.

-- ---------------------------------------------------------------------------
-- Retailers: add Bass Pro and Cabela's
-- ---------------------------------------------------------------------------
alter table public.retailers drop constraint if exists retailers_slug_check;

alter table public.retailers add constraint retailers_slug_check
  check (slug in ('mock', 'amazon', 'walmart', 'basspro', 'cabelas'));

insert into public.retailers (slug, display_name) values
  ('basspro', 'Bass Pro Shops'),
  ('cabelas', 'Cabela''s')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- price_results: nullable live price + stock; unique per item + retailer
-- ---------------------------------------------------------------------------
alter table public.price_results alter column price_usd drop not null;

alter table public.price_results
  add column if not exists in_stock boolean;

alter table public.price_results alter column fetched_at drop not null;
alter table public.price_results alter column fetched_at drop default;

create unique index if not exists price_results_item_retailer_unique
  on public.price_results (gear_item_id, retailer_id);

-- ---------------------------------------------------------------------------
-- Search keyword + URL builders (used by seed and can be called from SQL)
-- ---------------------------------------------------------------------------
create or replace function public.build_retailer_search_keywords(
  p_item_name text,
  p_group_slug text
) returns text
language plpgsql
immutable
as $$
declare
  q text;
  suffix text;
begin
  q := lower(trim(replace(replace(p_item_name, '''', ' foot '), '"', ' inch ')));
  q := regexp_replace(q, '\s+', ' ', 'g');

  suffix := case lower(p_group_slug)
    when 'rod' then 'fishing rod'
    when 'reel' then 'fishing reel'
    when 'line' then 'fishing line'
    when 'hooks' then 'fishing hooks'
    when 'bait' then 'fishing bait'
    when 'lures' then 'fishing lures'
    when 'flies' then 'fishing flies'
    when 'bobbers' then 'fishing bobbers'
    when 'sinkers' then 'fishing sinkers'
    when 'terminal' then 'fishing terminal tackle'
    else 'fishing'
  end;

  if q like '%fishing%' then
    return trim(q);
  end if;

  return trim(q || ' ' || suffix);
end;
$$;

create or replace function public.build_retailer_search_url(
  p_retailer_slug text,
  p_item_name text,
  p_group_slug text
) returns text
language plpgsql
immutable
as $$
declare
  enc text;
begin
  enc := replace(public.build_retailer_search_keywords(p_item_name, p_group_slug), ' ', '+');

  return case p_retailer_slug
    when 'amazon' then 'https://www.amazon.com/s?k=' || enc
    when 'walmart' then 'https://www.walmart.com/search?q=' || enc
    when 'basspro' then 'https://www.basspro.com/shop/en/search#searchTerm=' || enc
    when 'cabelas' then 'https://www.cabelas.com/search?q=' || enc
    else raise exception 'Unknown retailer slug: %', p_retailer_slug
  end;
end;
$$;
