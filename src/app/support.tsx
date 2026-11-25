import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, ErrorText, PrimaryButton, TextField } from '@/components/form';
import { FormScreen } from '@/components/form-screen';
import { SelectField } from '@/components/select-field';
import { Colors } from '@/constants/colors';
import { useAccountField } from '@/hooks/use-account-field';
import { OFFICE_ADDRESS, openOfficeInMaps, openWhatsAppSupport, SUPPORT_EMAIL, SUPPORT_PHONE } from '@/lib/links';
import {
  CONTACT_SUBJECTS,
  isValidEmail,
  isValidMobile,
  submitContact,
  type ContactSubject,
} from '@/lib/services-api';

type Channel = {
  title: string;
  detail: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
};

const CHANNELS: Channel[] = [
  {
    title: 'Call Us',
    detail: '+91 88001 07428',
    icon: 'call',
    color: Colors.navy,
    onPress: () => Linking.openURL(`tel:${SUPPORT_PHONE}`),
  },
  {
    title: 'WhatsApp Support',
    detail: 'We usually reply within minutes',
    icon: 'logo-whatsapp',
    color: '#25D366',
    onPress: openWhatsAppSupport,
  },
  {
    title: 'Email Us',
    detail: SUPPORT_EMAIL,
    icon: 'mail',
    color: Colors.red,
    onPress: () => Linking.openURL(`mailto:${SUPPORT_EMAIL}`),
  },
];

export default function SupportScreen() {
  const params = useLocalSearchParams<{ subject?: ContactSubject }>();
  const [name, setName] = useAccountField('name');
  const [email, setEmail] = useAccountField('email');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState<ContactSubject>(
    params.subject && CONTACT_SUBJECTS.includes(params.subject) ? params.subject : CONTACT_SUBJECTS[0],
  );
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const send = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim())
      return setError('Please fill in all required fields.');
    if (!isValidEmail(email)) return setError('Please enter a valid email address.');
    if (!isValidMobile(phone)) return setError('Please enter a valid 10-digit mobile number.');
    setError('');
    setLoading(true);
    try {
      await submitContact({
        name: name.trim(),
        email: email.trim(),
        phone: phone.replace(/\D/g, ''),
        subject,
        message: message.trim(),
      });
      setSent(true);
      setMessage('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormScreen title="Contact & Support">
      <View style={styles.hero}>
        <Ionicons name="headset" size={34} color={Colors.white} />
        <Text style={styles.heroTitle}>We&apos;re here to help</Text>
        <Text style={styles.heroText}>
          Questions about remittance, digital signatures, loans or cards? Reach our team any way you like.
        </Text>
      </View>

      {CHANNELS.map((c) => (
        <Pressable key={c.title} style={({ pressed }) => [styles.channel, pressed && styles.pressed]} onPress={c.onPress}>
          <View style={[styles.icon, { backgroundColor: `${c.color}1A` }]}>
            <Ionicons name={c.icon} size={22} color={c.color} />
          </View>
          <View style={styles.body}>
            <Text style={styles.title}>{c.title}</Text>
            <Text style={styles.detail}>{c.detail}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.text} />
        </Pressable>
      ))}

      <Card title="Our Branch">
        <View style={styles.office}>
          <Ionicons name="business" size={22} color={Colors.navy} />
          <View style={styles.body}>
            <Text style={styles.title}>BookFXOrder Head Office</Text>
            <Text style={styles.address}>{OFFICE_ADDRESS}</Text>
            <Text style={styles.detail}>Walk-ins welcome · Mon–Sat</Text>
          </View>
        </View>
        <PrimaryButton title="Get Directions" onPress={openOfficeInMaps} variant="navy" />
      </Card>

      <Card title="Send Us a Message">
        {sent ? (
          <View style={styles.sent}>
            <Ionicons name="checkmark-circle" size={22} color={Colors.green} />
            <Text style={styles.sentText}>Message sent! Our team will get back to you shortly.</Text>
          </View>
        ) : null}
        <TextField label="Full Name" value={name} onChangeText={setName} placeholder="Your name" />
        <TextField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
        <TextField label="Mobile Number" value={phone} onChangeText={setPhone} placeholder="10-digit mobile number" keyboardType="phone-pad" maxLength={14} />
        <SelectField
          label="Subject"
          placeholder="Select subject"
          value={subject}
          options={CONTACT_SUBJECTS.map((s) => ({ value: s, label: s }))}
          onChange={setSubject}
        />
        <TextField label="Your Message" value={message} onChangeText={setMessage} placeholder="How can we help?" multiline />
        <ErrorText>{error}</ErrorText>
        <PrimaryButton title="Send Message" onPress={send} loading={loading} />
      </Card>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: Colors.navy,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  heroTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  heroText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  channel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
  },
  pressed: {
    opacity: 0.8,
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  detail: {
    fontSize: 12,
    color: Colors.muted,
  },
  office: {
    flexDirection: 'row',
    gap: 12,
  },
  address: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.text,
  },
  sent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.greenBg,
    borderRadius: 10,
    padding: 12,
  },
  sentText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.green,
  },
});
