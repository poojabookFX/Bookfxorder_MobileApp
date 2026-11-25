import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';

type Props = {
  title: string;
  back?: boolean;
  right?: ReactNode;
};

export function ScreenHeader({ title, back, right }: Props) {
  return (
    <View style={styles.row}>
      {back ? (
        <Pressable
          hitSlop={12}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
          accessibilityLabel="Go back"
          style={styles.side}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
      ) : null}
      <Text style={[styles.title, back && styles.centered]} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.white,
  },
  side: {
    minWidth: 32,
  },
  right: {
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    fontSize: 19,
    fontWeight: '700',
    color: Colors.text,
  },
  centered: {
    textAlign: 'center',
  },
});
