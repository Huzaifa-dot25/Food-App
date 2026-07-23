import React, { useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState }   from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Colors }       from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { formatTimeAgo } from '@/utils/formatters';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchNotifications, markNotificationRead, markAllRead,
  selectNotifications,
} from '@/store/slices/notificationSlice';
import type { Notification } from '@/types/api.types';

const NOTIF_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  OrderUpdate:     'receipt-outline',
  Promotion:       'pricetag-outline',
  System:          'information-circle-outline',
  NewOrder:        'fast-food-outline',
  DeliveryRequest: 'bicycle-outline',
};

export default function NotificationsScreen() {
  const router       = useRouter();
  const insets       = useSafeAreaInsets();
  const dispatch     = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const [refreshing, setRefreshing] = React.useState(false);

  const load = useCallback(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(fetchNotifications()).finally(() => setRefreshing(false));
  };

  const handlePress = (notif: Notification) => {
    if (!notif.isRead) dispatch(markNotificationRead(notif.id));
    // Navigate to related content
    if (notif.type === 'OrderUpdate' && notif.referenceId) {
      router.push(`/(customer)/order-tracking/${notif.referenceId}`);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity
          onPress={() => dispatch(markAllRead())}
          accessibilityRole="button"
          accessibilityLabel="Mark all as read"
        >
          <Text style={styles.markAll}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, !item.isRead && styles.itemUnread]}
            onPress={() => handlePress(item)}
            accessibilityRole="button"
          >
            <View style={[styles.iconBox, !item.isRead && styles.iconBoxUnread]}>
              <Ionicons
                name={NOTIF_ICONS[item.type] ?? 'notifications-outline'}
                size={20}
                color={!item.isRead ? Colors.primary : Colors.textSecondary}
              />
            </View>
            <View style={styles.itemContent}>
              <Text style={[styles.itemTitle, !item.isRead && styles.itemTitleUnread]}>
                {item.title}
              </Text>
              <Text style={styles.itemBody} numberOfLines={2}>{item.body}</Text>
              <Text style={styles.itemTime}>{formatTimeAgo(item.createdAt)}</Text>
            </View>
            {!item.isRead && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="notifications-outline"
            title="No Notifications"
            message="You're all caught up!"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: Spacing[4],
    paddingVertical:   Spacing[3],
    backgroundColor:   Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    gap:               Spacing[3],
  },
  backBtn:  { padding: Spacing[1] },
  title:    { flex: 1, fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  markAll:  { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  list:     { paddingVertical: Spacing[2] },
  item: {
    flexDirection:     'row',
    alignItems:        'flex-start',
    paddingHorizontal: Spacing[4],
    paddingVertical:   Spacing[4],
    backgroundColor:   Colors.white,
    marginBottom:      1,
    gap:               Spacing[3],
  },
  itemUnread: { backgroundColor: '#FFF9F7' },
  iconBox: {
    width:           40,
    height:          40,
    borderRadius:    BorderRadius.full,
    backgroundColor: Colors.background,
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  iconBoxUnread: { backgroundColor: '#FFF0EB' },
  itemContent:   { flex: 1 },
  itemTitle: {
    fontSize:   14,
    fontWeight: '500',
    color:      Colors.textPrimary,
    marginBottom: 2,
  },
  itemTitleUnread: { fontWeight: '700' },
  itemBody:  { fontSize: 13, color: Colors.textSecondary, lineHeight: 18, marginBottom: 4 },
  itemTime:  { fontSize: 11, color: Colors.textSecondary },
  unreadDot: {
    width:           8,
    height:          8,
    borderRadius:    4,
    backgroundColor: Colors.primary,
    marginTop:       Spacing[1.5],
    flexShrink:      0,
  },
});
