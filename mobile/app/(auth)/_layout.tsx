import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown:      false,
        contentStyle:     { backgroundColor: Colors.white },
        animation:        'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome"         options={{ animation: 'none' }} />
      <Stack.Screen name="login"           />
      <Stack.Screen name="register"        />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="otp"             />
      <Stack.Screen name="onboarding"      options={{ animation: 'none' }} />
    </Stack>
  );
}
