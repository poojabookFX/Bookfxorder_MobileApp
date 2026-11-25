import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { SelectField } from '@/components/select-field';
import { Colors } from '@/constants/colors';
import { formatInr } from '@/lib/api';
import {
  CATEGORIES,
  CERT_TYPE_LABELS,
  dscQuote,
  type Category,
  type CertType,
  type Region,
  type Validity,
} from '@/lib/dsc';

const REGIONS: { value: Region; label: string }[] = [
  { value: 'Indian', label: 'Indian' },
  { value: 'Foreign', label: 'Foreign' },
];

const VALIDITIES: { value: Validity; label: string }[] = [
  { value: '1', label: '1 Year' },
  { value: '2', label: '2 Years' },
  { value: '3', label: '3 Years' },
];

const CERT_TYPES = (Object.keys(CERT_TYPE_LABELS) as CertType[]).map((value) => ({
  value,
  label: CERT_TYPE_LABELS[value],
}));

type Quote = ReturnType<typeof dscQuote>;

export default function DscCalculatorScreen() {
  const [region, setRegion] = useState<Region>('Indian');
  const [category, setCategory] = useState<Category | null>(null);
  const [certType, setCertType] = useState<CertType>('Sign');
  const [validity, setValidity] = useState<Validity>('1');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState('');

  const changeRegion = (value: Region) => {
    setRegion(value);
    // Foreign certificates don't offer every category.
    if (category && !CATEGORIES[value].includes(category)) setCategory(null);
    setQuote(null);
  };

  const calculate = () => {
    if (!category) {
      setError('Please select a document type.');
      return;
    }
    setError('');
    setQuote(dscQuote(region, category, certType, validity));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="DSC Calculator" back />
      <KeyboardAwareScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" bottomOffset={24}>
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Ionicons name="calculator" size={26} color={Colors.navy} />
          </View>
          <Text style={styles.bannerText}>Calculate your DSC cost instantly</Text>
        </View>

        <SelectField label="Region" placeholder="Select Region" value={region} options={REGIONS} onChange={changeRegion} />
        <SelectField
          label="Document Type"
          placeholder="Select Document Type"
          value={category}
          options={CATEGORIES[region].map((c) => ({ value: c, label: c }))}
          onChange={(value) => {
            setCategory(value);
            setQuote(null);
          }}
        />
        {category !== 'DGFT' ? (
          <SelectField
            label="Certificate Type"
            placeholder="Select Certificate Type"
            value={certType}
            options={CERT_TYPES}
            onChange={(value) => {
              setCertType(value);
              setQuote(null);
            }}
          />
        ) : null}
        <SelectField
          label="Validity"
          placeholder="Select Validity"
          value={validity}
          options={VALIDITIES}
          onChange={(value) => {
            setValidity(value);
            setQuote(null);
          }}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={calculate}>
          <Text style={styles.buttonText}>Calculate</Text>
        </Pressable>

        <View style={styles.result}>
          <Text style={styles.total}>{formatInr(quote?.total ?? 0)}</Text>
          <Text style={styles.resultLabel}>Estimated Cost</Text>
          {quote ? (
            <View style={styles.breakdown}>
              <Row label="DSC Amount" value={formatInr(quote.amount)} />
              <Row label="GST @ 18%" value={formatInr(quote.gst)} />
            </View>
          ) : null}
        </View>

        {quote ? (
          <Pressable
            style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}
            onPress={() =>
              router.push({
                pathname: '/digital-signature',
                params: { region, category: category ?? 'Individual', type: certType, validity },
              })
            }>
            <Text style={styles.outlineButtonText}>Apply for DSC</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.navy} />
          </Pressable>
        ) : null}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  banner: {
    backgroundColor: Colors.navy,
    borderRadius: 14,
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 12,
  },
  bannerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  error: {
    color: Colors.red,
    fontSize: 13,
  },
  button: {
    backgroundColor: Colors.red,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
  result: {
    backgroundColor: Colors.input,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  total: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.text,
  },
  resultLabel: {
    fontSize: 13,
    color: Colors.muted,
    marginTop: 4,
  },
  breakdown: {
    alignSelf: 'stretch',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: 14,
    color: Colors.muted,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  outlineButton: {
    flexDirection: 'row',
    gap: 8,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    color: Colors.navy,
    fontSize: 15,
    fontWeight: '700',
  },
});
