import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Bullet, ChipGroup, ErrorText, PrimaryButton, TextField } from '@/components/form';
import { FormScreen } from '@/components/form-screen';
import { Colors } from '@/constants/colors';
import { useAccountField } from '@/hooks/use-account-field';
import { formatInr } from '@/lib/api';
import { CARD_FILTERS, CREDIT_CARDS, type CardCategory, type CreditCard } from '@/lib/credit-cards';
import { recordOrder } from '@/lib/orders';
import { isValidEmail, isValidMobile, submitContact } from '@/lib/services-api';

export default function CreditCardsScreen() {
  const [filter, setFilter] = useState<CardCategory | 'all'>('all');
  const [selected, setSelected] = useState<CreditCard | null>(null);
  const cards = filter === 'all' ? CREDIT_CARDS : CREDIT_CARDS.filter((c) => c.categories.includes(filter));

  return (
    <FormScreen title="Credit Cards">
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Find the Right Credit Card for You</Text>
        <Text style={styles.heroText}>
          Compare cards from leading banks, check eligibility for free, and apply with ₹0 advisory fees.
        </Text>
        <View style={styles.heroStats}>
          <HeroStat value="6" label="Partner Cards" />
          <HeroStat value="24–48 hrs" label="Avg. Approval" />
          <HeroStat value="₹0" label="Broker Fees" />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        <ChipGroup value={filter} options={CARD_FILTERS} onChange={setFilter} />
      </ScrollView>

      {cards.map((card) => (
        <CardItem key={card.id} card={card} onCheck={() => setSelected(card)} />
      ))}

      <EligibilitySheet card={selected} onClose={() => setSelected(null)} />
    </FormScreen>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.heroStat}>
      <Text style={styles.heroStatValue}>{value}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

function CardItem({ card, onCheck }: { card: CreditCard; onCheck: () => void }) {
  return (
    <View style={styles.card}>
      <View style={[styles.cardFace, { backgroundColor: card.color }]}>
        <View style={styles.cardFaceTop}>
          <Text style={styles.cardBank}>{card.bank}</Text>
          <Ionicons name="wifi" size={18} color="rgba(255,255,255,0.8)" style={styles.contactless} />
        </View>
        <Text style={styles.cardDots}>•••• •••• •••• ••••</Text>
        <Text style={styles.cardFaceName}>{card.name}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardName}>{card.name}</Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={12} color="#F5A623" />
            <Text style={styles.ratingText}>{card.rating}</Text>
          </View>
        </View>
        <View style={styles.spotlight}>
          <Text style={styles.spotlightText}>{card.spotlight}</Text>
        </View>
        {card.benefits.map((b) => (
          <Bullet key={b}>{b}</Bullet>
        ))}
        <View style={styles.meta}>
          <Meta label="Annual Fee" value={card.annualFee} />
          <Meta label="Req. Income" value={`${formatInr(card.minMonthlyIncome)}/mo`} />
        </View>
        <PrimaryButton title="Check Eligibility" onPress={onCheck} variant="navy" />
      </View>
    </View>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

// Soft eligibility check against the card's income requirement, then an application request
// sent to the BookFXOrder team through the website's contact endpoint.
function EligibilitySheet({ card, onClose }: { card: CreditCard | null; onClose: () => void }) {
  const [income, setIncome] = useState('');
  const [checked, setChecked] = useState(false);
  const [name, setName] = useAccountField('name');
  const [email, setEmail] = useAccountField('email');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [trackId, setTrackId] = useState('');

  const monthly = Number(income) || 0;
  const eligible = card ? monthly >= card.minMonthlyIncome : false;
  const alternatives = CREDIT_CARDS.filter((c) => c.id !== card?.id && monthly >= c.minMonthlyIncome);

  const reset = () => {
    setIncome('');
    setChecked(false);
    setPhone('');
    setError('');
    setSent(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const check = () => {
    if (!monthly) return setError('Please enter your monthly income.');
    setError('');
    setChecked(true);
  };

  const apply = async () => {
    if (!card) return;
    if (!name.trim()) return setError('Please enter your name.');
    if (!isValidEmail(email)) return setError('Please enter a valid email address.');
    if (!isValidMobile(phone)) return setError('Please enter a valid 10-digit mobile number.');
    setError('');
    setLoading(true);
    try {
      await submitContact({
        name: name.trim(),
        email: email.trim(),
        phone: phone.replace(/\D/g, ''),
        subject: 'Credit Cards',
        message: `Credit card application request (from the mobile app): ${card.bank} ${card.name}. Monthly income: ${formatInr(monthly)}.`,
      });
      const order = await recordOrder({
        kind: 'credit-card',
        title: `${card.bank} ${card.name}`,
        subtitle: 'Credit card application',
        amountLabel: card.annualFee,
      });
      setTrackId(`order:${order.id}`);
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={!!card} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close} />
      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <KeyboardAwareScrollView contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled" bottomOffset={24}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{card?.name}</Text>
            <Pressable onPress={close} hitSlop={10} accessibilityLabel="Close">
              <Ionicons name="close" size={24} color={Colors.text} />
            </Pressable>
          </View>

          {sent ? (
            <View style={styles.result}>
              <Ionicons name="checkmark-circle" size={48} color={Colors.green} />
              <Text style={styles.resultTitle}>Request sent</Text>
              <Text style={styles.resultText}>
                Our card specialist will call you on +91 {phone.replace(/\D/g, '')} to complete your application.
              </Text>
              <PrimaryButton
                title="Track Application"
                onPress={() => {
                  const id = trackId;
                  close();
                  router.navigate({ pathname: '/track', params: { id } });
                }}
              />
            </View>
          ) : !checked ? (
            <>
              <Text style={styles.sheetText}>
                Free, no-impact check. Required income: {card ? formatInr(card.minMonthlyIncome) : ''}/month.
              </Text>
              <TextField
                label="Your Monthly Income (₹)"
                value={income}
                onChangeText={(t) => setIncome(t.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 50000"
                keyboardType="number-pad"
              />
              <ErrorText>{error}</ErrorText>
              <PrimaryButton title="Check Eligibility" onPress={check} />
            </>
          ) : eligible ? (
            <>
              <View style={[styles.banner, styles.bannerGood]}>
                <Ionicons name="checkmark-circle" size={22} color={Colors.green} />
                <Text style={[styles.bannerText, { color: Colors.green }]}>You are likely eligible for this card!</Text>
              </View>
              <TextField label="Full Name" value={name} onChangeText={setName} placeholder="Full name" />
              <TextField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
              <TextField label="Mobile Number" value={phone} onChangeText={setPhone} placeholder="10-digit mobile number" keyboardType="phone-pad" maxLength={14} />
              <ErrorText>{error}</ErrorText>
              <PrimaryButton title="Apply Now" onPress={apply} loading={loading} />
            </>
          ) : (
            <>
              <View style={[styles.banner, styles.bannerWarn]}>
                <Ionicons name="alert-circle" size={22} color={Colors.amber} />
                <Text style={[styles.bannerText, { color: Colors.amber }]}>
                  This card needs {card ? formatInr(card.minMonthlyIncome) : ''}/month income.
                </Text>
              </View>
              {alternatives.length ? (
                <>
                  <Text style={styles.sheetText}>Cards that match your income:</Text>
                  {alternatives.map((c) => (
                    <Text key={c.id} style={styles.altItem}>
                      • {c.bank} {c.name}
                    </Text>
                  ))}
                </>
              ) : (
                <Text style={styles.sheetText}>None of our partner cards match this income yet.</Text>
              )}
              <PrimaryButton title="Check Again" onPress={() => setChecked(false)} variant="navy" />
            </>
          )}
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </Modal>
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
  heroStats: {
    flexDirection: 'row',
    marginTop: 8,
  },
  heroStat: {
    flex: 1,
  },
  heroStatValue: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  filters: {
    paddingRight: 16,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardFace: {
    margin: 14,
    marginBottom: 0,
    borderRadius: 14,
    padding: 16,
    height: 150,
    justifyContent: 'space-between',
  },
  cardFaceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardBank: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  contactless: {
    transform: [{ rotate: '90deg' }],
  },
  cardDots: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 18,
    letterSpacing: 2,
  },
  cardFaceName: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  cardBody: {
    padding: 16,
    gap: 10,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  cardName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.amberBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.amber,
  },
  spotlight: {
    backgroundColor: Colors.iconBg,
    borderRadius: 10,
    padding: 10,
  },
  spotlightText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.navy,
  },
  meta: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 4,
  },
  metaItem: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 10,
  },
  metaLabel: {
    fontSize: 11,
    color: Colors.muted,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  sheetContent: {
    padding: 20,
    gap: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  sheetText: {
    fontSize: 14,
    color: Colors.muted,
    lineHeight: 20,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    padding: 14,
  },
  bannerGood: {
    backgroundColor: Colors.greenBg,
  },
  bannerWarn: {
    backgroundColor: Colors.amberBg,
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  altItem: {
    fontSize: 14,
    color: Colors.text,
  },
  result: {
    alignItems: 'center',
    gap: 10,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  resultText: {
    fontSize: 14,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
});
