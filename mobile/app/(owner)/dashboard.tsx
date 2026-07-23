import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, FlatList, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import { Badge }          from '@/components/common/Badge';
import { Card }           from '@/components/common/Card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState }     from '@/components/common/EmptyState';
import { Colors }         from '@/constants/colors';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { formatPrice, formatTimeAgo } from '@/utils/formatters';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/constants';
import { orderApi }       from '@/api/orderApi';
import { restaurantApi }  from '@/api/restaurantApi';
import { useAuth }        from '@/hooks/useAuth';
import type { OrderSummary } from '@/types/order.types';
import type { Restaurant }   from '@/types/restaurant.types';

type QuickStat = { label: string; value: string | number; icon: string; color: string };

export default function OwnerDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [restaurant,   setRestaurant]   = useState<Restaurant | null>(null);
  const [pendingOrders,setPendingOrders]= useState<OrderSummary[]>([]);
  const [stats,        setStats]        = useState<QuickStat[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);

  const load = useCallback(async () => {
    try {
      const rest = await restaurantApi.getMine();
      setRestaurant(rest);

      const ordersRes = await orderApi.getRestaurantOrders(rest.id, {
        status: 'Pending', pageSize: 10,
      });
      setPendingOrders(ordersRes.items);

      const allOrders = await orderApi.getRestaurantOrders(rest.id, { pageSize: 100 });
      const delivered = allOrders.items.filter(o => o.status === 'Delivered');
      const revenue   = delivered.reduce((s, o) => s + o.totalAmount, 0);

      setStats([
        { label: 'Pending',   value: ordersRes.totalCount, icon: '⏳', color: Colors.warning },
        { label: 'Today',     value: allOrders.items.filter(o => isToday(o.createdAt)).length, icon: '📦', color: Colors.secondary },
        { label: 'Delivered', value: delivered.length, icon: '✅', color: Colors.success },
        { label: 'Revenue',   value: formatPrice(revenue), icon: '💰', color: Colors.primary },
      ]);
    } catch (e: any) {
      // Restaurant not found — prompt to create one
      if (e.message?.includes('not found')) setRestaurant(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAcceptOrder = async (orderId: number) => {
    try {
      await orderApi.updateStatus(orderId, 'Confirmed');
      Toast.show({ type: 'success', text1: 'Order Accepted' });
      setPendingOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message });
    }
  };

  const handleRejectOrder = async (orderId: number) => {
    Alert.alert('Reject Order', 'Are you sure you want to reject this order?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          try {
            await orderApi.updateStatus(orderId, 'Cancelled');
            Toast.show({ type: 'success', text1: 'Order Rejected' });
            setPendingOrders(prev => prev.filter(o => o.id !== orderId));
          } catch (e: any) {
            Toast.show({ type: 'error', text1: 'Error', text2: e.message });
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ─────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Restaurant Dashboard</Text>
          <Text style={styles.name}>{restaurant?.name ?? 'Setup Required'}</Text>
        </View>
        <TouchableOpacity
          onPress={() => Alert.alert('Sign Out', 'Sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/welcome'); } },
          ])}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Ionicons name="log-out-outline" size={24} color={Colors.error} />
        </TouchableOpacity>
      </View>

      {!restaurant ? (
        <EmptyState
          icon="restaurant-outline"
          title="No Restaurant Found"
          message="Register your restaurant to start receiving orders."
          actionLabel="Register Restaurant"
          onAction={() => router.push('/(owner)/menu')}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />
          }
        >
          {/* ── Status toggle ──────────────── */}
          <View style={styles.statusCard}>
            <View>
              <Text style={styles.statusTitle}>Restaurant Status</Text>
              <Text style={styles.statusSub}>
                {restaurant.isCurrentlyOpen ? 'Accepting orders' : 'Not accepting orders'}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: restaurant.isCurrentlyOpen ? Colors.successLight : Colors.errorLight }]}>
              <View style={[styles.statusDot, { backgroundColor: restaurant.isCurrentlyOpen ? Colors.success : Colors.error }]} />
              <Text style={[styles.statusText, { color: restaurant.isCurrentlyOpen ? Colors.success : Colors.error }]}>
                {restaurant.isCurrentlyOpen ? 'OPEN' : 'CLOSED'}
              </Text>
            </View>
          </View>

          {/* ── Stats ──────────────────────── */}
          <View style={styles.statsGrid}>
            {stats.map(stat => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* ── Incoming Orders ────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Incoming Orders
                {pendingOrders.length > 0 && (
                  <Text style={styles.badge}> {pendingOrders.length}</Text>
                )}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(owner)/orders')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>

            {pendingOrders.length === 0 ? (
              <View style={styles.emptyOrders}>
                <Ionicons name="checkmark-circle-outline" size={40} color={Colors.success} />
                <Text style={styles.emptyOrdersText}>All caught up!</Text>
              </View>
            ) : (
              pendingOrders.map(order => (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                    <Badge
                      label={ORDER_STATUS_LABELS[order.status]}
                      color={ORDER_STATUS_COLORS[order.status]}
                      bgColor={`${ORDER_STATUS_COLORS[order.status]}18`}
                      size="sm"
                    />
                  </View>
                  <Text style={styles.orderMeta}>
                    {order.itemCount} items • {formatPrice(order.totalAmount)} • {formatTimeAgo(order.createdAt)}
                  </Text>
                  <View style={styles.orderActions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.acceptBtn]}
                      onPress={() => handleAcceptOrder(order.id)}
                      accessibilityRole="button"
                      accessibilityLabel="Accept order"
                    >
                      <Ionicons name="checkmark" size={18} color={Colors.white} />
                      <Text style={styles.actionBtnText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.rejectBtn]}
                      onPress={() => handleRejectOrder(order.id)}
                      accessibilityRole="button"
                      accessibilityLabel="Reject order"
                    >
                      <Ionicons name="close" size={18} color={Colors.white} />
                      <Text style={styles.actionBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* ── Quick Links ────────────────── */}
          <View style={styles.quickLinks}>
            {[
              { icon: 'restaurant-outline', label: 'Menu',      route: '/(owner)/menu' },
              { icon: 'receipt-outline',    label: 'Orders',    route: '/(owner)/orders' },
              { icon: 'bar-chart-outline',  label: 'Analytics', route: '/(owner)/analytics' },
            ].map(link => (
              <TouchableOpacity
                key={link.label}
                style={styles.quickLink}
                onPress={() => router.push(link.route as any)}
                accessibilityRole="button"
              >
                <View style={styles.quickLinkIcon}>
                  <Ionicons name={link.icon as any} size={24} color={Colors.primary} />
                </View>
                <Text style={styles.quickLinkLabel}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: Spacing[10] }} />
        </ScrollView>
      )}
    </View>
  );
}

function isToday(dateStr: string): boolean {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'center',
    paddingHorizontal: Spacing[5],
    paddingVertical:  Spacing[4],
    backgroundColor:  Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  greeting:     { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  name:         { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  statusCard: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    margin:            Spacing[4],
    padding:           Spacing[4],
    backgroundColor:   Colors.white,
    borderRadius:      BorderRadius.xl,
    ...Shadow.sm,
  },
  statusTitle:  { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  statusSub:    { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  statusBadge: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               Spacing[1.5],
    paddingHorizontal: Spacing[3],
    paddingVertical:   Spacing[1.5],
    borderRadius:      BorderRadius.full,
  },
  statusDot:    { width: 8, height: 8, borderRadius: 4 },
  statusText:   { fontSize: 12, fontWeight: '700' },
  statsGrid: {
    flexDirection:    'row',
    flexWrap:         'wrap',
    paddingHorizontal: Spacing[4],
    gap:              Spacing[3],
    marginBottom:     Spacing[2],
  },
  statCard: {
    width:           '47%',
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.xl,
    padding:         Spacing[4],
    alignItems:      'center',
    ...Shadow.sm,
  },
  statIcon:  { fontSize: 28, marginBottom: Spacing[2] },
  statValue: { fontSize: 22, fontWeight: '800', marginBottom: Spacing[0.5] },
  statLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  section: { paddingHorizontal: Spacing[4], marginBottom: Spacing[4] },
  sectionHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   Spacing[3],
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  badge:        { color: Colors.error, fontWeight: '700' },
  seeAll:       { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  emptyOrders: {
    alignItems:      'center',
    padding:         Spacing[6],
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.xl,
    gap:             Spacing[2],
    ...Shadow.sm,
  },
  emptyOrdersText: { fontSize: 15, color: Colors.success, fontWeight: '600' },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.xl,
    padding:         Spacing[4],
    marginBottom:    Spacing[3],
    ...Shadow.sm,
  },
  orderHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   Spacing[1.5],
  },
  orderNumber:  { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  orderMeta:    { fontSize: 13, color: Colors.textSecondary, marginBottom: Spacing[3] },
  orderActions: { flexDirection: 'row', gap: Spacing[3] },
  actionBtn: {
    flex:          1,
    flexDirection: 'row',
    alignItems:    'center',
    justifyContent:'center',
    paddingVertical: Spacing[2.5],
    borderRadius:  BorderRadius.lg,
    gap:           Spacing[1.5],
  },
  acceptBtn:    { backgroundColor: Colors.success },
  rejectBtn:    { backgroundColor: Colors.error },
  actionBtnText:{ color: Colors.white, fontWeight: '700', fontSize: 14 },
  quickLinks: {
    flexDirection:    'row',
    paddingHorizontal: Spacing[4],
    gap:              Spacing[3],
    marginBottom:     Spacing[4],
  },
  quickLink: {
    flex:            1,
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.xl,
    padding:         Spacing[4],
    alignItems:      'center',
    gap:             Spacing[2],
    ...Shadow.sm,
  },
  quickLinkIcon: {
    width:           48,
    height:          48,
    borderRadius:    BorderRadius.xl,
    backgroundColor: '#FFF0EB',
    alignItems:      'center',
    justifyContent:  'center',
  },
  quickLinkLabel: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary },
});
