import { z } from 'npm:zod@3.23.8';
import type { GearRecommendationRequest } from './types.ts';

export const gearRecommendationRequestSchema = z.object({
  species: z.string().trim().min(1, 'species is required'),
  method: z.string().trim().min(1, 'method is required'),
  ownedGroups: z.array(z.string().trim().min(1)).default([]),
  budgetTier: z.enum(['Best Value', 'Premium']).default('Best Value'),
});

export type ValidatedRequest = GearRecommendationRequest;

export interface ValidationFailure {
  ok: false;
  message: string;
  details: unknown;
}

export interface ValidationSuccess {
  ok: true;
  value: ValidatedRequest;
}

export function parseRequest(input: unknown): ValidationSuccess | ValidationFailure {
  const result = gearRecommendationRequestSchema.safeParse(input);
  if (result.success) {
    return { ok: true, value: result.data };
  }
  return {
    ok: false,
    message: 'Invalid request payload',
    details: result.error.flatten(),
  };
}
