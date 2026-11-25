import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { ErrorText, PrimaryButton } from '@/components/form';
import { FormScreen } from '@/components/form-screen';
import { Colors } from '@/constants/colors';
import { authClient, listSignInProviders, useSession } from '@/lib/auth-client';

const MIN_LENGTH = 8;

function PasswordField({
  label,
  value,
  onChangeText,
  autoComplete,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  autoComplete: 'current-password' | 'new-password';
}) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <Ionicons name="lock-closed-outline" size={18} color={Colors.muted} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoComplete={autoComplete}
          placeholder="••••••••"
          placeholderTextColor={Colors.muted}
        />
        <Pressable onPress={() => setVisible((v) => !v)} hitSlop={10} accessibilityLabel="Show password">
          <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.muted} />
        </Pressable>
      </View>
    </View>
  );
}

export default function ChangePasswordScreen() {
  const { data: session } = useSession();
  // null while loading; false for accounts created with Google or an email code (no password).
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [logoutOthers, setLogoutOthers] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    listSignInProviders()
      .then((providers) => setHasPassword(providers.includes('credential')))
      .catch(() => setHasPassword(true));
  }, []);

  const change = async () => {
    if (!current) return setError('Please enter your current password.');
    if (next.length < MIN_LENGTH) return setError(`New password must be at least ${MIN_LENGTH} characters.`);
    if (next !== confirm) return setError('New passwords do not match.');
    if (next === current) return setError('New password must be different from the current one.');
    setError('');
    setLoading(true);
    const { error: changeError } = await authClient.changePassword({
      currentPassword: current,
      newPassword: next,
      revokeOtherSessions: logoutOthers,
    });
    setLoading(false);
    if (changeError) return setError(changeError.message || 'Could not change your password.');
    setDone(true);
  };

  // Accounts without a password get one through the website's reset-password email.
  const sendSetPasswordEmail = async () => {
    if (!session?.user.email) return;
    setError('');
    setLoading(true);
    const { error: resetError } = await authClient.requestPasswordReset({
      email: session.user.email,
      redirectTo: '/reset-password',
    });
    setLoading(false);
    if (resetError) return setError(resetError.message || 'Could not send the email. Please try again.');
    setResetSent(true);
  };

  if (done || resetSent) {
    return (
      <FormScreen title="Change Password">
        <View style={styles.result}>
          <View style={styles.resultIcon}>
            <Ionicons name={done ? 'shield-checkmark' : 'mail-open'} size={36} color={Colors.green} />
          </View>
          <Text style={styles.resultTitle}>{done ? 'Password changed' : 'Check your email'}</Text>
          <Text style={styles.resultText}>
            {done
              ? logoutOthers
                ? 'Your password is updated and other devices have been logged out.'
                : 'Your password is updated.'
              : `We've sent a link to ${session?.user.email}. Open it to set your password, then you can log in with email and password too.`}
          </Text>
        </View>
        <PrimaryButton title="Back to Profile" onPress={() => router.back()} />
      </FormScreen>
    );
  }

  return (
    <FormScreen title="Change Password">
      <View style={styles.banner}>
        <Ionicons name="shield-checkmark-outline" size={22} color={Colors.navy} />
        <Text style={styles.bannerText}>
          Use at least {MIN_LENGTH} characters. A mix of letters, numbers and symbols is strongest.
        </Text>
      </View>

      {hasPassword === false ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No password yet</Text>
          <Text style={styles.resultText}>
            You signed up with Google or an email code, so your account has no password. We can email you a
            link to set one.
          </Text>
          <ErrorText>{error}</ErrorText>
          <PrimaryButton title="Set a password by email" onPress={sendSetPasswordEmail} loading={loading} />
        </View>
      ) : (
        <View style={styles.card}>
          <PasswordField label="Current Password" value={current} onChangeText={setCurrent} autoComplete="current-password" />
          <PasswordField label="New Password" value={next} onChangeText={setNext} autoComplete="new-password" />
          <PasswordField label="Confirm New Password" value={confirm} onChangeText={setConfirm} autoComplete="new-password" />

          <View style={styles.switchRow}>
            <View style={styles.flex}>
              <Text style={styles.switchLabel}>Log out other devices</Text>
              <Text style={styles.switchHint}>Recommended if you think someone else knows your password</Text>
            </View>
            <Switch
              value={logoutOthers}
              onValueChange={setLogoutOthers}
              trackColor={{ true: Colors.red, false: Colors.border }}
              thumbColor={Colors.white}
            />
          </View>

          <ErrorText>{error}</ErrorText>
          <PrimaryButton title="Update Password" onPress={change} loading={loading} />
          <Pressable onPress={() => router.push('/forgot-password')}>
            <Text style={styles.link}>Forgot your current password?</Text>
          </Pressable>
        </View>
      )}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.iconBg,
    borderRadius: 14,
    padding: 14,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.navy,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  switchHint: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 2,
  },
  link: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: Colors.red,
  },
  result: {
    alignItems: 'center',
    gap: 10,
    marginVertical: 24,
  },
  resultIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.greenBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.muted,
    textAlign: 'center',
  },
});
