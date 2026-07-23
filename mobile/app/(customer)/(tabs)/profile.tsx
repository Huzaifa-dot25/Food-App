import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Colors } from '@/constants/colors';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/utils';

type MenuItem = {
  icon:    keyof typeof Ionicons.glyphMap;
  label:   string;
  route?:  string;
  onPress?: () => void;
  danger?:  boolean;
  badge?:   string;
};

export default function ProfileScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { user, logout, isLoading } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  if (!user) return <LoadingSpinner fullScreen />;

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/welcome');
          },
        },
      ],
    );
  };

  const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Account',
      items: [
        { icon: 'person-outline',   label: 'Edit Profile',    route: '/(customer)/(tabs)/profile' },
        { icon: 'location-outline', label: 'My Addresses',    route: '/(customer)/(tabs)/profile' },
        { icon: 'card-outline',     label: 'Payment Methods', badge: 'Soon' },
      ],
    },
    {
      title: 'Orders',
      items: [
        { icon: 'receipt-outline',  label: 'Order History', route: '/(customer)/(tabs)/orders' },
        { icon: 'heart-outline',    label: 'Favorites',     route: '/(customer)/(tabs)/favorites' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle-outline', label: 'Help & Support', badge: 'Soon' },
        { icon: 'information-circle-outline', label: 'About App', badge: 'v1.0.0' },
      ],
    },
    {
      title: 'Account Actions',
      items: [
        { icon: 'log-out-outline', label: 'Sign Out', onPress: handleLogout, danger: true },
      ],
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── User Card ──────────────────────────── */}
        <View style={styles.userCard}>
          {user.profileImageUrl ? (
            <Image source={{ uri: user.profileImageUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>
                {getInitials(`${user.firstName} ${user.lastName}`)}
              </Text>
            </View>
          )}

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user.roles?.[0] ?? 'Customer'}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            <Ionicons name="pencil-outline" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* ── Notifications toggle ───────────────── */}
        <View style={styles.notifRow}>
          <View style={styles.notifLeft}>
            <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
            <Text style={styles.notifLabel}>Push Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: Colors.border, true: Colors.primaryLight }}
            thumbColor={notificationsEnabled ? Colors.primary : Colors.white}
            accessibilityLabel="Toggle push notifications"
          />
        </View>

        {/* ── Menu Sections ──────────────────────── */}
        {MENU_SECTIONS.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.menuItem,
                    idx < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={item.onPress ?? (() => item.route && router.push(item.route as any))}
                  disabled={!!item.badge && item.badge !== 'Soon'}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                >
                  <View style={[styles.menuIcon, item.danger && styles.menuIconDanger]}>
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={item.danger ? Colors.error : Colors.primary}
                    />
                  </View>
                  <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
                    {item.label}
                  </Text>
                  {item.badge ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  ) : (
                    !item.danger && (
                      <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
                    )
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={{ height: Spacing[10] }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing[5],
    paddingVertical:   Spacing[4],
    backgroundColor:   Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },

  userCard: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   Colors.white,
    margin:            Spacing[4],
    borderRadius:      BorderRadius['2xl'],
    padding:           Spacing[4],
    gap:               Spacing[3],
    ...Shadow.sm,
  },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarPlaceholder: {
    width:           64,
    height:          64,
    borderRadius:    32,
    backgroundColor: Colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
  },
  avatarInitials: { fontSize: 22, fontWeight: '800', color: Colors.white },
  userInfo:  { flex: 1 },
  userName:  { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  userEmail: { fontSize: 13, color: Colors.textSecondary, marginBottom: Spacing[1.5] },
  roleBadge: {
    backgroundColor: '#FFF0EB',
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  roleText: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  editBtn:  { padding: Spacing[2] },

  notifRow: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    backgroundColor:   Colors.white,
    marginHorizontal:  Spacing[4],
    marginBottom:      Spacing[2],
    borderRadius:      BorderRadius.xl,
    paddingHorizontal: Spacing[4],
    paddingVertical:   Spacing[3],
    ...Shadow.sm,
  },
  notifLeft:  { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  notifLabel: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },

  section:      { marginBottom: Spacing[2], paddingHorizontal: Spacing[4] },
  sectionTitle: {
    fontSize:    12,
    fontWeight:  '600',
    color:       Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing[2],
    marginLeft:  Spacing[1],
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.xl,
    overflow:        'hidden',
    ...Shadow.sm,
  },
  menuItem: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: Spacing[4],
    paddingVertical:   Spacing[3.5],
    gap:               Spacing[3],
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  menuIcon: {
    width:           36,
    height:          36,
    borderRadius:    BorderRadius.md,
    backgroundColor: '#FFF0EB',
    alignItems:      'center',
    justifyContent:  'center',
  },
  menuIconDanger: { backgroundColor: Colors.errorLight },
  menuLabel:      { flex: 1, fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },
  menuLabelDanger:{ color: Colors.error },
  badge: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing[2],
    paddingVertical:  2,
    borderRadius:     BorderRadius.full,
  },
  badgeText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
});
