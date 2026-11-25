import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GoogleButton } from '@/components/google-button';
import { Logo } from '@/components/logo';
import { Colors } from '@/constants/colors';
import { authClient } from '@/lib/auth-client';

// Error codes the website appends when Google sign-in fails (bookfxorderapp://login?error=...).
const GOOGLE_ERRORS: Record<string, string> = {
  state_mismatch: 'Google sign-in expired. Please try again.',
  invalid_code: 'Google sign-in could not be completed. Please try again.',
  access_denied: 'Google sign-in was cancelled.',
  account_not_linked: 'This email is already registered. Please log in with your email and password.',
  'account not linked': 'This email is already registered. Please log in with your email and password.',
  email_not_found: 'Your Google account did not share an email address.',
  signup_disabled: 'New sign-ups with Google are currently disabled.',
};

function googleErrorMessage(code: string) {
  return GOOGLE_ERRORS[code] ?? `Google sign-in failed (${code.replace(/_/g, ' ')}). Please try again.`;
}

export default function LoginScreen() {
  const { error: googleError } = useLocalSearchParams<{ error?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socialError, setSocialError] = useState(() =>
    googleError ? googleErrorMessage(googleError) : '',
  );
  // The deep link can land on an already-mounted login screen, so react to new error params too.
  const [lastGoogleError, setLastGoogleError] = useState(googleError);
  if (googleError !== lastGoogleError) {
    setLastGoogleError(googleError);
    if (googleError) setSocialError(googleErrorMessage(googleError));
  }

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    const { error: signInError } = await authClient.signIn.email({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message || 'Login failed. Please try again.');
      return;
    }
    router.replace('/home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}>
          <View style={styles.header}>
            <Logo width={240} />
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Sign in to manage your services</Text>
          </View>

          <View style={styles.inputRow}>
            <Ionicons name="person" size={18} color={Colors.navy} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor={Colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputRow}>
            <Ionicons name="lock-closed" size={18} color={Colors.navy} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.muted}
              secureTextEntry={!showPassword}
              autoComplete="password"
              value={password}
              onChangeText={setPassword}
            />
            <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={10}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={Colors.muted} />
            </Pressable>
          </View>

          <Pressable style={styles.forgot} onPress={() => router.push('/forgot-password')}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </Pressable>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {error ? (
            <Pressable onPress={() => router.push({ pathname: '/email-code', params: { email: email.trim() } })}>
              <Text style={styles.codeHint}>
                Signed up with Google or forgot your password? <Text style={styles.codeLink}>Get a login code by email</Text>
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            style={({ pressed }) => [styles.primaryButton, (pressed || loading) && styles.pressed]}
            onPress={handleLogin}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>Login</Text>
            )}
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.divider} />
          </View>

          <GoogleButton onError={setSocialError} />
          <Pressable
            style={styles.codeButton}
            onPress={() => router.push({ pathname: '/email-code', params: { email: email.trim() } })}>
            <Ionicons name="mail" size={20} color={Colors.navy} />
            <Text style={styles.codeButtonText}>Login with Email Code</Text>
          </Pressable>
          {socialError ? <Text style={styles.errorText}>{socialError}</Text> : null}

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don&apos;t have an account? </Text>
            <Pressable onPress={() => router.push('/register')}>
              <Text style={styles.registerLink}>Register</Text>
            </Pressable>
          </View>
        </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  codeHint: {
    fontSize: 13,
    color: Colors.muted,
    textAlign: 'center',
    marginBottom: 12,
  },
  codeLink: {
    color: Colors.red,
    fontWeight: '700',
  },
  codeButton: {
    flexDirection: 'row',
    gap: 10,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.input,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  codeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  flex: { flex: 1 },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 14,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginTop: 24,
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: Colors.muted,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.input,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  forgot: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    color: Colors.red,
    fontWeight: '600',
    fontSize: 13,
  },
  primaryButton: {
    backgroundColor: Colors.red,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
  errorText: {
    color: Colors.red,
    fontSize: 13,
    textAlign: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 12,
    color: Colors.muted,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  registerText: {
    color: Colors.text,
    fontSize: 14,
  },
  registerLink: {
    color: Colors.red,
    fontWeight: '700',
    fontSize: 14,
  },
});
