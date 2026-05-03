import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import type {
  GearRecommendationRequest,
  GearRecommendationResponse,
  RecommendationErrorBody,
} from '../types/recommendations';
import { buildLocalRecommendation } from './recommendations.local';

/**
 * Single entry point used by the UI. Calls the Supabase Edge Function when
 * configured; otherwise resolves against the in-memory mock so the demo still
 * works without a backend.
 *
 * Throws `RecommendationServiceError` on any backend error - callers should
 * surface a friendly message + retry button.
 */
export class RecommendationServiceError extends Error {
  constructor(
    public readonly body: RecommendationErrorBody,
    public readonly status?: number,
  ) {
    super(body.message);
    this.name = 'RecommendationServiceError';
  }
}

const FUNCTION_NAME = 'getGearRecommendations';

export async function fetchGearRecommendations(
  req: GearRecommendationRequest,
): Promise<GearRecommendationResponse> {
  // Offline / un-configured demo mode.
  if (!isSupabaseConfigured) {
    return buildLocalRecommendation(req);
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return buildLocalRecommendation(req);
  }

  const { data, error } = await supabase.functions.invoke<GearRecommendationResponse>(
    FUNCTION_NAME,
    { body: req },
  );

  if (error) {
    const status = (error as { status?: number }).status;
    const ctx = (error as { context?: { body?: unknown } }).context;
    const body = (ctx?.body ?? null) as RecommendationErrorBody | null;
    if (body && typeof body === 'object' && 'code' in body) {
      throw new RecommendationServiceError(body, status);
    }
    throw new RecommendationServiceError(
      {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Unknown error from recommendation service',
      },
      status,
    );
  }

  if (!data) {
    throw new RecommendationServiceError({
      code: 'INTERNAL_ERROR',
      message: 'Empty response from recommendation service',
    });
  }
  return data;
}
