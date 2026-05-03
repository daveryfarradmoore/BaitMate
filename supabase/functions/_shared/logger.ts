/**
 * Tiny structured logger. Emits one JSON line per event so logs stay greppable
 * in Supabase's log viewer and easily ingested by external tooling.
 */
export interface LogFields {
  requestId?: string;
  species?: string;
  method?: string;
  providerSelected?: string;
  cacheHit?: boolean;
  durationMs?: number;
  errorCode?: string;
  message?: string;
  // Allow ad-hoc fields without losing type safety on the standard ones.
  [key: string]: unknown;
}

export type LogLevel = 'info' | 'warn' | 'error';

export function log(level: LogLevel, fields: LogFields): void {
  const payload = {
    level,
    ts: new Date().toISOString(),
    ...fields,
  };
  const line = JSON.stringify(payload);
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export function newRequestId(): string {
  // crypto.randomUUID is available in Deno's globalThis.
  return (globalThis as unknown as { crypto: Crypto }).crypto.randomUUID();
}
