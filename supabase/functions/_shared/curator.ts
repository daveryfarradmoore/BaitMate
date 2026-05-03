import { z } from 'npm:zod@3.23.8';
import { log } from './logger.ts';
import type { CatalogGearItem } from './types.ts';

/**
 * Optional LLM curator (Milestone 4).
 *
 * Given the DB-resolved catalog for a species + method, asks an LLM for:
 *   - a one-line rationale per gear item
 *   - a refined search query per gear group (for use by Amazon/Walmart)
 *
 * Behavior contract:
 *   - Strict JSON output, validated with Zod.
 *   - On any failure (timeout, parse error, API error), returns `null`. The
 *     Edge Function then renders the raw DB result so the app never breaks.
 *   - Behind `LLM_CURATOR=on`, default `off`.
 */
export interface CuratorOutput {
  rationales: Record<string, string>;
  searchHints: Record<string, string>;
}

const curatorSchema = z.object({
  rationales: z.record(z.string(), z.string()),
  searchHints: z.record(z.string(), z.string()),
});

export interface CuratorInput {
  species: string;
  method: string;
  budgetTier: string;
  items: CatalogGearItem[];
}

export function isCuratorEnabled(env: Record<string, string | undefined>): boolean {
  return (env.LLM_CURATOR ?? 'off').toLowerCase() === 'on'
    && Boolean(env.OPENAI_API_KEY);
}

export async function runCurator(
  env: Record<string, string | undefined>,
  input: CuratorInput,
  requestId: string,
): Promise<CuratorOutput | null> {
  if (!isCuratorEnabled(env)) return null;

  const apiKey = env.OPENAI_API_KEY!;
  const model = env.LLM_MODEL ?? 'gpt-4o-mini';
  const groups = Array.from(new Set(input.items.map((i) => i.groupSlug)));

  const userMsg = JSON.stringify({
    species: input.species,
    method: input.method,
    budgetTier: input.budgetTier,
    items: input.items.map((i) => ({
      id: i.id,
      group: i.groupSlug,
      name: i.name,
      description: i.description,
      tag: i.tag,
    })),
    groups,
  });

  const systemMsg =
    'You are a fishing gear assistant. Reply with strict JSON shaped exactly as `{"rationales":{<gear_item_id>: <one-line rationale>}, "searchHints":{<group_slug>: <best amazon/walmart search query>}}`. Do not include any other keys or prose.';

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemMsg },
          { role: 'user', content: userMsg },
        ],
      }),
    });

    if (!res.ok) {
      log('warn', {
        requestId,
        message: 'curator_http_failed',
        details: `${res.status} ${res.statusText}`,
      });
      return null;
    }

    const json = await res.json();
    const content: string | undefined = json?.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = curatorSchema.safeParse(JSON.parse(content));
    if (!parsed.success) {
      log('warn', {
        requestId,
        message: 'curator_parse_failed',
        details: parsed.error.flatten(),
      });
      return null;
    }
    return parsed.data;
  } catch (e) {
    log('warn', {
      requestId,
      message: 'curator_exception',
      details: (e as Error).message,
    });
    return null;
  }
}
