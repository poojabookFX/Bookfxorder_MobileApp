import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { Colors } from '@/constants/colors';

type Service = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: Href;
};

// The services bookfxorder.com offers today.
const SERVICES: Service[] = [
  {
    title: 'DSC Calculator',
    subtitle: 'Calculate your DSC cost',
    icon: 'calculator',
    color: '#F59E0B',
    route: '/dsc-calculator',
  },
  {
    title: 'Indo-Nepal Money Transfer',
    subtitle: 'Send money across borders',
    icon: 'swap-horizontal',
    color: Colors.red,
    route: '/transfer',
  },
  {
    title: 'Digital Signature',
    subtitle: 'Apply for a Class 3 DSC online',
    icon: 'finger-print',
    color: '#2563EB',
    route: '/digital-signature',
  },
  {
    title: 'Loans',
    subtitle: 'Personal, business & study loans',
    icon: 'cash',
    color: '#F97316',
    route: '/loans',
  },
  {
    title: 'Credit Cards',
    subtitle: 'Premium cards with rewards',
    icon: 'card',
    color: '#0EA5E9',
    route: '/credit-cards',
  },
  {
    title: 'Supply Chain Finance',
    subtitle: 'Working capital against invoices',
    icon: 'document-text',
    color: '#334155',
    route: '/supply-chain-finance',
  },
  {
    title: 'Other Services',
    subtitle: 'Talk to us about anything else',
    icon: 'grid',
    color: '#C026D3',
    route: '/support',
  },
];

export default function ServicesScreen() {
  const open = (service: Service) => {
    router.push(service.route);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="All Services" back />
      <ScrollView contentContainerStyle={styles.list}>
        {SERVICES.map((service) => (
          <Pressable
            key={service.title}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            onPress={() => open(service)}>
            <View style={[styles.icon, { backgroundColor: `${service.color}1A` }]}>
              <Ionicons name={service.icon} size={22} color={service.color} />
            </View>
            <View style={styles.body}>
              <Text style={styles.title}>{service.title}</Text>
              <Text style={styles.subtitle}>{service.subtitle}</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.text}
            />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    shadowColor: Colors.navy,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  pressed: {
    opacity: 0.8,
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.muted,
  },
});
