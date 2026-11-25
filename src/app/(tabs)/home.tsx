import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BannerSlider } from '@/components/banner-slider';
import { Logo } from '@/components/logo';
import { Colors } from '@/constants/colors';

type Service = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

const SERVICES: Service[] = [
  { label: 'DSC\nCalculator', icon: 'calculator', onPress: () => router.push('/dsc-calculator') },
  { label: 'Indo-Nepal\nTransfer', icon: 'swap-horizontal', onPress: () => router.push('/transfer') },
  { label: 'All Services', icon: 'apps', onPress: () => router.push('/services') },
  { label: 'Track\nApplication', icon: 'search', onPress: () => router.navigate('/track') },
  { label: 'Our Branches', icon: 'location', onPress: () => router.push('/support') },
  { label: 'Support', icon: 'headset', onPress: () => router.push('/support') },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable hitSlop={10} onPress={() => router.push('/services')} accessibilityLabel="All services">
          <Ionicons name="menu" size={26} color={Colors.text} />
        </Pressable>
        <Logo width={170} />
        <Pressable hitSlop={10} onPress={() => router.navigate('/history')} accessibilityLabel="Activity">
          <Ionicons name="notifications" size={22} color={Colors.navy} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BannerSlider />

        <View style={styles.grid}>
          {SERVICES.map((service) => (
            <Pressable
              key={service.label}
              style={({ pressed }) => [styles.serviceCard, pressed && styles.pressed]}
              onPress={service.onPress}>
              <View style={styles.serviceIcon}>
                <Ionicons name={service.icon} size={22} color={Colors.navy} />
              </View>
              <Text style={styles.serviceLabel}>{service.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest Offers</Text>
          <Pressable style={styles.viewAll} onPress={() => router.push('/services')}>
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="arrow-forward" size={12} color={Colors.red} />
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [styles.offer, pressed && styles.pressed]}
          onPress={() => router.push('/transfer')}>
          <View style={styles.offerText}>
            <Text style={styles.offerTitle}>Get ₹50 Cashback</Text>
            <Text style={styles.offerSubtitle}>on Your First Transfer</Text>
          </View>
          <Text style={styles.offerEmoji}>🎁</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.white,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  pressed: {
    opacity: 0.8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  serviceCard: {
    width: '31.5%',
    aspectRatio: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 8,
    shadowColor: Colors.navy,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    color: Colors.red,
    fontSize: 13,
    fontWeight: '600',
  },
  offer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E4FD8',
    borderRadius: 16,
    padding: 18,
  },
  offerText: {
    flex: 1,
  },
  offerTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  offerSubtitle: {
    color: Colors.white,
    fontSize: 14,
    marginTop: 2,
  },
  offerEmoji: {
    fontSize: 44,
  },
});
