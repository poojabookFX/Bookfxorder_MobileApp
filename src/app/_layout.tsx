import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { Colors } from '@/constants/colors';

// The screens are designed for phones. On a wide browser window they stretch (e.g. the square
// service cards grow huge), so on web the app is shown in a centred phone-width column.
const WEB_MAX_WIDTH = 480;

export default function RootLayout() {
  // Web (server output): the server renders icons, but in the browser an icon renders empty
  // until its font is on the page, so hydration fails. Loading the font here makes the server
  // put its @font-face rule in the HTML, so the browser sees it as loaded on the first render.
  // Don't wait for `loaded` before rendering: that would itself differ between server and browser.
  useFonts(Ionicons.font);

  const stack = <Stack screenOptions={{ headerShown: false }} />;

  return (
    <KeyboardProvider>
      <StatusBar style="dark" />
      {Platform.OS === 'web' ? (
        <View style={styles.webPage}>
          <View style={styles.webPhone}>{stack}</View>
        </View>
      ) : (
        stack
      )}
    </KeyboardProvider>
  );
}

const styles = StyleSheet.create({
  webPage: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.border,
  },
  webPhone: {
    flex: 1,
    width: '100%',
    maxWidth: WEB_MAX_WIDTH,
    overflow: 'hidden',
    backgroundColor: Colors.background,
    boxShadow: '0 0 24px rgba(11, 31, 92, 0.12)',
  },
});
