import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

export default function OwnerLayout() {
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
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'grid' : 'grid-outline'} size={24} color={color} /> }} />
      <Tabs.Screen name="menu"      options={{ title: 'Menu',      tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'restaurant' : 'restaurant-outline'} size={24} color={color} /> }} />
      <Tabs.Screen name="orders"    options={{ title: 'Orders',    tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={24} color={color} /> }} />
      <Tabs.Screen name="analytics" options={{ title: 'Analytics', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'bar-chart' : 'bar-chart-outline'} size={24} color={color} /> }} />
    </Tabs>
  );
}
