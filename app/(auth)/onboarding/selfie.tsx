import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboardingStore';

export default function SelfieScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const { setPhoto } = useOnboardingStore();

  async function takeSelfie() {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7, base64: false });
    if (photo) setPhotoUri(photo.uri);
  }

  function confirm() {
    if (!photoUri) return;
    setPhoto(photoUri);
    router.push('/(auth)/onboarding/profile-setup');
  }

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>We need your selfie</Text>
        <Text style={styles.subtitle}>Your face photo is always shown on your profile. No anonymity — that's how we keep it safe.</Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Allow Camera</Text>
        </Pressable>
      </View>
    );
  }

  if (photoUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Looking good?</Text>
        <Image source={{ uri: photoUri }} style={styles.preview} />
        <Pressable style={styles.button} onPress={confirm}>
          <Text style={styles.buttonText}>Use This Photo</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => setPhotoUri(null)}>
          <Text style={styles.secondaryText}>Retake</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Take a selfie</Text>
      <CameraView ref={cameraRef} style={styles.camera} facing="front" />
      <Pressable style={styles.shutterButton} onPress={takeSelfie}>
        <View style={styles.shutterInner} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFF', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#AAA', textAlign: 'center', marginBottom: 32 },
  camera: { width: 280, height: 280, borderRadius: 140, overflow: 'hidden', marginBottom: 32 },
  preview: { width: 280, height: 280, borderRadius: 140, marginBottom: 32 },
  shutterButton: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: '#FF5C00', alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FF5C00' },
  button: { backgroundColor: '#FF5C00', paddingVertical: 16, paddingHorizontal: 48, borderRadius: 12, marginBottom: 12, width: '100%', alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  secondaryButton: { paddingVertical: 12 },
  secondaryText: { color: '#AAA', fontSize: 15 },
});
