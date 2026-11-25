import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { Colors } from '@/constants/colors';

// Small building blocks shared by the service forms.

export function TextField({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={Colors.muted}
        {...props}
        style={[styles.input, props.multiline && styles.multiline, props.style]}
      />
    </View>
  );
}

type Choice<T extends string> = { value: T; label: string };

// A row of pill buttons for picking one option.
export function ChipGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: T;
  options: readonly Choice<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.chips}>
        {options.map((o) => {
          const active = o.value === value;
          return (
            <Pressable
              key={o.value}
              onPress={() => onChange(o.value)}
              style={[styles.chip, active && styles.chipActive]}
              accessibilityState={{ selected: active }}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
  variant = 'red',
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'red' | 'navy';
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        variant === 'navy' && styles.buttonNavy,
        (pressed || loading) && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={loading || disabled}>
      {loading ? (
        <ActivityIndicator color={Colors.white} />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </Pressable>
  );
}

export function ErrorText({ children }: { children: string }) {
  return children ? <Text style={styles.error}>{children}</Text> : null;
}

export function Card({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <View style={styles.card}>
      {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}

export function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, strong && styles.summaryStrong]}>{value}</Text>
    </View>
  );
}

export function Bullet({ children }: { children: string }) {
  return (
    <View style={styles.bullet}>
      <Ionicons name="checkmark-circle" size={18} color={Colors.green} />
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

// Full-screen confirmation shown after a form is submitted.
export function SuccessView({
  title,
  message,
  code,
  actionTitle,
  onAction,
}: {
  title: string;
  message: string;
  code?: string;
  actionTitle: string;
  onAction: () => void;
}) {
  return (
    <View style={styles.success}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark" size={40} color={Colors.white} />
      </View>
      <Text style={styles.successTitle}>{title}</Text>
      {code ? (
        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>Reference Code</Text>
          <Text selectable style={styles.code}>
            {code}
          </Text>
        </View>
      ) : null}
      <Text style={styles.successText}>{message}</Text>
      <View style={styles.successAction}>
        <PrimaryButton title={actionTitle} onPress={onAction} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.45,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  input: {
    minHeight: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Colors.text,
  },
  multiline: {
    minHeight: 96,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  chipActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  chipTextActive: {
    color: Colors.white,
  },
  button: {
    alignSelf: 'stretch',
    backgroundColor: Colors.red,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonNavy: {
    backgroundColor: Colors.navy,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
  error: {
    color: Colors.red,
    fontSize: 13,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.muted,
  },
  summaryValue: {
    flexShrink: 1,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  summaryStrong: {
    fontSize: 17,
    fontWeight: '800',
  },
  bullet: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text,
  },
  success: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  codeBox: {
    alignItems: 'center',
    backgroundColor: Colors.iconBg,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  codeLabel: {
    fontSize: 12,
    color: Colors.muted,
  },
  code: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.navy,
    letterSpacing: 1,
  },
  successText: {
    fontSize: 15,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  successAction: {
    alignSelf: 'stretch',
    marginTop: 12,
  },
});
