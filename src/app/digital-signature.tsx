import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import {
  Bullet,
  Card,
  ChipGroup,
  ErrorText,
  PrimaryButton,
  SuccessView,
  SummaryRow,
  TextField,
} from '@/components/form';
import { FormScreen } from '@/components/form-screen';
import { Colors } from '@/constants/colors';
import { formatInr } from '@/lib/api';
import { useSession } from '@/lib/auth-client';
import {
  CATEGORIES,
  CERT_TYPE_LABELS,
  dscPlanSummary,
  dscQuote,
  type Category,
  type CertType,
  type Region,
  type Validity,
} from '@/lib/dsc';
import { recordOrder } from '@/lib/orders';
import { isValidEmail, isValidMobile, lookupPincode, submitDsc } from '@/lib/services-api';

const STEPS = ['Plan', 'Applicant', 'Identity', 'Review'];
const VERIFICATION_MODES = ['OTP', 'Biometrics', 'Iris', 'Face'] as const;
type VerificationMode = (typeof VERIFICATION_MODES)[number];

const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const options = <T extends string>(values: readonly T[], label: (v: T) => string = (v) => v) =>
  values.map((value) => ({ value, label: label(value) }));

export default function DigitalSignatureScreen() {
  // The DSC calculator can pre-select a plan.
  const params = useLocalSearchParams<{ region?: Region; category?: Category; type?: CertType; validity?: Validity }>();
  const { data: session } = useSession();

  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [referenceCode, setReferenceCode] = useState('');
  const [trackId, setTrackId] = useState('');

  const [region, setRegion] = useState<Region>(params.region ?? 'Indian');
  const [category, setCategory] = useState<Category>(params.category ?? 'Individual');
  const [certType, setCertType] = useState<CertType>(params.type ?? 'Sign');
  const [validity, setValidity] = useState<Validity>(params.validity ?? '1');

  // Name and email default to the signed-in account until the user edits them.
  const [nameInput, setName] = useState<string | null>(null);
  const [emailInput, setEmail] = useState<string | null>(null);
  const name = nameInput ?? session?.user.name ?? '';
  const email = emailInput ?? session?.user.email ?? '';
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('');
  const [fatherName, setFatherName] = useState('');

  const [pan, setPan] = useState('');
  const [panName, setPanName] = useState('');
  const [idType, setIdType] = useState<'aadhaar' | 'vid'>('aadhaar');
  const [aadhaar, setAadhaar] = useState('');
  const [address, setAddress] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [pinLoading, setPinLoading] = useState(false);

  const [verificationMode, setVerificationMode] = useState<VerificationMode>('OTP');
  const [remarks, setRemarks] = useState('');

  const quote = dscQuote(region, category, certType, validity);

  const changeRegion = (value: Region) => {
    setRegion(value);
    if (!CATEGORIES[value].includes(category)) setCategory('Individual');
  };

  const changePin = async (text: string) => {
    const pin = text.replace(/\D/g, '').slice(0, 6);
    setPinCode(pin);
    setState('');
    setCity('');
    if (pin.length !== 6) return;
    setPinLoading(true);
    try {
      const result = await lookupPincode(pin);
      setState(result.state);
      setCity(result.city);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please enter a valid pincode.');
    } finally {
      setPinLoading(false);
    }
  };

  // Returns an error message for the current step, or '' when it is complete.
  const validate = (s: number) => {
    if (s === 1) {
      if (!name.trim()) return 'Please enter your full name.';
      if (!isValidEmail(email)) return 'Please enter a valid email address.';
      if (!isValidMobile(mobile)) return 'Please enter a valid 10-digit mobile number.';
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) return 'Please enter your date of birth as DD/MM/YYYY.';
      if (!fatherName.trim()) return "Please enter your father's name.";
    }
    if (s === 2) {
      if (!PAN_RE.test(pan.toUpperCase())) return 'Please enter a valid PAN (e.g. ABCDE1234F).';
      if (!panName.trim()) return 'Please enter your name as printed on PAN.';
      const digits = aadhaar.replace(/\D/g, '');
      if (idType === 'aadhaar' && digits.length !== 12) return 'Please enter your 12-digit Aadhaar number.';
      if (idType === 'vid' && digits.length !== 16) return 'Please enter your 16-digit Virtual ID.';
      if (!address.trim()) return 'Please enter your address.';
      if (!state || !city) return 'Please enter a valid 6-digit pincode.';
    }
    return '';
  };

  const next = () => {
    const message = validate(step);
    setError(message);
    if (!message) setStep((s) => s + 1);
  };

  const back = () => {
    setError('');
    setStep((s) => s - 1);
  };

  const submit = async () => {
    setError('');
    setSubmitting(true);
    try {
      await submitDsc({
        name: name.trim(),
        mobile: mobile.replace(/\D/g, ''),
        email: email.trim(),
        pan: pan.toUpperCase(),
        panName: panName.trim(),
        aadhaar: idType === 'aadhaar' ? aadhaar.replace(/\D/g, '') : '',
        aadhaarVid: idType === 'vid' ? aadhaar.replace(/\D/g, '') : '',
        dob,
        fatherName: fatherName.trim(),
        address: address.trim(),
        pinCode,
        state,
        city,
        remarks: remarks.trim(),
        verificationMode,
        emailVerified: false,
        applicantType: category === 'Organization' ? 'Organisation' : 'Individual',
        plan: dscPlanSummary(region, category, certType, validity),
        documentNames: [],
        videoKycCompleted: false,
      });
      // The website shows the same locally generated reference after a successful request.
      const code = `DSC-${Date.now().toString(36).toUpperCase()}`;
      const order = await recordOrder({
        kind: 'dsc',
        title: 'Digital Signature Certificate',
        subtitle: `${category}${category !== 'DGFT' ? ` · ${CERT_TYPE_LABELS[certType]}` : ''} · ${validity} Yr`,
        amount: quote.total,
        reference: code,
      });
      setTrackId(`order:${order.id}`);
      setReferenceCode(code);
    } catch {
      setError('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (referenceCode) {
    return (
      <FormScreen title="Digital Signature" plain>
        <SuccessView
          title="Application submitted"
          code={referenceCode}
          message={`Our team will verify your details and send a secure payment link to +91 ${mobile.replace(/\D/g, '')} and ${email.trim()}. Document upload and Video KYC are completed with our team.`}
          actionTitle="Track Application"
          onAction={() => router.replace({ pathname: '/track', params: { id: trackId } })}
        />
      </FormScreen>
    );
  }

  return (
    <FormScreen title="Digital Signature">
      <View style={styles.hero}>
        <Ionicons name="finger-print" size={30} color={Colors.white} />
        <Text style={styles.heroTitle}>Class 3 Digital Signature Certificate</Text>
        <Text style={styles.heroText}>File returns, register GST, bid on e-tenders — all online. Free USB token.</Text>
      </View>

      <Stepper step={step} />

      {step === 0 ? (
        <>
          <Card title="Select Certificate">
            <ChipGroup label="Region" value={region} options={options(['Indian', 'Foreign'] as const)} onChange={changeRegion} />
            <ChipGroup label="Category" value={category} options={options(CATEGORIES[region])} onChange={setCategory} />
            {category !== 'DGFT' ? (
              <ChipGroup
                label="Certificate Type"
                value={certType}
                options={options(['Sign', 'Encrypt', 'Both'] as const, (v) => CERT_TYPE_LABELS[v])}
                onChange={setCertType}
              />
            ) : null}
            <ChipGroup
              label="Validity"
              value={validity}
              options={options(['1', '2', '3'] as const, (v) => `${v} Year${v === '1' ? '' : 's'}`)}
              onChange={setValidity}
            />
          </Card>
          <PriceCard amount={quote.amount} gst={quote.gst} total={quote.total} />
          <Card title="Why BookFXOrder">
            <Bullet>CCA India approved, government certified provider</Bullet>
            <Bullet>Issued within 2–4 hours, same-day delivery</Bullet>
            <Bullet>100% paperless with secure Video KYC</Bullet>
          </Card>
        </>
      ) : null}

      {step === 1 ? (
        <Card title="Applicant Details">
          <TextField label="Full Name" value={name} onChangeText={setName} placeholder="As per Aadhaar" autoComplete="name" />
          <TextField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
          <TextField label="Mobile Number" value={mobile} onChangeText={setMobile} placeholder="10-digit mobile number" keyboardType="phone-pad" maxLength={14} />
          <TextField label="Date of Birth" value={dob} onChangeText={(t) => setDob(formatDob(t))} placeholder="DD/MM/YYYY" keyboardType="number-pad" maxLength={10} />
          <TextField label="Father's Name" value={fatherName} onChangeText={setFatherName} placeholder="Father's full name" />
        </Card>
      ) : null}

      {step === 2 ? (
        <>
          <Card title="Identity">
            <TextField label="PAN" value={pan} onChangeText={(t) => setPan(t.toUpperCase())} placeholder="ABCDE1234F" autoCapitalize="characters" maxLength={10} />
            <TextField label="Name on PAN" value={panName} onChangeText={setPanName} placeholder="As printed on PAN card" />
            <ChipGroup
              label="Aadhaar"
              value={idType}
              options={[
                { value: 'aadhaar', label: 'Aadhaar Number' },
                { value: 'vid', label: 'Virtual ID' },
              ]}
              onChange={(v) => {
                setIdType(v);
                setAadhaar('');
              }}
            />
            <TextField
              label={idType === 'aadhaar' ? 'Aadhaar Number' : 'Virtual ID (VID)'}
              value={aadhaar}
              onChangeText={setAadhaar}
              placeholder={idType === 'aadhaar' ? '12-digit Aadhaar' : '16-digit VID'}
              keyboardType="number-pad"
              maxLength={idType === 'aadhaar' ? 14 : 19}
            />
          </Card>
          <Card title="Address">
            <TextField label="Address" value={address} onChangeText={setAddress} placeholder="House no., street, locality" multiline />
            <TextField label="Pincode" value={pinCode} onChangeText={changePin} placeholder="6-digit pincode" keyboardType="number-pad" maxLength={6} />
            {pinLoading ? <ActivityIndicator color={Colors.navy} /> : null}
            {state ? <SummaryRow label="City / State" value={`${city}, ${state}`} /> : null}
          </Card>
        </>
      ) : null}

      {step === 3 ? (
        <>
          <Card title="Verification">
            <ChipGroup label="Verification Mode" value={verificationMode} options={options(VERIFICATION_MODES)} onChange={setVerificationMode} />
            <TextField label="Remarks (optional)" value={remarks} onChangeText={setRemarks} placeholder="Anything we should know" multiline />
          </Card>
          <Card title="Application Summary">
            <SummaryRow label="Plan" value={`${category}${category !== 'DGFT' ? ` · ${CERT_TYPE_LABELS[certType]}` : ''}`} />
            <SummaryRow label="Region" value={region} />
            <SummaryRow label="Validity" value={`${validity} Year${validity === '1' ? '' : 's'}`} />
            <SummaryRow label="Applicant" value={name} />
            <SummaryRow label="Mobile" value={`+91 ${mobile.replace(/\D/g, '')}`} />
            <SummaryRow label="PAN" value={pan.toUpperCase()} />
          </Card>
          <PriceCard amount={quote.amount} gst={quote.gst} total={quote.total} />
          <Text style={styles.note}>
            No payment is collected now. Once your details are reviewed, our team sends a secure payment link. Your DSC
            moves to CA approval right after payment.
          </Text>
        </>
      ) : null}

      <ErrorText>{error}</ErrorText>

      <View style={styles.actions}>
        {step > 0 ? (
          <View style={styles.flex}>
            <PrimaryButton title="Back" variant="navy" onPress={back} />
          </View>
        ) : null}
        <View style={styles.flexWide}>
          {step < STEPS.length - 1 ? (
            <PrimaryButton title="Continue" onPress={next} />
          ) : (
            <PrimaryButton title="Submit Application" onPress={submit} loading={submitting} />
          )}
        </View>
      </View>
    </FormScreen>
  );
}

// Inserts slashes while typing: 01011990 -> 01/01/1990.
function formatDob(text: string) {
  const d = text.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

function Stepper({ step }: { step: number }) {
  return (
    <View style={styles.stepper}>
      {STEPS.map((label, i) => (
        <View key={label} style={styles.stepItem}>
          <View style={[styles.stepDot, i <= step && styles.stepDotActive]}>
            {i < step ? (
              <Ionicons name="checkmark" size={14} color={Colors.white} />
            ) : (
              <Text style={[styles.stepNum, i <= step && styles.stepNumActive]}>{i + 1}</Text>
            )}
          </View>
          <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

function PriceCard({ amount, gst, total }: { amount: number; gst: number; total: number }) {
  return (
    <View style={styles.price}>
      <SummaryRowLight label="DSC Amount" value={formatInr(amount)} />
      <SummaryRowLight label="GST @ 18%" value={formatInr(gst)} />
      <View style={styles.priceDivider} />
      <View style={styles.priceTotalRow}>
        <Text style={styles.priceTotalLabel}>Total Payable</Text>
        <Text style={styles.priceTotal}>{formatInr(total)}</Text>
      </View>
    </View>
  );
}

function SummaryRowLight({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.priceRow}>
      <Text style={styles.priceLabel}>{label}</Text>
      <Text style={styles.priceValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flexWide: { flex: 2 },
  hero: {
    backgroundColor: Colors.navy,
    borderRadius: 16,
    padding: 18,
    gap: 6,
  },
  heroTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  heroText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 19,
  },
  stepper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: Colors.red,
  },
  stepNum: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.muted,
  },
  stepNumActive: {
    color: Colors.white,
  },
  stepLabel: {
    fontSize: 12,
    color: Colors.muted,
  },
  stepLabelActive: {
    color: Colors.text,
    fontWeight: '700',
  },
  price: {
    backgroundColor: Colors.navy,
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
  },
  priceValue: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  priceDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 4,
  },
  priceTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceTotalLabel: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  priceTotal: {
    color: '#F5A623',
    fontSize: 24,
    fontWeight: '800',
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.muted,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
});
