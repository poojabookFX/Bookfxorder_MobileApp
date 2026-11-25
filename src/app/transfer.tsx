import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { SelectField } from '@/components/select-field';
import { Colors } from '@/constants/colors';
import { formatInr, INR_TO_NPR, submitTransfer } from '@/lib/api';
import { useSession } from '@/lib/auth-client';
import { recordOrder } from '@/lib/orders';

// The website only supports India → Nepal remittances.
const COUNTRIES = [{ value: 'NP' as const, label: '🇳🇵  Nepal' }];

export default function TransferScreen() {
  const { data: session } = useSession();
  const [country, setCountry] = useState<'NP' | null>(null);
  const [amount, setAmount] = useState('');
  // Name and email default to the signed-in account until the user edits them.
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const senderName = name ?? session?.user.name ?? '';
  const senderEmail = email ?? session?.user.email ?? '';
  const amountInr = parseFloat(amount) || 0;
  const amountNpr = amountInr * INR_TO_NPR;

  const send = async () => {
    if (!country) return setError('Please select the country you are sending to.');
    if (amountInr <= 0) return setError('Please enter the amount you want to send.');
    if (!senderName.trim() || !senderEmail.trim()) return setError('Please complete your details.');
    if (phone.replace(/\D/g, '').length !== 10)
      return setError('Please enter a valid 10-digit mobile number.');

    setError('');
    setLoading(true);
    try {
      await submitTransfer(amountInr, {
        name: senderName.trim(),
        email: senderEmail.trim(),
        phone: phone.replace(/\D/g, ''),
      });
      await recordOrder({
        kind: 'transfer',
        title: 'Money Transfer to Nepal',
        subtitle: `NPR ${amountNpr.toLocaleString('en-IN')}`,
        amount: amountInr,
      });
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScreenHeader title="Indo-Nepal Transfer" back />
        <View style={styles.success}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={40} color={Colors.white} />
          </View>
          <Text style={styles.successTitle}>Request submitted</Text>
          <Text style={styles.successText}>
            Your transfer of {formatInr(amountInr)} (NPR {amountNpr.toLocaleString('en-IN')}) has
            been received. Our team will contact you on {phone} to complete payment.
          </Text>
          <Pressable style={styles.button} onPress={() => router.replace('/track')}>
            <Text style={styles.buttonText}>Track Transfer</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Indo-Nepal Transfer" back />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={styles.flags}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Ionicons name="swap-horizontal" size={28} color={Colors.navy} />
              <Text style={styles.flag}>🇳🇵</Text>
            </View>
          </View>
          <View style={styles.heading}>
            <Text style={styles.title}>Send Money to Nepal from India</Text>
            <Text style={styles.subtitle}>Quick • Secure • Affordable</Text>
            <Text style={styles.rate}>1 INR = {INR_TO_NPR} NPR</Text>
          </View>

          <SelectField
            label="Send To"
            placeholder="Select Country"
            value={country}
            options={COUNTRIES}
            onChange={setCountry}
          />

          <Field label="Amount (INR)">
            <TextInput
              style={styles.input}
              placeholder="Enter Amount"
              placeholderTextColor={Colors.muted}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={(t) => setAmount(t.replace(/[^0-9.]/g, ''))}
            />
          </Field>
          {amountInr > 0 ? (
            <Text style={styles.receive}>
              Recipient gets <Text style={styles.receiveStrong}>NPR {amountNpr.toLocaleString('en-IN')}</Text>
            </Text>
          ) : null}

          <Field label="Your Name">
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={Colors.muted}
              value={senderName}
              onChangeText={setName}
            />
          </Field>
          <Field label="Email">
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor={Colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={senderEmail}
              onChangeText={setEmail}
            />
          </Field>
          <Field label="Mobile Number">
            <TextInput
              style={styles.input}
              placeholder="10-digit mobile number"
              placeholderTextColor={Colors.muted}
              keyboardType="phone-pad"
              maxLength={14}
              value={phone}
              onChangeText={setPhone}
            />
          </Field>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={({ pressed }) => [styles.button, (pressed || loading) && styles.pressed]}
            onPress={send}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Send Now</Text>
            )}
          </Pressable>

          <View style={styles.secure}>
            <Ionicons name="shield-checkmark" size={16} color={Colors.red} />
            <Text style={styles.secureText}>Your transaction is 100% secure</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 32,
  },
  hero: {
    backgroundColor: Colors.iconBg,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  flags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  flag: {
    fontSize: 52,
  },
  heading: {
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: Colors.muted,
  },
  rate: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.green,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  input: {
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Colors.text,
  },
  receive: {
    marginTop: -4,
    fontSize: 13,
    color: Colors.muted,
  },
  receiveStrong: {
    fontWeight: '700',
    color: Colors.text,
  },
  error: {
    color: Colors.red,
    fontSize: 13,
  },
  button: {
    alignSelf: 'stretch',
    backgroundColor: Colors.red,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
  secure: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secureText: {
    fontSize: 12,
    color: Colors.muted,
  },
  success: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  successText: {
    fontSize: 15,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
});
