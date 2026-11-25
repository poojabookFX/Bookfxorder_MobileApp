import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { Colors } from '@/constants/colors';

type Props = {
  title: string;
  children: ReactNode;
  // Render children without the scroll view (e.g. a success screen).
  plain?: boolean;
};

// Stack screen layout: back header + keyboard-aware scrolling content.
export function FormScreen({ title, children, plain }: Props) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title={title} back />
      {plain ? (
        children
      ) : (
        // Scrolls the focused input above the keyboard (Android edge-to-edge no longer resizes
        // the window for the keyboard, so a plain ScrollView leaves inputs hidden behind it).
        <KeyboardAwareScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          bottomOffset={24}>
          {children}
        </KeyboardAwareScrollView>
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
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
});
