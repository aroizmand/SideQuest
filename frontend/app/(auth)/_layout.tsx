import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="phone-entry" />
      <Stack.Screen name="otp-verify" />
      <Stack.Screen name="onboarding/selfie" />
      <Stack.Screen name="onboarding/profile-setup" />
      <Stack.Screen name="onboarding/tos-accept" />
    </Stack>
  );
}
