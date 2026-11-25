import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ErrorText, PrimaryButton, TextField } from '@/components/form';
import { FormScreen } from '@/components/form-screen';
import { Colors } from '@/constants/colors';
import { authClient } from '@/lib/auth-client';
import { isValidEmail } from '@/lib/services-api';

const RESEND_SECONDS = 30;

// Sign in with a 6-digit code the website emails to the user. Works for every account,
// including ones created with Google (which have no password), and needs no browser
// redirect, so it also works in Expo Go.
export default function EmailCodeScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const sendCode = async () => {
    if (!isValidEmail(email)) return setError('Please enter a valid email address.');
    setError('');
    setLoading(true);
    const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
      email: email.trim(),
      type: 'sign-in',
    });
    setLoading(false);
    if (sendError) return setError(sendError.message || 'Could not send the code. Please try again.');
    setCode('');
    setStep('code');
    setCooldown(RESEND_SECONDS);
  };

  const verify = async () => {
    if (code.trim().length < 6) return setError('Please enter the 6-digit code from your email.');
    setError('');
    setLoading(true);
    const { error: verifyError } = await authClient.signIn.emailOtp({
      email: email.trim(),
      otp: code.trim(),
    });
    if (verifyError) {
      setLoading(false);
      return setError(verifyError.message || 'Invalid or expired code.');
    }
    const { data } = await authClient.getSession();
    setLoading(false);
    if (!data) return setError('Signed in, but the session could not be saved. Please try again.');
    router.replace('/home');
  };

  return (
    <FormScreen title="Login with Email Code">
      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons name={step === 'code' ? 'mail-open' : 'mail'} size={34} color={Colors.navy} />
        </View>
        <Text style={styles.title}>{step === 'code' ? 'Enter your code' : 'Get a login code'}</Text>
        <Text style={styles.subtitle}>
          {step === 'code'
            ? `We've sent a 6-digit code to ${email.trim()}. Check your inbox (and spam folder).`
            : "Enter your email and we'll send you a 6-digit code. No password needed — works for Google accounts too."}
        </Text>
      </View>

      {step === 'email' ? (
        <>
          <TextField
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <ErrorText>{error}</ErrorText>
          <PrimaryButton title="Send Code" onPress={sendCode} loading={loading} />
        </>
      ) : (
        <>
          <TextField
            label="6-digit Code"
            value={code}
            onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            maxLength={6}
          />
          <ErrorText>{error}</ErrorText>
          <PrimaryButton title="Login" onPress={verify} loading={loading} />
          <View style={styles.links}>
            <Pressable onPress={sendCode} disabled={cooldown > 0 || loading}>
              <Text style={[styles.link, cooldown > 0 && styles.linkDisabled]}>
                {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
              </Text>
            </Pressable>
            <Pressable onPress={() => { setStep('email'); setError(''); }}>
              <Text style={styles.link}>Change email</Text>
            </Pressable>
          </View>
        </>
      )}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    gap: 8,
    marginVertical: 16,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.muted,
    textAlign: 'center',
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  link: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.red,
  },
  linkDisabled: {
    color: Colors.muted,
  },
});
