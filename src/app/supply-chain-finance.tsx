import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, ErrorText, PrimaryButton, SuccessView, TextField } from '@/components/form';
import { FormScreen } from '@/components/form-screen';
import { SelectField } from '@/components/select-field';
import { Colors } from '@/constants/colors';
import { useAccountField } from '@/hooks/use-account-field';
import {
  BUSINESS_TYPES,
  FINANCING_TYPES,
  isValidEmail,
  isValidMobile,
  REQUIREMENT_AMOUNTS,
  submitSupplyChainFinance,
} from '@/lib/services-api';
import { recordOrder } from '@/lib/orders';

const PRODUCTS: { title: string; text: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  {
    title: 'Invoice Financing',
    text: 'Unlock working capital against eligible outstanding invoices instead of waiting for payment cycles.',
    icon: 'document-text',
  },
  {
    title: 'Purchase Order Finance',
    text: 'Funding to fulfil a confirmed order — raw materials, production and delivery.',
    icon: 'cart',
  },
  {
    title: 'Receivables Finance',
    text: 'Turn receivables into cash to keep day-to-day operations running smoothly.',
    icon: 'cash',
  },
];

const FAQS = [
  {
    q: 'Who can apply?',
    a: 'Exporters, suppliers, manufacturers, MSMEs, distributors, and enterprises with eligible receivables, invoices, or purchase orders.',
  },
  {
    q: 'What documents are required?',
    a: 'Typically business KYC, GST and registration details, invoices or purchase orders, and recent bank statements.',
  },
  {
    q: 'Is collateral required?',
    a: 'It depends on the financing structure and your business profile — this is confirmed during assessment.',
  },
];

const toOptions = (values: readonly string[]) => values.map((v) => ({ value: v, label: v }));

export default function SupplyChainFinanceScreen() {
  const [fullName, setFullName] = useAccountField('name');
  const [email, setEmail] = useAccountField('email');
  const [businessName, setBusinessName] = useState('');
  const [mobile, setMobile] = useState('');
  const [businessType, setBusinessType] = useState<string>(BUSINESS_TYPES[0]);
  const [financingType, setFinancingType] = useState<string>(FINANCING_TYPES[0]);
  const [requirementAmount, setRequirementAmount] = useState<string>(REQUIREMENT_AMOUNTS[0]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestCode, setRequestCode] = useState<string | null>(null);
  const [trackId, setTrackId] = useState('');

  const submit = async () => {
    if (!fullName.trim() || !businessName.trim() || !email.trim() || !mobile.trim())
      return setError('Please fill in your name, business name, email, and mobile number.');
    if (!isValidEmail(email)) return setError('Please enter a valid email address.');
    if (!isValidMobile(mobile)) return setError('Please enter a valid 10-digit mobile number.');

    setError('');
    setLoading(true);
    try {
      const result = await submitSupplyChainFinance({
        fullName: fullName.trim(),
        businessName: businessName.trim(),
        email: email.trim(),
        mobile: mobile.replace(/\D/g, ''),
        businessType,
        financingType,
        requirementAmount,
        message: message.trim(),
      });
      const order = await recordOrder({
        kind: 'scf',
        title: `Supply Chain Finance · ${businessName.trim()}`,
        subtitle: financingType,
        amountLabel: requirementAmount,
        reference: result.requestCode,
      });
      setTrackId(`order:${order.id}`);
      setRequestCode(result.requestCode ?? '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit your request.');
    } finally {
      setLoading(false);
    }
  };

  if (requestCode !== null) {
    return (
      <FormScreen title="Supply Chain Finance" plain>
        <SuccessView
          title="Request submitted"
          code={requestCode || undefined}
          message={`Thanks! Our finance team will review the requirement for ${businessName.trim()} and contact you shortly.`}
          actionTitle="Track Request"
          onAction={() => router.replace({ pathname: '/track', params: { id: trackId } })}
        />
      </FormScreen>
    );
  }

  return (
    <FormScreen title="Supply Chain Finance">
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Working Capital Against Invoices & POs</Text>
        <Text style={styles.heroText}>
          Keep your business moving — finance invoices, purchase orders and receivables without long payment waits.
        </Text>
      </View>

      {PRODUCTS.map((p) => (
        <View key={p.title} style={styles.product}>
          <View style={styles.productIcon}>
            <Ionicons name={p.icon} size={22} color={Colors.navy} />
          </View>
          <View style={styles.productBody}>
            <Text style={styles.productTitle}>{p.title}</Text>
            <Text style={styles.productText}>{p.text}</Text>
          </View>
        </View>
      ))}

      <Card title="Request Financing">
        <TextField label="Full Name" value={fullName} onChangeText={setFullName} placeholder="Your full name" />
        <TextField label="Business Name" value={businessName} onChangeText={setBusinessName} placeholder="Registered business name" />
        <TextField label="Email" value={email} onChangeText={setEmail} placeholder="you@company.com" keyboardType="email-address" autoCapitalize="none" />
        <TextField label="Mobile Number" value={mobile} onChangeText={setMobile} placeholder="10-digit mobile number" keyboardType="phone-pad" maxLength={14} />
        <SelectField label="Business Type" placeholder="Select" value={businessType} options={toOptions(BUSINESS_TYPES)} onChange={setBusinessType} />
        <SelectField label="Financing Type" placeholder="Select" value={financingType} options={toOptions(FINANCING_TYPES)} onChange={setFinancingType} />
        <SelectField label="Requirement Amount" placeholder="Select" value={requirementAmount} options={toOptions(REQUIREMENT_AMOUNTS)} onChange={setRequirementAmount} />
        <TextField label="Message (optional)" value={message} onChangeText={setMessage} placeholder="Tell us about your requirement" multiline />
        <ErrorText>{error}</ErrorText>
        <PrimaryButton title="Submit Request" onPress={submit} loading={loading} />
      </Card>

      <Card title="Frequently Asked Questions">
        {FAQS.map((f) => (
          <View key={f.q} style={styles.faq}>
            <Text style={styles.faqQ}>{f.q}</Text>
            <Text style={styles.faqA}>{f.a}</Text>
          </View>
        ))}
      </Card>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: Colors.navy,
    borderRadius: 16,
    padding: 18,
    gap: 8,
  },
  heroTitle: {
    color: Colors.white,
    fontSize: 19,
    fontWeight: '700',
  },
  heroText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 19,
  },
  product: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
  },
  productIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productBody: {
    flex: 1,
    gap: 3,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  productText: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.muted,
  },
  faq: {
    gap: 4,
  },
  faqQ: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  faqA: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.muted,
  },
});
