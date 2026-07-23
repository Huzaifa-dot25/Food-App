import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Badge }          from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState }     from '@/components/common/EmptyState';
import { Colors }         from '@/constants/colors';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { formatPrice, formatTimeAgo } from '@/utils/formatters';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/constants';
import { orderApi }       from '@/api/orderApi';
import { restaurantApi }  from '@/api/restaurantApi';
import type { OrderSummary } from '@/types/order.types';

type OrderStatus = 'all' | 'Pending' | 'Confirmed' | 'Preparing' | 'ReadyForPickup' | 'Delivered' | 'Cancelled';

const STATUS_FILTERS: { key: OrderStatus; label: string }[] = [
  { key: 'all',           label: 'All' },
  { key: 'Pending',       label: 'Pending' },
  { key: 'Confirmed',     label: 'Confirmed' },
  { key: 'Preparing',     label: 'Preparing' },
  { key: 'ReadyForPickup',label: 'Ready' },
  { key: 'Delivered',     label: 'Delivered' },
];

const NEXT_STATUS: Record<string, string> = {
  Confirmed:      'Preparing',
  Preparing:      'ReadyForPickup',
  ReadyForPickup: 'OutForDelivery',
};

export default function OwnerOrdersScreen() {
  const insets  = useSafeAreaInsets();
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [orders,     setOrders]     = useState<OrderSummary[]>([]);
  const [filter,     setFilter]     = useState<OrderStatus>('all');
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    restaurantApi.getMine()
      .then(r => setRestaurantId(r.id))
      .catch(() => setLoading(false));
  }, []);

  const load = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const res = await orderApi.getRestaurantOrders(
        restaurantId,
        filter !== 'all' ? { status: filter, pageSize: 50 } : { pageSize: 50 },
      );
      setOrders(res.items);
    } catch (e) { console.warn(e); }
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [restaurantId, filter]);

  useEffect(() => { if (restaurantId) load(); }, [restaurantId, filter]);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await orderApi.updateStatus(orderId, newStatus);
      Toast.show({ type: 'success', text1: 'Order Updated', text2: `Status → ${ORDER_STATUS_LABELS[newStatus]}` });
      load();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message });
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
      </View>

      {/* Filter chips */}
      <FlatList
        data={STATUS_FILTERS}
        horizontal
        keyExtractor={i => i.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        style={styles.filterScroll}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, filter === item.key && styles.chipActive]}
            onPress={() => setFilter(item.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === item.key }}
          >
            <Text style={[styles.chipText, filter === item.key && styles.chipTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={orders}
        keyExtractor={item => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
        ListEmptyComponent={<EmptyState icon="receipt-outline" title="No Orders" message="No orders match this filter." />}
        renderItem={({ item }) => {
          const next = NEXT_STATUS[item.status];
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.orderNum}>{item.orderNumber}</Text>
                  <Text style={styles.meta}>{formatTimeAgo(item.createdAt)}</Text>
                </View>
                <Badge
                  label={ORDER_STATUS_LABELS[item.status] ?? item.status}
                  color={ORDER_STATUS_COLORS[item.status] ?? Colors.primary}
                  bgColor={`${ORDER_STATUS_COLORS[item.status] ?? Colors.primary}18`}
                  size="sm"
                />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.info}>{item.itemCount} items</Text>
                <Text style={styles.amount}>{formatPrice(item.totalAmount)}</Text>
              </View>
              {next && (
                <TouchableOpacity
                  style={styles.updateBtn}
                  onPress={() => handleUpdateStatus(item.id, next)}
                  accessibilityRole="button"
                  accessibilityLabel={`Mark as ${ORDER_STATUS_LABELS[next]}`}
                >
                  <Ionicons name="arrow-forward-circle-outline" size={16} color={Colors.white} />
                  <Text style={styles.updateBtnText}>
                    Mark as {ORDER_STATUS_LABELS[next]}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing[5],
    paddingVertical:   Spacing[4],
    backgroundColor:   Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  title:        { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  filterScroll: { maxHeight: 52, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  filterList:   { paddingHorizontal: Spacing[4], paddingVertical: Spacing[2], gap: Spacing[2], alignItems: 'center' },
  chip: {
    paddingHorizontal: Spacing[3],
    paddingVertical:   Spacing[1.5],
    borderRadius:      BorderRadius.full,
    borderWidth:       1,
    borderColor:       Colors.border,
    backgroundColor:   Colors.white,
  },
  chipActive:    { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText:      { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  chipTextActive:{ color: Colors.white, fontWeight: '600' },
  list:          { padding: Spacing[4], paddingBottom: Spacing[10] },
  card: {
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.xl,
    padding:         Spacing[4],
    marginBottom:    Spacing[3],
    ...Shadow.sm,
  },
  cardHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing[3] },
  orderNum:     { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  meta:         { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  cardBody:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing[3] },
  info:         { fontSize: 14, color: Colors.textSecondary },
  amount:       { fontSize: 16, fontWeight: '800', color: Colors.primary },
  updateBtn: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            Spacing[2],
    backgroundColor:Colors.primary,
    borderRadius:   BorderRadius.lg,
    paddingVertical: Spacing[2.5],
  },
  updateBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
});
