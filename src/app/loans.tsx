import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Card,
  ChipGroup,
  ErrorText,
  PrimaryButton,
  SuccessView,
  SummaryRow,
  TextField,
} from '@/components/form';
import { FormScreen } from '@/components/form-screen';
import { router } from 'expo-router';
import { SelectField } from '@/components/select-field';
import { Colors } from '@/constants/colors';
import { useAccountField } from '@/hooks/use-account-field';
import { formatInr } from '@/lib/api';
import {
  EMPLOYMENT_TYPES,
  formatLakh,
  formatTenure,
  LOAN_PRODUCTS,
  monthlyEmi,
  type EmploymentType,
  type LoanProduct,
} from '@/lib/loans';
import {
  createLoanOrder,
  isValidEmail,
  isValidMobile,
  lookupLoan,
  type LoanLookup,
  type LoanOrder,
} from '@/lib/services-api';
import { recordOrder } from '@/lib/orders';

export default function LoansScreen() {
  const [tab, setTab] = useState<'apply' | 'track'>('apply');
  const [order, setOrder] = useState<LoanOrder | null>(null);
  const [trackId, setTrackId] = useState('');

  if (order) {
    return (
      <FormScreen title="Loans" plain>
        <SuccessView
          title="Application submitted"
          code={order.applicationCode}
          message={`${order.loanTypeLabel} of ${formatInr(order.loanAmount)} for ${formatTenure(order.tenureMonths)} at ${order.interestRate}% — estimated EMI ${formatInr(order.emi)}/month. Save your code to track this application.`}
          actionTitle="Track Application"
          onAction={() => router.replace({ pathname: '/track', params: { id: trackId } })}
        />
      </FormScreen>
    );
  }

  return (
    <FormScreen title="Loans">
      <View style={styles.tabs}>
        <TabButton label="Apply for Loan" active={tab === 'apply'} onPress={() => setTab('apply')} />
        <TabButton label="Track Application" active={tab === 'track'} onPress={() => setTab('track')} />
      </View>
      {tab === 'apply' ? (
        <ApplyForm
          onSubmitted={(o, id) => {
            setTrackId(id);
            setOrder(o);
          }}
        />
      ) : (
        <TrackForm />
      )}
    </FormScreen>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.tab, active && styles.tabActive]} onPress={onPress}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ApplyForm({ onSubmitted }: { onSubmitted: (order: LoanOrder, trackId: string) => void }) {
  const [product, setProduct] = useState<LoanProduct>(LOAN_PRODUCTS[0]);
  const [amount, setAmount] = useState(LOAN_PRODUCTS[0].defaultAmount);
  const [tenure, setTenure] = useState(LOAN_PRODUCTS[0].defaultTenure);

  const [name, setName] = useAccountField('name');
  const [email, setEmail] = useAccountField('email');
  const [phone, setPhone] = useState('');
  const [employment, setEmployment] = useState<EmploymentType>('salaried');
  const [income, setIncome] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const emi = monthlyEmi(amount, product.interestRate, tenure);
  const totalPayable = emi * tenure;
  const processingFee = Math.round((amount * product.processingFeePct) / 100);

  const changeProduct = (id: string) => {
    const p = LOAN_PRODUCTS.find((x) => x.id === id) ?? LOAN_PRODUCTS[0];
    setProduct(p);
    setAmount(p.defaultAmount);
    setTenure(p.defaultTenure);
  };

  const stepAmount = (direction: 1 | -1) => {
    // Bigger jumps for bigger loans so reaching the max doesn't take hundreds of taps.
    const jump = product.step * (amount >= 1000000 ? 10 : 5);
    setAmount((a) => Math.min(product.maxAmount, Math.max(product.minAmount, a + direction * jump)));
  };

  const submit = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !income.trim())
      return setError('Please fill in your name, email, phone number, and monthly income.');
    if (!isValidEmail(email)) return setError('Please enter a valid email address.');
    if (!isValidMobile(phone)) return setError('Please enter a valid 10-digit mobile number.');

    setError('');
    setLoading(true);
    try {
      const order = await createLoanOrder({
        applicantName: name.trim(),
        applicantEmail: email.trim(),
        applicantPhone: phone.replace(/\D/g, ''),
        employmentType: employment,
        monthlyIncome: income.trim(),
        loanType: product.id,
        loanAmount: amount,
        tenureMonths: tenure,
      });
      const saved = await recordOrder({
        kind: 'loan',
        title: order.loanTypeLabel,
        subtitle: `${formatTenure(order.tenureMonths)} · EMI ${formatInr(order.emi)}`,
        amount: order.loanAmount,
        reference: order.applicationCode,
        email: email.trim(),
      });
      onSubmitted(order, `order:${saved.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit loan application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card title="Loan Calculator">
        <SelectField
          label="Loan Type"
          placeholder="Select loan type"
          value={product.id}
          options={LOAN_PRODUCTS.map((p) => ({ value: p.id, label: p.label }))}
          onChange={changeProduct}
        />
        <Text style={styles.sub}>{product.sub}</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Loan Amount</Text>
          <View style={styles.stepperRow}>
            <StepButton icon="remove" onPress={() => stepAmount(-1)} disabled={amount <= product.minAmount} />
            <Text style={styles.amount}>{formatInr(amount)}</Text>
            <StepButton icon="add" onPress={() => stepAmount(1)} disabled={amount >= product.maxAmount} />
          </View>
          <Text style={styles.range}>
            {formatLakh(product.minAmount)} – {formatLakh(product.maxAmount)}
          </Text>
        </View>

        <ChipGroup
          label="Tenure"
          value={String(tenure)}
          options={product.tenureOptions.map((t) => ({ value: String(t), label: formatTenure(t) }))}
          onChange={(v) => setTenure(Number(v))}
        />
      </Card>

      <View style={styles.emiCard}>
        <Text style={styles.emiLabel}>Monthly EMI</Text>
        <Text style={styles.emiValue}>{formatInr(emi)}</Text>
        <View style={styles.emiRow}>
          <EmiStat label="Interest" value={`${product.interestRate}% p.a.`} />
          <EmiStat label="Total Interest" value={formatLakh(Math.max(0, totalPayable - amount))} />
          <EmiStat label="Processing Fee" value={formatInr(processingFee)} />
        </View>
      </View>

      <Card title="Your Details">
        <TextField label="Full Name" value={name} onChangeText={setName} placeholder="Full name" autoComplete="name" />
        <TextField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
        <TextField label="Mobile Number" value={phone} onChangeText={setPhone} placeholder="10-digit mobile number" keyboardType="phone-pad" maxLength={14} />
        <SelectField
          label="Employment Type"
          placeholder="Select employment type"
          value={employment}
          options={[...EMPLOYMENT_TYPES]}
          onChange={setEmployment}
        />
        <TextField
          label={product.id === 'education' ? 'Co-applicant Monthly Income (₹)' : 'Monthly Income (₹)'}
          value={income}
          onChangeText={(t) => setIncome(t.replace(/[^0-9]/g, ''))}
          placeholder="e.g. 50000"
          keyboardType="number-pad"
        />
      </Card>

      <ErrorText>{error}</ErrorText>
      <PrimaryButton title="Apply Now" onPress={submit} loading={loading} />
    </>
  );
}

function TrackForm() {
  const [code, setCode] = useState('');
  const [email, setEmail] = useAccountField('email');
  const [result, setResult] = useState<LoanLookup | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const track = async () => {
    if (!code.trim() || !email.trim()) return setError('Please enter both your application code and email.');
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const data = await lookupLoan(code, email);
      if (!data.success) throw new Error('No matching application found.');
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No matching application found.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card title="Track Your Application">
        <TextField label="Application Code" value={code} onChangeText={(t) => setCode(t.toUpperCase())} placeholder="e.g. LN-XXXXXX" autoCapitalize="characters" />
        <TextField label="Email" value={email} onChangeText={setEmail} placeholder="Email used to apply" keyboardType="email-address" autoCapitalize="none" />
        <ErrorText>{error}</ErrorText>
        <PrimaryButton title="Track" onPress={track} loading={loading} variant="navy" />
      </Card>

      {result ? (
        <Card title={result.loanTypeLabel}>
          <SummaryRow label="Application" value={result.applicationCode} />
          <SummaryRow label="Amount" value={formatInr(result.loanAmount)} />
          <SummaryRow label="Tenure" value={formatTenure(result.tenureMonths)} />
          <SummaryRow label="EMI" value={`${formatInr(result.emi)}/month`} />
          <View style={styles.stages}>
            {result.stages.map((stage, i) => (
              <View key={stage.key} style={styles.stage}>
                <View style={styles.stageRail}>
                  <View style={[styles.stageDot, stage.reached && styles.stageDotDone]}>
                    {stage.reached ? <Ionicons name="checkmark" size={13} color={Colors.white} /> : null}
                  </View>
                  {i < result.stages.length - 1 ? (
                    <View style={[styles.stageLine, stage.reached && styles.stageLineDone]} />
                  ) : null}
                </View>
                <Text style={[styles.stageLabel, stage.isCurrent && styles.stageCurrent]}>{stage.label}</Text>
              </View>
            ))}
          </View>
        </Card>
      ) : null}
    </>
  );
}

function StepButton({
  icon,
  onPress,
  disabled,
}: {
  icon: 'add' | 'remove';
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      style={[styles.stepButton, disabled && styles.stepDisabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={icon === 'add' ? 'Increase amount' : 'Decrease amount'}>
      <Ionicons name={icon} size={22} color={Colors.white} />
    </Pressable>
  );
}

function EmiStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.emiStat}>
      <Text style={styles.emiStatLabel}>{label}</Text>
      <Text style={styles.emiStatValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.input,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.white,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.muted,
  },
  tabTextActive: {
    color: Colors.navy,
  },
  sub: {
    fontSize: 13,
    color: Colors.muted,
    marginTop: -6,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  stepButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDisabled: {
    opacity: 0.3,
  },
  amount: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  range: {
    fontSize: 12,
    color: Colors.muted,
    textAlign: 'center',
  },
  emiCard: {
    backgroundColor: Colors.navy,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  emiLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
  },
  emiValue: {
    color: Colors.white,
    fontSize: 30,
    fontWeight: '800',
    marginTop: 2,
  },
  emiRow: {
    flexDirection: 'row',
    marginTop: 14,
    alignSelf: 'stretch',
  },
  emiStat: {
    flex: 1,
    alignItems: 'center',
  },
  emiStatLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
  },
  emiStatValue: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  stages: {
    marginTop: 4,
  },
  stage: {
    flexDirection: 'row',
    gap: 12,
  },
  stageRail: {
    alignItems: 'center',
  },
  stageDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageDotDone: {
    backgroundColor: Colors.green,
  },
  stageLine: {
    width: 2,
    height: 22,
    backgroundColor: Colors.border,
  },
  stageLineDone: {
    backgroundColor: Colors.green,
  },
  stageLabel: {
    fontSize: 14,
    color: Colors.text,
    paddingTop: 2,
  },
  stageCurrent: {
    fontWeight: '700',
    color: Colors.green,
  },
});
