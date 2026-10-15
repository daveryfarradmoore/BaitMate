import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Keyboard,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../../App';
import AuroraBackground from '../components/AuroraBackground';
import { getSupabaseClient } from '../lib/supabase';
import { sendPasswordResetEmail, signInWithEmail, signUpWithEmail } from '../services/auth';
import { colors, shadows } from '../theme';

type WelcomeNav = StackNavigationProp<RootStackParamList, 'Welcome'>;

interface Props {
  navigation: WelcomeNav;
}

type AuthMode = 'signin' | 'signup';

const WelcomeScreen = ({ navigation }: Props) => {
  const { width } = useWindowDimensions();
  const isWide = width >= 840;
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validateForm = (): string | null => {
    if (!email.trim()) return 'Please enter your email address.';
    if (!isValidEmail(email.trim())) return 'Please enter a valid email address.';
    if (!password) return 'Please enter your password.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (mode === 'signup' && password !== confirmPassword) {
      return 'Passwords do not match.';
    }
    return null;
  };

  const goToApp = () => {
    Keyboard.dismiss();
    navigation.navigate('SpeciesSelector');
  };

  const handleSubmit = async () => {
    if (loading) return;

    const err = validateForm();
    if (err) {
      Alert.alert('Check your details', err);
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      Alert.alert(
        'Sign-in unavailable',
        'Account sign-in is not available on this device right now. You can still continue as a guest.',
      );
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        const result = await signInWithEmail(supabase, email, password);
        if (!result.ok) {
          Alert.alert('Log in failed', result.message);
          return;
        }
        goToApp();
      } else {
        const result = await signUpWithEmail(supabase, email, password);
        if (!result.ok) {
          if (result.duplicateEmail) {
            Alert.alert(
              'Email already in use',
              'An account with this email already exists. Try logging in instead.',
            );
            return;
          }
          Alert.alert('Could not create account', result.message);
          return;
        }
        if (result.hasSession) {
          goToApp();
        } else {
          Alert.alert(
            'Confirm your email',
            'We sent you a confirmation link. You can keep browsing as a guest, then log in after confirming your email.',
            [{ text: 'Continue', onPress: goToApp }],
          );
        }
      }
    } catch (e) {
      Alert.alert('Something went wrong', (e as Error).message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim() || !isValidEmail(email.trim())) {
      Alert.alert('Email required', 'Enter the email for your account, then tap Forgot password again.');
      return;
    }
    const supabase = getSupabaseClient();
    if (!supabase) {
      Alert.alert('Unavailable', 'Password reset is not available right now. Please try again later.');
      return;
    }
    setLoading(true);
    try {
      const result = await sendPasswordResetEmail(supabase, email);
      if (!result.ok) {
        Alert.alert('Reset failed', result.message);
        return;
      }
      Alert.alert('Check your email', result.message);
    } catch (e) {
      Alert.alert(
        'Reset failed',
        e instanceof Error ? e.message : 'Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    if (next === 'signin') setConfirmPassword('');
  };

  const authForm = (
    <View style={styles.authCard}>
      <Text style={styles.cardEyebrow}>SAVE YOUR SETUPS</Text>
      <Text style={styles.cardTitle}>{mode === 'signin' ? 'Welcome back' : 'Create your angler profile'}</Text>
      <Text style={styles.cardDescription}>
        {mode === 'signin' ? 'Log in to continue where you left off.' : 'Keep your gear plans ready for the next trip.'}
      </Text>

      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeChip, mode === 'signin' && styles.modeChipActive]}
          onPress={() => switchMode('signin')}
          disabled={loading}
        >
          <Text style={[styles.modeChipText, mode === 'signin' && styles.modeChipTextActive]}>Log in</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeChip, mode === 'signup' && styles.modeChipActive]}
          onPress={() => switchMode('signup')}
          disabled={loading}
        >
          <Text style={[styles.modeChipText, mode === 'signup' && styles.modeChipTextActive]}>Sign up</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputWrapper}>
        <Ionicons name="mail-outline" size={20} color={colors.inkMuted} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor="#91A3A1"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          editable={!loading}
        />
      </View>

      <View style={styles.inputWrapper}>
        <Ionicons name="lock-closed-outline" size={20} color={colors.inkMuted} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#91A3A1"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          returnKeyType={mode === 'signup' ? 'next' : 'go'}
          onSubmitEditing={mode === 'signup' ? undefined : handleSubmit}
          editable={!loading}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton} disabled={loading}>
          <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.inkMuted} />
        </TouchableOpacity>
      </View>

      {mode === 'signup' ? (
        <View style={styles.inputWrapper}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.inkMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor="#91A3A1"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            returnKeyType="go"
            onSubmitEditing={handleSubmit}
            editable={!loading}
          />
        </View>
      ) : null}

      <TouchableOpacity style={[styles.primaryButton, loading && styles.disabledButton]} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : (
          <>
            <Text style={styles.primaryButtonText}>{mode === 'signin' ? 'Log in' : 'Create account'}</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </>
        )}
      </TouchableOpacity>

      {mode === 'signin' ? (
        <TouchableOpacity style={styles.forgotButton} onPress={handleForgotPassword} disabled={loading}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>
      ) : null}

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or skip the account</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity style={styles.guestButton} onPress={goToApp} disabled={loading}>
        <Text style={styles.guestButtonText}>Build a gear plan as guest</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AuroraBackground />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, isWide && styles.scrollContentWide]}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.layout, isWide && styles.layoutWide]}>
            <View style={[styles.hero, isWide && styles.heroWide]}>
              <View style={styles.brandRow}>
                <View style={styles.brandIcon}><Ionicons name="fish" size={28} color="#fff" /></View>
                <Text style={styles.brandName}>BaitMate</Text>
              </View>
              <Text style={styles.heroEyebrow}>FISH SMARTER. PACK LIGHTER.</Text>
              <Text style={styles.title}>Your next fishing setup, sorted.</Text>
              <Text style={styles.subtitle}>
                Tell us what you’re targeting and what you already own. We’ll build a practical gear plan in minutes.
              </Text>
              <View style={styles.benefitList}>
                {[
                  ['navigate-circle-outline', 'Choose your target species'],
                  ['checkbox-outline', 'Skip the gear you already own'],
                  ['pricetag-outline', 'Compare a clear, estimated total'],
                ].map(([icon, label]) => (
                  <View key={label} style={styles.benefitRow}>
                    <View style={styles.benefitIcon}><Ionicons name={icon as any} size={18} color={colors.brand} /></View>
                    <Text style={styles.benefitText}>{label}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={styles.mapButton}
                onPress={() => navigation.navigate('FishingMap')}
              >
                <View style={styles.mapButtonIcon}>
                  <Ionicons name="map" size={20} color={colors.brand} />
                </View>
                <View style={styles.mapButtonCopy}>
                  <Text style={styles.mapButtonEyebrow}>NEW · MICHIGAN</Text>
                  <Text style={styles.mapButtonTitle}>Explore the fishing map</Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color={colors.brand} />
              </TouchableOpacity>
            </View>
            {authForm}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 44,
  },
  scrollContentWide: {
    paddingHorizontal: 56,
  },
  layout: {
    width: '100%',
    maxWidth: 1080,
    alignSelf: 'center',
  },
  layoutWide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hero: {
    marginBottom: 32,
  },
  heroWide: {
    flex: 1,
    marginRight: 64,
    marginBottom: 0,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 48,
  },
  brandIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  brandName: {
    fontSize: 23,
    fontWeight: '800',
    color: colors.ink,
  },
  heroEyebrow: {
    fontSize: 12,
    letterSpacing: 1.8,
    fontWeight: '800',
    color: colors.brand,
    marginBottom: 14,
  },
  title: {
    fontSize: 44,
    lineHeight: 50,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 18,
    maxWidth: 560,
  },
  subtitle: {
    fontSize: 17,
    color: colors.inkMuted,
    lineHeight: 26,
    maxWidth: 540,
  },
  benefitList: {
    marginTop: 30,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },
  benefitIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  benefitText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
  },
  mapButton: {
    maxWidth: 420,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    padding: 13,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  mapButtonIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapButtonCopy: {
    flex: 1,
    marginHorizontal: 11,
  },
  mapButtonEyebrow: {
    fontSize: 9,
    letterSpacing: 1.1,
    fontWeight: '800',
    color: colors.brand,
  },
  mapButtonTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 3,
  },
  authCard: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 28,
    ...shadows.card,
  },
  cardEyebrow: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '800',
    color: colors.brand,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
    marginBottom: 20,
  },
  modeRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 18,
  },
  modeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 4,
  },
  modeChipActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  modeChipText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.inkMuted,
  },
  modeChipTextActive: {
    color: '#fff',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    paddingHorizontal: 14,
    height: 54,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    height: '100%',
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  primaryButton: {
    backgroundColor: colors.brand,
    paddingVertical: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    minHeight: 52,
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  forgotButton: {
    alignSelf: 'center',
    marginTop: 14,
  },
  forgotText: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '500',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#9ca3af',
    fontSize: 14,
  },
  guestButton: {
    borderWidth: 1.5,
    borderColor: colors.brand,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 360,
  },
  guestButtonText: {
    color: colors.brand,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WelcomeScreen;
