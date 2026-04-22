import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Colors, FontSize, Spacing } from '@/constants/theme';

const CONTENT = {
  tos: {
    title: 'Terms of Service',
    sections: [
      {
        heading: 'Acceptance',
        body: 'By using SideQuest you agree to these terms. If you do not agree, please do not use the app.',
      },
      {
        heading: 'Eligibility',
        body: 'You must be at least 18 years old to use SideQuest. By creating an account you confirm you meet this requirement.',
      },
      {
        heading: 'Conduct',
        body: 'You agree to treat other users with respect. Harassment, hate speech, or any behaviour that makes others feel unsafe is grounds for immediate account removal.',
      },
      {
        heading: 'Quest Content',
        body: 'You are responsible for the accuracy of quests you create. Do not create quests for illegal activities or events you do not intend to host.',
      },
      {
        heading: 'Account Termination',
        body: 'We reserve the right to suspend or delete accounts that violate these terms at our discretion.',
      },
      {
        heading: 'Limitation of Liability',
        body: 'SideQuest is a platform for discovery. We are not responsible for events that occur during quests or interactions between users outside the app.',
      },
      {
        heading: 'Changes',
        body: 'We may update these terms from time to time. Continued use of the app after changes constitutes acceptance.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    sections: [
      {
        heading: 'What We Collect',
        body: 'We collect your phone number (stored as a one-way hash), first name, age, gender, and any quests you create or join.',
      },
      {
        heading: 'How We Use It',
        body: 'Your information is used to provide the SideQuest service — matching you with quests, displaying your profile to other participants, and maintaining account security.',
      },
      {
        heading: 'What Others See',
        body: 'Only your first name and profile photo are visible to other users. Your phone number, age, and gender are never shared publicly.',
      },
      {
        heading: 'Data Storage',
        body: 'Data is stored securely using Supabase (PostgreSQL) with row-level security. Your auth token is stored only on your device.',
      },
      {
        heading: 'Third Parties',
        body: 'We use Supabase for database and authentication, and Stream for in-quest messaging. We do not sell your data to advertisers.',
      },
      {
        heading: 'Deletion',
        body: 'You can permanently delete your account and all associated data at any time from Settings → Delete Account.',
      },
      {
        heading: 'Contact',
        body: 'Questions about privacy? Reach us at privacy@sidequest.app.',
      },
    ],
  },
};

export default function LegalScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: 'tos' | 'privacy' }>();
  const doc = CONTENT[type ?? 'tos'];

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{doc.title}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {doc.sections.map((s) => (
          <View key={s.heading} style={styles.section}>
            <Text style={styles.heading}>{s.heading}</Text>
            <Text style={styles.body}>{s.body}</Text>
          </View>
        ))}
        <Text style={styles.footer}>Last updated April 2026</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  backBtn: { width: 36, padding: Spacing.xs },
  backText: { color: Colors.text, fontSize: FontSize.xl },
  title: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700' },
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xxl },
  section: { gap: Spacing.xs },
  heading: { color: Colors.text, fontSize: FontSize.md, fontWeight: '600' },
  body: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 22 },
  footer: { color: Colors.textMuted, fontSize: FontSize.xs, textAlign: 'center', marginTop: Spacing.lg },
});
