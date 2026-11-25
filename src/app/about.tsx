import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/form';
import { FormScreen } from '@/components/form-screen';
import { Logo } from '@/components/logo';
import { Colors } from '@/constants/colors';

// Content from bookfxorder.com/about.

const STATS = [
  { value: '50K+', label: 'Customers' },
  { value: '7+', label: 'Services' },
  { value: 'RBI', label: 'Licensed FFMC' },
];

const VALUES: { title: string; text: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  {
    title: 'Security First',
    text: 'Every transaction and application runs through RBI-compliant, encrypted channels.',
    icon: 'shield-checkmark',
  },
  {
    title: 'Speed & Simplicity',
    text: 'From a remittance to Nepal to a DSC, we cut the paperwork so you finish in minutes.',
    icon: 'flash',
  },
  {
    title: 'Customer First',
    text: 'Every decision — from pricing to support — starts with what is best for our customers.',
    icon: 'people',
  },
  {
    title: 'Transparency',
    text: 'No hidden charges and no confusing fine print. Clear pricing and honest timelines.',
    icon: 'eye',
  },
];

const COMPLIANCE = [
  'RBI Licensed FFMC — License No. KAN-FFMC-0416-2024',
  'CCA Approved Class 3 Digital Signature provider',
  'KYC verified operations for every transaction',
  'End-to-end encrypted customer data',
];

export default function AboutScreen() {
  return (
    <FormScreen title="About BookFXOrder">
      <View style={styles.logoCard}>
        <Logo width={220} />
        <Text style={styles.tagline}>Your Trusted Partner for a Brighter Financial Future</Text>
      </View>

      <View style={styles.stats}>
        {STATS.map((s) => (
          <View key={s.label} style={styles.stat}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Card title="Our Story">
        <Text style={styles.paragraph}>
          BookFXOrder was created with a simple purpose — to make financial and digital services easier to access,
          understand, and complete. Operated by FXpertise Solution Pvt. Ltd. from New Delhi, our platform brings
          essential services together in one convenient digital experience.
        </Text>
        <Text style={styles.paragraph}>
          From Indo-Nepal remittance and Digital Signature Certificates to loans, credit cards and supply chain
          finance, we focus on making every interaction clearer and more convenient.
        </Text>
      </Card>

      <Card title="Our Mission & Values">
        {VALUES.map((v) => (
          <View key={v.title} style={styles.value}>
            <View style={styles.valueIcon}>
              <Ionicons name={v.icon} size={20} color={Colors.navy} />
            </View>
            <View style={styles.valueBody}>
              <Text style={styles.valueTitle}>{v.title}</Text>
              <Text style={styles.valueText}>{v.text}</Text>
            </View>
          </View>
        ))}
      </Card>

      <Card title="Trust & Compliance">
        {COMPLIANCE.map((c) => (
          <View key={c} style={styles.compliance}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.green} />
            <Text style={styles.complianceText}>{c}</Text>
          </View>
        ))}
      </Card>

      <Text style={styles.footer}>© 2026 BookFXOrder · FXpertise Solution Pvt. Ltd.</Text>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  logoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.navy,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    flex: 1,
    backgroundColor: Colors.navy,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statValue: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    marginTop: 2,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.text,
  },
  value: {
    flexDirection: 'row',
    gap: 12,
  },
  valueIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueBody: {
    flex: 1,
    gap: 2,
  },
  valueTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  valueText: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.muted,
  },
  compliance: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  complianceText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text,
  },
  footer: {
    fontSize: 12,
    color: Colors.muted,
    textAlign: 'center',
  },
});
