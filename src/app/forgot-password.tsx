import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ErrorText, PrimaryButton, TextField } from '@/components/form';
import { FormScreen } from '@/components/form-screen';
import { Colors } from '@/constants/colors';
import { authClient } from '@/lib/auth-client';
import { isValidEmail } from '@/lib/services-api';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const send = async () => {
    if (!isValidEmail(email)) return setError('Please enter a valid email address.');
    setError('');
    setLoading(true);
    // Same request as the website: the server emails a link to set a new password.
    const { error: resetError } = await authClient.requestPasswordReset({
      email: email.trim(),
      redirectTo: '/reset-password',
    });
    setLoading(false);
    if (resetError) return setError(resetError.message || 'Could not send reset link. Please try again.');
    setSent(true);
  };

  return (
    <FormScreen title="Forgot Password">
      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons name={sent ? 'mail-open' : 'lock-closed'} size={34} color={Colors.navy} />
        </View>
        <Text style={styles.title}>{sent ? 'Check your email' : 'Reset your password'}</Text>
        <Text style={styles.subtitle}>
          {sent
            ? `If an account exists for ${email.trim()}, we've sent a link to set a new password. Then log in here with it.`
            : "Enter the email you signed up with and we'll send you a reset link."}
        </Text>
      </View>

      {sent ? (
        <PrimaryButton title="Back to Login" onPress={() => router.replace('/login')} />
      ) : (
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
          <PrimaryButton title="Send Reset Link" onPress={send} loading={loading} />
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
});
