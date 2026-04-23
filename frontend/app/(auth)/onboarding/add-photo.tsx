import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { pickAndUploadAvatar } from '@/lib/uploadAvatar';
import { supabase } from '@/lib/supabase';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';

export default function AddPhotoScreen() {
  const router = useRouter();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleAvatarPress() {
    if (uploading) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUploading(true);
    const url = await pickAndUploadAvatar(user.id);
    setUploading(false);
    if (url) setPhotoUrl(url);
  }

  function handleContinue() {
    router.push('/(auth)/onboarding/tos-accept');
  }

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Add your photo</Text>
        <Text style={styles.subtitle}>Help others recognise you at the meetup.</Text>

        <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8} style={styles.avatarWrapper}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              {uploading
                ? <ActivityIndicator color={Colors.text} size="large" />
                : <Text style={styles.cameraIcon}>📷</Text>
              }
            </View>
          )}

          {photoUrl && (
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>✎</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.hint}>
          {uploading ? 'Uploading…' : photoUrl ? 'Tap to change' : 'Tap to add a photo'}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button label="Continue" onPress={handleContinue} disabled={uploading} />
        {!photoUrl && (
          <TouchableOpacity onPress={handleContinue} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'space-between' },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  backBtn: { padding: Spacing.sm },
  backText: { color: Colors.text, fontSize: FontSize.xl },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg, paddingHorizontal: Spacing.lg },
  title: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: Colors.textSecondary, fontSize: FontSize.md, textAlign: 'center' },
  avatarWrapper: { width: 120, height: 120, marginTop: Spacing.lg },
  avatarPlaceholder: {
    width: 120, height: 120, borderRadius: Radius.full,
    backgroundColor: Colors.surface, borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarImage: { width: 120, height: 120, borderRadius: Radius.full },
  editBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 30, height: 30, borderRadius: Radius.full,
    backgroundColor: Colors.surface, borderWidth: 2, borderColor: Colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  editBadgeText: { color: Colors.textSecondary, fontSize: 14 },
  cameraIcon: { fontSize: 36 },
  hint: { color: Colors.textMuted, fontSize: FontSize.sm },
  actions: { padding: Spacing.lg, gap: Spacing.sm },
  skipBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  skipText: { color: Colors.textMuted, fontSize: FontSize.sm },
});
