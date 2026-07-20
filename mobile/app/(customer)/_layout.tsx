import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function CustomerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown:  false,
        contentStyle: { backgroundColor: Colors.background },
        animation:    'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)"               options={{ animation: 'none' }} />
      <Stack.Screen name="restaurant/[id]"      />
      <Stack.Screen name="food/[id]"            />
      <Stack.Screen name="cart"                 />
      <Stack.Screen name="checkout"             />
      <Stack.Screen name="payment"              />
      <Stack.Screen name="order-tracking/[id]"  />
      <Stack.Screen name="notifications"        />
    </Stack>
  );
}
