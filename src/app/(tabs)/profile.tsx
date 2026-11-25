import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import { router, type Href } from 'expo-router';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { Colors } from '@/constants/colors';
import { useActivity } from '@/hooks/use-activity';
import { authClient, useSession } from '@/lib/auth-client';

type Item = {
  label: string;
  hint?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: Href;
  navigate?: boolean;
};

const SECTIONS: { title: string; items: Item[] }[] = [
  {
    title: 'Account',
    items: [
      { label: 'Edit Profile', hint: 'Name and contact details', icon: 'person-outline', color: Colors.navy, route: '/edit-profile' },
      { label: 'Change Password', hint: 'Keep your account secure', icon: 'lock-closed-outline', color: '#7C3AED', route: '/change-password' },
    ],
  },
  {
    title: 'My Activity',
    items: [
      { label: 'Track Applications', icon: 'receipt-outline', color: Colors.amber, route: '/track', navigate: true },
      { label: 'Transaction History', icon: 'swap-horizontal-outline', color: Colors.green, route: '/history', navigate: true },
      { label: 'All Services', icon: 'apps-outline', color: '#1E4FD8', route: '/services' },
    ],
  },
  {
    title: 'Help & Info',
    items: [
      { label: 'Help & Support', icon: 'headset-outline', color: Colors.red, route: '/support' },
      { label: 'About BookFXOrder', icon: 'information-circle-outline', color: Colors.navy, route: '/about' },
      { label: 'Privacy Policy', icon: 'shield-checkmark-outline', color: Colors.green, route: '/privacy-policy' },
    ],
  },
];

function memberSince(createdAt?: string | Date) {
  if (!createdAt) return '';
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return '';
  return `Member since ${d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`;
}

export default function ProfileScreen() {
  const { data: session } = useSession();
  const { items } = useActivity();
  const user = session?.user;

  const transfers = items?.filter((a) => a.kind === 'transfer').length;
  const applications = items?.filter((a) => a.kind !== 'transfer').length;
  const pending = items?.filter((a) => a.state === 'pending').length;

  const logout = async () => {
    const doLogout = async () => {
      await authClient.signOut();
      router.replace('/login');
    };
    // Alert buttons aren't supported on web.
    if (Platform.OS === 'web') return doLogout();
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: doLogout },
    ]);
  };

  const open = (item: Item) => (item.navigate ? router.navigate(item.route) : router.push(item.route));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <Text style={styles.heroTitle}>My Profile</Text>
            <Pressable
              hitSlop={10}
              onPress={() => router.push('/edit-profile')}
              accessibilityLabel="Edit profile"
              style={styles.heroEdit}>
              <Ionicons name="create-outline" size={20} color={Colors.white} />
            </Pressable>
          </View>

          <Pressable style={styles.avatarWrap} onPress={() => router.push('/edit-profile')}>
            <Avatar name={user?.name ?? ''} image={user?.image} size={88} />
            <View style={styles.avatarBadge}>
              <Ionicons name="pencil" size={12} color={Colors.white} />
            </View>
          </Pressable>

          <Text style={styles.name}>{user?.name || 'BookFX User'}</Text>
          <View style={styles.emailRow}>
            <Text style={styles.email}>{user?.email ?? ''}</Text>
            {user?.emailVerified ? <Ionicons name="checkmark-circle" size={15} color="#4ADE80" /> : null}
          </View>
          {user?.phoneNumber ? <Text style={styles.meta}>{user.phoneNumber}</Text> : null}
          {memberSince(user?.createdAt) ? <Text style={styles.meta}>{memberSince(user?.createdAt)}</Text> : null}
        </View>

        <View style={styles.stats}>
          <Stat label="Transfers" value={transfers} icon="paper-plane" onPress={() => router.navigate('/history')} />
          <View style={styles.statDivider} />
          <Stat label="Applications" value={applications} icon="document-text" onPress={() => router.navigate('/track')} />
          <View style={styles.statDivider} />
          <Stat label="Pending" value={pending} icon="time" onPress={() => router.navigate('/track')} />
        </View>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menu}>
              {section.items.map((item, i) => (
                <Pressable
                  key={item.label}
                  style={({ pressed }) => [
                    styles.menuRow,
                    i < section.items.length - 1 && styles.menuDivider,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => open(item)}>
                  <View style={[styles.menuIcon, { backgroundColor: `${item.color}1A` }]}>
                    <Ionicons name={item.icon} size={19} color={item.color} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    {item.hint ? <Text style={styles.menuHint}>{item.hint}</Text> : null}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        <Pressable style={({ pressed }) => [styles.logout, pressed && styles.pressed]} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.red} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

        <Text style={styles.version}>BookFXOrder v{Constants.expoConfig?.version ?? '1.0.0'}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({
  label,
  value,
  icon,
  onPress,
}: {
  label: string;
  value: number | undefined;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.stat, pressed && styles.pressed]} onPress={onPress}>
      <Ionicons name={icon} size={18} color={Colors.red} />
      <Text style={styles.statValue}>{value ?? '–'}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 32,
  },
  pressed: {
    opacity: 0.7,
  },
  hero: {
    backgroundColor: Colors.navy,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 56,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroTop: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  heroEdit: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrap: {
    marginBottom: 12,
  },
  avatarBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.red,
    borderWidth: 2,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '800',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  email: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
  },
  meta: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    marginTop: 4,
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: -36,
    borderRadius: 18,
    paddingVertical: 14,
    shadowColor: Colors.navy,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.muted,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  menu: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
  },
  menuDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  menuHint: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 1,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 24,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.redBg,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.red,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.muted,
    marginTop: 16,
  },
});
