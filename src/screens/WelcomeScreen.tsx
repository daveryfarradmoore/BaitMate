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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../../App';
import AuroraBackground from '../components/AuroraBackground';
import { getSupabaseClient } from '../lib/supabase';
import { sendPasswordResetEmail, signInWithEmail, signUpWithEmail } from '../services/auth';

type WelcomeNav = StackNavigationProp<RootStackParamList, 'Welcome'>;

interface Props {
  navigation: WelcomeNav;
}

type AuthMode = 'signin' | 'signup';

const WelcomeScreen = ({ navigation }: Props) => {
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
        // Account created (validated by Supabase). Always continue into the app.
        goToApp();
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
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    if (next === 'signin') setConfirmPassword('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <AuroraBackground />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={'fish' as const} size={72} color="#2563eb" />
          </View>

          <Text style={styles.title}>Welcome to BaitMate</Text>
          <Text style={styles.subtitle}>
            Log in with your email, or create a new account. You can also continue as a guest.
          </Text>

          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeChip, mode === 'signin' && styles.modeChipActive]}
              onPress={() => switchMode('signin')}
              disabled={loading}
            >
              <Text style={[styles.modeChipText, mode === 'signin' && styles.modeChipTextActive]}>
                Log in
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeChip, mode === 'signup' && styles.modeChipActive]}
              onPress={() => switchMode('signup')}
              disabled={loading}
            >
              <Text style={[styles.modeChipText, mode === 'signup' && styles.modeChipTextActive]}>
                Create account
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name={'mail-outline' as const} size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#9ca3af"
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
              <Ionicons name={'lock-closed-outline' as const} size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType={mode === 'signup' ? 'next' : 'go'}
                onSubmitEditing={mode === 'signup' ? undefined : handleSubmit}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                disabled={loading}
              >
                <Ionicons
                  name={showPassword ? ('eye-off-outline' as const) : ('eye-outline' as const)}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>

            {mode === 'signup' ? (
              <View style={styles.inputWrapper}>
                <Ionicons name={'lock-closed-outline' as const} size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  placeholderTextColor="#9ca3af"
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

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>
                    {mode === 'signin' ? 'Log in' : 'Create account'}
                  </Text>
                  <Ionicons name={'arrow-forward' as const} size={20} color="white" />
                </>
              )}
            </TouchableOpacity>

            {mode === 'signin' ? (
              <TouchableOpacity style={styles.forgotButton} onPress={handleForgotPassword} disabled={loading}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.guestButton}
            onPress={() => navigation.navigate('SpeciesSelector')}
            disabled={loading}
          >
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: 360,
    lineHeight: 18,
  },
  modeRow: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 360,
    marginBottom: 18,
  },
  modeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginHorizontal: 4,
  },
  modeChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  modeChipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  modeChipTextActive: {
    color: '#fff',
  },
  formContainer: {
    width: '100%',
    maxWidth: 360,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 14,
    paddingHorizontal: 14,
    height: 52,
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
    backgroundColor: '#2563eb',
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
    color: '#2563eb',
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
    backgroundColor: '#d1d5db',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#9ca3af',
    fontSize: 14,
  },
  guestButton: {
    borderWidth: 1.5,
    borderColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 360,
  },
  guestButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WelcomeScreen;
