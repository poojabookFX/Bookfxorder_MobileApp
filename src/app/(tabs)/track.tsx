import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { ActivityRow } from '@/components/transfer-row';
import { Colors } from '@/constants/colors';
import { useActivity } from '@/hooks/use-activity';
import { orderSteps, transferSteps, type Activity, type Step } from '@/lib/activity';

const DONE_MESSAGES: Record<Activity['kind'], string> = {
  transfer: 'Your money has been delivered!',
  loan: 'Your loan amount has been disbursed!',
  dsc: 'Your Digital Signature is ready!',
  'credit-card': 'Your card has been approved!',
  scf: 'Your financing has been disbursed!',
};

export default function TrackScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { items, error, refreshing, refresh } = useActivity();
  const selected = items?.find((a) => a.key === id) ?? items?.[0];
  const others = (items ?? []).filter((a) => a.key !== selected?.key).slice(0, 5);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Application Tracking" />
      {items === null ? (
        <ActivityIndicator style={styles.flex} color={Colors.navy} />
      ) : !selected ? (
        <View style={styles.empty}>
          <Ionicons name="search" size={48} color={Colors.navy} />
          <Text style={styles.muted}>{error || 'Nothing to track yet'}</Text>
          <Pressable style={styles.button} onPress={() => router.push('/services')}>
            <Text style={styles.buttonText}>Explore Services</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
          <View style={styles.summary}>
            <View style={styles.flex}>
              <Text style={styles.summaryLabel}>{selected.title}</Text>
              <Text style={styles.summaryAmount}>{selected.amountLabel || selected.statusLabel}</Text>
              {selected.subtitle ? <Text style={styles.summaryLabel}>{selected.subtitle}</Text> : null}
            </View>
            <Reference item={selected} />
          </View>

          <Timeline steps={selected.transfer ? transferSteps(selected.transfer) : orderSteps(selected.order!)} />

          {selected.state === 'done' ? (
            <View style={styles.banner}>
              <Ionicons name="checkmark-circle" size={30} color={Colors.green} />
              <Text style={styles.bannerText}>{DONE_MESSAGES[selected.kind]}</Text>
            </View>
          ) : selected.order && selected.kind !== 'loan' ? (
            <Text style={styles.note}>
              Our team will contact you by phone and email at each step. Pull down to refresh.
            </Text>
          ) : null}

          {others.length ? (
            <View style={styles.others}>
              <Text style={styles.sectionTitle}>Your Other Orders</Text>
              {others.map((a) => (
                <ActivityRow
                  key={a.key}
                  item={a}
                  onPress={() => router.setParams({ id: a.key })}
                />
              ))}
              {(items?.length ?? 0) > others.length + 1 ? (
                <Pressable style={styles.link} onPress={() => router.navigate('/history')}>
                  <Text style={styles.linkText}>View all orders</Text>
                  <Ionicons name="arrow-forward" size={14} color={Colors.red} />
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Reference({ item }: { item: Activity }) {
  const value = item.transfer?.trackingNumber ?? item.order?.reference;
  if (!value) return null;
  return (
    <View style={styles.reference}>
      <Text style={styles.summaryLabel}>{item.transfer ? 'Tracking No.' : 'Reference'}</Text>
      <Text selectable style={styles.referenceValue}>
        {value}
      </Text>
    </View>
  );
}

function Timeline({ steps }: { steps: Step[] }) {
  // Highlight the latest completed step, like the design's green "Approved" row.
  const current = steps.map((s) => s.state).lastIndexOf('done');
  return (
    <View style={styles.timeline}>
      {steps.map((step, i) => (
        <View key={step.title} style={[styles.step, i === current && styles.stepCurrent]}>
          <View style={styles.rail}>
            <View style={[styles.dot, dotStyle[step.state]]}>
              {step.state === 'done' ? <Ionicons name="checkmark" size={14} color={Colors.white} /> : null}
              {step.state === 'failed' ? <Ionicons name="close" size={14} color={Colors.white} /> : null}
            </View>
            {i < steps.length - 1 ? <View style={[styles.line, step.state === 'done' && styles.lineDone]} /> : null}
          </View>
          <View style={styles.stepBody}>
            <Text style={[styles.stepTitle, i === current && { color: Colors.green }]}>{step.title}</Text>
            <Text style={styles.muted}>{step.detail}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const dotStyle = StyleSheet.create({
  done: { backgroundColor: Colors.green },
  pending: { backgroundColor: Colors.border },
  failed: { backgroundColor: Colors.red },
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  muted: {
    fontSize: 13,
    color: Colors.muted,
  },
  button: {
    backgroundColor: Colors.red,
    paddingHorizontal: 28,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  summary: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: Colors.navy,
    borderRadius: 14,
    padding: 16,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
  },
  summaryAmount: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '800',
    marginVertical: 2,
  },
  reference: {
    alignItems: 'flex-end',
    maxWidth: '45%',
  },
  referenceValue: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  timeline: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
  },
  step: {
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  stepCurrent: {
    backgroundColor: Colors.greenBg,
  },
  rail: {
    alignItems: 'center',
    paddingTop: 12,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    flex: 1,
    width: 2,
    minHeight: 28,
    backgroundColor: Colors.border,
  },
  lineDone: {
    backgroundColor: Colors.green,
  },
  stepBody: {
    flex: 1,
    paddingVertical: 12,
    gap: 3,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.greenBg,
    borderRadius: 14,
    padding: 18,
  },
  bannerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.green,
  },
  note: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.muted,
    textAlign: 'center',
  },
  others: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  linkText: {
    color: Colors.red,
    fontWeight: '600',
    fontSize: 14,
  },
});
