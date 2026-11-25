import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/form';
import { FormScreen } from '@/components/form-screen';
import { Colors } from '@/constants/colors';

// Text from bookfxorder.com/privacy-policy (last updated September 23, 2026).

type Section = { title: string; body?: string; points?: string[] };

const SECTIONS: Section[] = [
  {
    title: 'Introduction',
    body: 'BookFxOrder (operated by FXpertise Solution Pvt. Ltd., "we", "us", or "our") respects your privacy and is committed to protecting the personal information of everyone who uses our services — including Indo-Nepal money transfers, Digital Signature Certificates (DSC), education and personal loans, credit card assistance, and supply chain finance. By using our services, you agree to the practices described in this policy.',
  },
  {
    title: 'Information We Collect',
    points: [
      'Personal details — name, date of birth, gender, address, email address, and mobile number.',
      'Identity & KYC documents — PAN, Aadhaar, passport, or other government-issued ID and address proof submitted for regulatory verification.',
      'Financial information — bank account details, income details, and transaction history required to process remittances, loan applications, or DSC issuance.',
      'Technical data — IP address, device information, and cookies collected automatically.',
      'Communication data — messages you send us through our contact form, email, phone, or WhatsApp.',
    ],
  },
  {
    title: 'How We Use Your Information',
    points: [
      'To process remittances, loan applications, DSC issuance, credit card referrals, and supply chain finance requests.',
      'To verify your identity and comply with RBI and other applicable KYC/AML requirements.',
      'To communicate with you about your application, order status, or support queries.',
      'To improve our services and overall customer experience.',
      'To send service updates or promotional communication where you have opted in — you may opt out at any time.',
      'To detect, investigate, and prevent fraud, unauthorized access, or misuse of our services.',
    ],
  },
  {
    title: 'How We Share Your Information',
    body: 'We share personal information only where necessary, and never sell it for third-party marketing purposes.',
    points: [
      'With banking, NBFC, and financial partners solely to process your remittance, loan, or credit card application.',
      'With Certifying Authorities for the issuance of Digital Signature Certificates.',
      'With regulatory bodies, such as the RBI, and law enforcement agencies where required by law.',
      'With trusted service providers — such as payment gateways and SMS/email providers — under strict confidentiality obligations.',
    ],
  },
  {
    title: 'Data Security',
    body: 'We use encryption, secure servers, and access controls to protect your personal and financial information. KYC and payment data are handled through RBI-compliant, encrypted channels. No method of transmission or storage is completely secure, so please never share OTPs or passwords with anyone.',
  },
  {
    title: 'Cookies & Tracking Technologies',
    body: 'We use cookies and similar technologies to keep you signed in, remember your preferences, and understand how our services are used so we can improve them.',
  },
  {
    title: 'Data Retention',
    body: 'We retain your personal and KYC information for as long as necessary to fulfil the purposes in this policy and to meet RBI and other regulatory record-keeping requirements. Once retention is no longer required, we securely delete or anonymize your data.',
  },
  {
    title: 'Your Rights & Choices',
    body: 'You may request access to, correction of, or deletion of your personal information, subject to our regulatory retention obligations. You can also opt out of promotional communication or withdraw consent at any time.',
  },
  {
    title: "Children's Privacy",
    body: 'Our services are intended for individuals who are at least 18 years old. We do not knowingly collect personal information from minors.',
  },
  {
    title: 'Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. Any changes will be posted along with a revised "last updated" date.',
  },
  {
    title: 'Contact Us',
    body: 'BookFxOrder, 4th Floor, Padma Tower-2, F No. 409, Rajendra Place, New Delhi – 110008 · +91 88001 07428 · admin@bookfxorder.com',
  },
];

export default function PrivacyPolicyScreen() {
  return (
    <FormScreen title="Privacy Policy">
      <Text style={styles.updated}>Last updated September 23, 2026</Text>
      {SECTIONS.map((s, i) => (
        <Card key={s.title} title={`${String(i + 1).padStart(2, '0')}  ${s.title}`}>
          {s.body ? <Text style={styles.body}>{s.body}</Text> : null}
          {s.points?.map((p) => (
            <View key={p} style={styles.point}>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.body}>{p}</Text>
            </View>
          ))}
        </Card>
      ))}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  updated: {
    fontSize: 13,
    color: Colors.muted,
  },
  body: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.text,
  },
  point: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.red,
    fontWeight: '800',
  },
});
