import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { KIND_ICONS, type Activity } from '@/lib/activity';
import type { StepState } from '@/lib/api';

const PILL_COLORS: Record<StepState, { bg: string; fg: string }> = {
  done: { bg: Colors.greenBg, fg: Colors.green },
  pending: { bg: Colors.amberBg, fg: Colors.amber },
  failed: { bg: Colors.redBg, fg: Colors.red },
};

export function StatusPill({ state, label }: { state: StepState; label: string }) {
  const colors = PILL_COLORS[state];
  return (
    <View style={[styles.pill, { backgroundColor: colors.bg }]}>
      <Text style={[styles.pillText, { color: colors.fg }]}>{label}</Text>
    </View>
  );
}

type Props = {
  item: Activity;
  onPress?: () => void;
};

export function ActivityRow({ item, onPress }: Props) {
  const date = new Date(item.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && onPress && styles.pressed]}
      onPress={onPress}
      disabled={!onPress}>
      <View style={styles.icon}>
        <Ionicons name={KIND_ICONS[item.kind]} size={16} color={Colors.navy} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        {item.amountLabel ? <Text style={styles.amount}>{item.amountLabel}</Text> : null}
        <Text style={styles.muted} numberOfLines={1}>
          {item.subtitle ? `${item.subtitle} · ` : ''}
          {date}
        </Text>
      </View>
      <StatusPill state={item.state} label={item.statusLabel} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  pressed: {
    opacity: 0.7,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  muted: {
    fontSize: 12,
    color: Colors.muted,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
