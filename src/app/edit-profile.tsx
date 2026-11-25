import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { ErrorText, PrimaryButton, TextField } from '@/components/form';
import { FormScreen } from '@/components/form-screen';
import { Colors } from '@/constants/colors';
import { authClient, listSignInProviders, useSession } from '@/lib/auth-client';

const PROVIDER_LABELS: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  credential: { label: 'Email & Password', icon: 'key-outline' },
  google: { label: 'Google', icon: 'logo-google' },
};

export default function EditProfileScreen() {
  const { data: session } = useSession();
  const user = session?.user;
  const [name, setName] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [providers, setProviders] = useState<string[] | null>(null);

  // Ways this account can sign in (Google, email & password, ...).
  useEffect(() => {
    listSignInProviders()
      .then(setProviders)
      .catch(() => setProviders([]));
  }, []);

  const currentName = name ?? user?.name ?? '';
  const changed = currentName.trim() !== (user?.name ?? '');

  const save = async () => {
    if (!currentName.trim()) return setError('Please enter your full name.');
    if (currentName.trim().length < 2) return setError('Name is too short.');
    setError('');
    setSaving(true);
    const { error: updateError } = await authClient.updateUser({ name: currentName.trim() });
    setSaving(false);
    if (updateError) return setError(updateError.message || 'Could not update your profile.');
    setSaved(true);
    setTimeout(() => router.back(), 900);
  };

  return (
    <FormScreen title="Edit Profile">
      <View style={styles.header}>
        <Avatar name={currentName} image={user?.image} size={96} />
        <Text style={styles.name}>{currentName || 'Your name'}</Text>
        {user?.image ? <Text style={styles.photoHint}>Photo from your Google account</Text> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Personal Details</Text>
        <TextField
          label="Full Name"
          value={currentName}
          onChangeText={(t) => {
            setName(t);
            setSaved(false);
          }}
          placeholder="Your full name"
          autoCapitalize="words"
          autoComplete="name"
          returnKeyType="done"
          onSubmitEditing={save}
        />

        <View style={styles.readOnly}>
          <Text style={styles.readOnlyLabel}>Email Address</Text>
          <View style={styles.readOnlyBox}>
            <Ionicons name="mail-outline" size={18} color={Colors.muted} />
            <Text style={styles.readOnlyValue} numberOfLines={1}>
              {user?.email ?? ''}
            </Text>
            {user?.emailVerified ? (
              <View style={styles.verified}>
                <Ionicons name="checkmark-circle" size={13} color={Colors.green} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.helper}>Your email is your login ID and can&apos;t be changed here.</Text>
        </View>

        {user?.phoneNumber ? (
          <View style={styles.readOnly}>
            <Text style={styles.readOnlyLabel}>Mobile Number</Text>
            <View style={styles.readOnlyBox}>
              <Ionicons name="call-outline" size={18} color={Colors.muted} />
              <Text style={styles.readOnlyValue}>{user.phoneNumber}</Text>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sign-in Methods</Text>
        {providers === null ? (
          <Text style={styles.helper}>Loading…</Text>
        ) : providers.length === 0 ? (
          <Text style={styles.helper}>Email code</Text>
        ) : (
          providers.map((p) => {
            const info = PROVIDER_LABELS[p] ?? { label: p, icon: 'link-outline' as const };
            return (
              <View key={p} style={styles.provider}>
                <Ionicons name={info.icon} size={18} color={Colors.navy} />
                <Text style={styles.providerText}>{info.label}</Text>
                <Ionicons name="checkmark" size={18} color={Colors.green} />
              </View>
            );
          })
        )}
        {providers && !providers.includes('credential') ? (
          <Text style={styles.helper}>
            No password set. Use Change Password → &quot;Set a password by email&quot; to add one.
          </Text>
        ) : null}
      </View>

      <ErrorText>{error}</ErrorText>
      {saved ? (
        <View style={styles.success}>
          <Ionicons name="checkmark-circle" size={18} color={Colors.green} />
          <Text style={styles.successText}>Profile updated</Text>
        </View>
      ) : null}
      <PrimaryButton title={changed ? 'Save Changes' : 'No Changes'} onPress={save} loading={saving} disabled={!changed} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  photoHint: {
    fontSize: 12,
    color: Colors.muted,
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
  readOnly: {
    gap: 6,
  },
  readOnlyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  readOnlyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: Colors.input,
  },
  readOnlyValue: {
    flex: 1,
    fontSize: 15,
    color: Colors.muted,
  },
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.greenBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.green,
  },
  helper: {
    fontSize: 12,
    color: Colors.muted,
    lineHeight: 17,
  },
  provider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  providerText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  success: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.green,
  },
});


