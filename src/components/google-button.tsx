import Ionicons from '@expo/vector-icons/Ionicons';
import { isRunningInExpoGo } from 'expo';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text } from 'react-native';

import { Colors } from '@/constants/colors';
import { authClient } from '@/lib/auth-client';

type Props = {
  onError: (message: string) => void;
};

// Google is the only social provider enabled on bookfxorder.com (Facebook and Apple return
// PROVIDER_NOT_FOUND). The website only accepts callbacks to the app's own scheme
// (bookfxorderapp://), so this works in a development or store build, not in Expo Go or on web.
function unsupportedReason() {
  if (Platform.OS === 'web') {
    return 'Google sign-in works in the Android and iOS app. On the web, please use email and password.';
  }
  // executionEnvironment is 'storeClient' in development builds too, so check for Expo Go itself.
  if (isRunningInExpoGo()) {
    return 'Google sign-in needs the installed BookFX app, not Expo Go. For now, tap "Login with Email Code" and enter your Google email: no password needed.';
  }
  return null;
}

export function GoogleButton({ onError }: Props) {
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    const reason = unsupportedReason();
    if (reason) return onError(reason);

    onError('');
    setLoading(true);
    try {
      // The Expo plugin opens Google in an auth session and stores the session cookie on return.
      // Without errorCallbackURL the website sends failures to its own error page and the user
      // is stranded in the browser. On Android the auth session only closes for links starting
      // with callbackURL, so the root ('/' -> bookfxorderapp://) is used to cover both
      // bookfxorderapp://?cookie=... (success) and bookfxorderapp://login?error=... (failure).
      const { error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
        newUserCallbackURL: '/',
        errorCallbackURL: '/login',
      });
      if (error) return onError(error.message || 'Google sign-in failed. Please try again.');

      const { data } = await authClient.getSession();
      // No session means the user closed the browser before finishing.
      if (data) router.replace('/home');
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.button, (pressed || loading) && styles.pressed]}
      onPress={signIn}
      disabled={loading}
      accessibilityLabel="Continue with Google">
      {loading ? (
        <ActivityIndicator color={Colors.text} />
      ) : (
        <>
          <Ionicons name="logo-google" size={20} color="#EA4335" />
          <Text style={styles.text}>Continue with Google</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    gap: 10,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
});
