/**
 * Account summary for authenticated users, with a login entry point for guests.
 * Reads identity from Supabase; it does not load saved gear plans or passwords.
 * App.tsx observes sign-out and resets navigation back to the welcome screen.
 */
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { getSupabaseClient } from '../lib/supabase';
import { colors } from '../theme';
import type { StackNavigationProp } from '../../App';

export default function AccountScreen({ navigation }: { navigation: StackNavigationProp }) {
  const [email, setEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  React.useEffect(() => {
    // Ignore a late response if the user leaves this screen before it resolves.
    let active = true;
    getSupabaseClient()?.auth.getUser().then(({ data }) => { if (active) setEmail(data.user?.email ?? null); }).catch(() => { if (active) setError('Unable to load your account. Try again.'); });
    return () => { active = false; };
  }, []);
  const logout = async () => {
    setBusy(true); setError('');
    try {
      // End this device's session without logging out every other device.
      const result = await getSupabaseClient()?.auth.signOut({ scope: 'local' });
      if (result?.error) throw result.error;
    } catch { setError('Could not sign out. Please try again.'); }
    finally { setBusy(false); }
  };
  return <ScrollView contentContainerStyle={{ padding: 28, gap: 20 }}>
    <Text style={{ fontSize: 28, fontWeight: '800', color: colors.ink }}>{email ? 'Your angler account' : 'Fishing as a guest'}</Text>
    <Text style={{ color: colors.inkMuted }}>{email ?? 'Log in or create an account to use your BaitMate identity across devices.'}</Text>
    {error ? <Text accessibilityRole="alert" style={{ color: '#9F341B' }}>{error}</Text> : null}
    <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={email ? logout : () => navigation.navigate('Welcome')} style={{ backgroundColor: colors.brand, padding: 18, borderRadius: 14 }}><Text style={{ color: 'white', fontWeight: '700' }}>{busy ? 'Signing out…' : email ? 'Sign out of this device' : 'Log in / Create account'}</Text></TouchableOpacity>
  </ScrollView>;
}
