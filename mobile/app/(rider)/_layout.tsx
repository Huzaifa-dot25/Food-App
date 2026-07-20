import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

export default function RiderLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown:             false,
        tabBarActiveTintColor:   Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          height:          64,
          paddingBottom:   8,
          backgroundColor: Colors.white,
          borderTopWidth:  1,
          borderTopColor:  Colors.border,
        },
      }}
    >
      <Tabs.Screen name="dashboard"  options={{ title: 'Deliveries', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'bicycle' : 'bicycle-outline'} size={24} color={color} /> }} />
      <Tabs.Screen name="navigation" options={{ title: 'Navigate',   tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'navigate' : 'navigate-outline'} size={24} color={color} /> }} />
      <Tabs.Screen name="earnings"   options={{ title: 'Earnings',   tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'cash' : 'cash-outline'} size={24} color={color} /> }} />
    </Tabs>
  );
}
