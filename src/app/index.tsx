import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Logo } from '@/components/logo';
import { Colors } from '@/constants/colors';
import { authClient } from '@/lib/auth-client';

const SPLASH_DURATION = 2500;

export default function SplashScreen() {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: SPLASH_DURATION,
      useNativeDriver: false,
    }).start();

    // Skip the login screen when a saved session is still valid.
    // A network failure (offline, server down) just means "not signed in" here.
    const session = authClient.getSession().catch(() => ({ data: null }));
    const timer = setTimeout(async () => {
      const { data } = await session;
      router.replace(data ? '/home' : '/login');
    }, SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, [progress]);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.logoCard}>
        <Logo width={260} />
      </View>
      <Text style={styles.tagline}>Fast • Secure • Reliable</Text>
      <View style={styles.track}>
        <Animated.View style={[styles.bar, { width }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  tagline: {
    marginTop: 16,
    color: Colors.white,
    fontSize: 15,
    fontWeight: '500',
  },
  track: {
    position: 'absolute',
    bottom: 60,
    width: 130,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: Colors.red,
  },
});
