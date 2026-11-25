import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { ActivityRow } from '@/components/transfer-row';
import { Colors } from '@/constants/colors';
import { useActivity } from '@/hooks/use-activity';
import { formatInr, statusState } from '@/lib/api';
import { useSession } from '@/lib/auth-client';

type Action = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

const ACTIONS: Action[] = [
  { label: 'Send Money', icon: 'paper-plane', onPress: () => router.push('/transfer') },
  { label: 'Track Order', icon: 'search', onPress: () => router.navigate('/track') },
  { label: 'DSC Calc', icon: 'calculator', onPress: () => router.push('/dsc-calculator') },
  { label: 'Support', icon: 'headset', onPress: () => router.push('/support') },
];

// The design's "Dashboard": account summary, quick actions and everything the user has ordered.
export default function HistoryScreen() {
  const { data: session } = useSession();
  const { items, transfers, error, refreshing, refresh } = useActivity();

  // Failed transfers never moved money, so leave them out of the total.
  const total = transfers
    .filter((t) => statusState(t.paymentStatus) !== 'failed')
    .reduce((sum, t) => sum + t.amountInr, 0);

  const header = (
    <View style={styles.headerContent}>
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={28} color={Colors.white} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.userName}>{session?.user.name ?? 'Guest'}</Text>
          <Text style={styles.muted}>{session?.user.email ?? ''}</Text>
        </View>
        <Pressable style={styles.viewProfile} onPress={() => router.navigate('/profile')}>
          <Text style={styles.viewProfileText}>View Profile</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.navy} />
        </Pressable>
      </View>

      <View style={styles.totalCard}>
        <View>
          <Text style={styles.totalLabel}>Total Money Sent</Text>
          <Text style={styles.totalValue}>{formatInr(total)}</Text>
        </View>
        <Ionicons name="stats-chart" size={30} color="#5B8DEF" />
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actions}>
        {ACTIONS.map((action) => (
          <Pressable key={action.label} style={styles.action} onPress={action.onPress}>
            <View style={styles.actionIcon}>
              <Ionicons name={action.icon} size={20} color={Colors.navy} />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Recent Activity</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Dashboard" />
      {items === null ? (
        <ActivityIndicator style={styles.flex} color={Colors.navy} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.list}
          ListHeaderComponent={header}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="time" size={40} color={Colors.navy} />
              <Text style={styles.muted}>{items.length === 0 && error ? error : 'No orders yet'}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <ActivityRow
              item={item}
              onPress={() => router.navigate({ pathname: '/track', params: { id: item.key } })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: 16,
    gap: 10,
  },
  headerContent: {
    gap: 14,
    marginBottom: 2,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#8A94A6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  muted: {
    fontSize: 13,
    color: Colors.muted,
  },
  viewProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-end',
  },
  viewProfileText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.navy,
  },
  totalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.navy,
    borderRadius: 14,
    padding: 18,
  },
  totalLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  totalValue: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  action: {
    alignItems: 'center',
    gap: 6,
    width: '24%',
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  empty: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 32,
  },
});
