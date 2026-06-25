import type { AuthError, SupabaseClient } from '@supabase/supabase-js';

export type SignInResult =
  | { ok: true }
  | { ok: false; message: string };

export type SignUpResult =
  | { ok: true; hasSession: boolean }
  | { ok: false; message: string; duplicateEmail?: boolean };

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Turn Supabase / GoTrue errors into short, actionable copy for alerts. */
function mapAuthError(error: AuthError): string {
  const code = error.code ?? '';
  const msg = (error.message ?? '').toLowerCase();

  if (
    code === 'invalid_credentials' ||
    msg.includes('invalid login') ||
    msg.includes('invalid email or password')
  ) {
    return 'That email or password is incorrect. Check for typos, or reset your password below.';
  }
  if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
    return 'Confirm your email first. Open the link we sent you, then try logging in again.';
  }
  if (msg.includes('too many requests') || code === 'over_request_rate_limit') {
    return 'Too many attempts. Wait a minute and try again.';
  }
  return error.message || 'Something went wrong. Please try again.';
}

export async function signInWithEmail(
  client: SupabaseClient,
  email: string,
  password: string,
): Promise<SignInResult> {
  const normalized = normalizeEmail(email);
  const { data, error } = await client.auth.signInWithPassword({
    email: normalized,
    password,
  });

  if (error) {
    return { ok: false, message: mapAuthError(error) };
  }

  // Rare but possible when email confirmation is required or the project blocks sessions.
  if (!data.session) {
    return {
      ok: false,
      message:
        'We could not open a session for this account. If you just signed up, confirm your email from the inbox link first, then log in again.',
    };
  }

  return { ok: true };
}

export async function signUpWithEmail(
  client: SupabaseClient,
  email: string,
  password: string,
): Promise<SignUpResult> {
  const normalized = normalizeEmail(email);
  const { data, error } = await client.auth.signUp({
    email: normalized,
    password,
  });
  if (error) {
    const msg = error.message.toLowerCase();
    const duplicateEmail =
      msg.includes('already registered') ||
      msg.includes('already been registered') ||
      msg.includes('user already exists');
    return { ok: false, message: mapAuthError(error), duplicateEmail };
  }
  return { ok: true, hasSession: Boolean(data.session) };
}

export async function sendPasswordResetEmail(
  client: SupabaseClient,
  email: string,
): Promise<{ ok: boolean; message: string }> {
  const { error } = await client.auth.resetPasswordForEmail(normalizeEmail(email));
  if (error) return { ok: false, message: mapAuthError(error) };
  return {
    ok: true,
    message: 'If an account exists for that address, you will receive reset instructions.',
  };
}
