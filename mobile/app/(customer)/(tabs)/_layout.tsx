import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { useAppSelector } from '@/store';
import { selectCartCount }   from '@/store/slices/cartSlice';
import { selectUnreadCount } from '@/store/slices/notificationSlice';

function CartTabIcon({ color, focused }: { color: string; focused: boolean }) {
  const count = useAppSelector(selectCartCount);
  return (
    <View>
      <Ionicons name={focused ? 'cart' : 'cart-outline'} size={24} color={color} />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </View>
  );
}

function NotifTabIcon({ color, focused }: { color: string; focused: boolean }) {
  const count = useAppSelector(selectUnreadCount);
  return (
    <View>
      <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={24} color={color} />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
        </View>
      )}
    </View>
  );
}

export default function CustomerTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown:        false,
        tabBarActiveTintColor:   Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          height:          64,
          paddingBottom:   8,
          paddingTop:      4,
          backgroundColor: Colors.white,
          borderTopWidth:  1,
          borderTopColor:  Colors.border,
        },
        tabBarLabelStyle: {
          fontSize:   11,
          fontWeight: '500',
          marginTop:  2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title:    'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title:    'Search',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'search' : 'search-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title:    'Orders',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title:    'Favorites',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'heart' : 'heart-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title:    'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position:        'absolute',
    top:             -4,
    right:           -8,
    backgroundColor: Colors.error,
    borderRadius:    10,
    minWidth:        16,
    height:          16,
    alignItems:      'center',
    justifyContent:  'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 9, color: Colors.white, fontWeight: '700' },
});
