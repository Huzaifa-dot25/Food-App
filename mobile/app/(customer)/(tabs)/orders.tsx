import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { OrderCard }    from '@/components/order/OrderCard';
import { EmptyState }   from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Colors }       from '@/constants/colors';
import { Spacing }      from '@/constants/spacing';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchOrderHistory, selectOrders, selectOrderLoading } from '@/store/slices/orderSlice';
import { orderApi }     from '@/api/orderApi';
import type { OrderStatus } from '@/types/order.types';

const STATUS_FILTERS: { key: string; label: string }[] = [
  { key: 'all',         label: 'All' },
  { key: 'Pending',     label: 'Active' },
  { key: 'Delivered',   label: 'Delivered' },
  { key: 'Cancelled',   label: 'Cancelled' },
];

export default function OrdersScreen() {
  const insets   = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const orders   = useAppSelector(selectOrders);
  const loading  = useAppSelector(selectOrderLoading);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    dispatch(fetchOrderHistory(filter !== 'all' ? { status: filter } : undefined));
  }, [dispatch, filter]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(fetchOrderHistory(filter !== 'all' ? { status: filter } : undefined))
      .finally(() => setRefreshing(false));
  };

  const handleReorder = async (orderId: number) => {
    try {
      await orderApi.reorder(orderId);
      Toast.show({ type: 'success', text1: 'Reordered!', text2: 'Your order has been placed.' });
      load();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Failed', text2: e.message });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === f.key }}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && orders.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onReorder={item.status === 'Delivered' ? () => handleReorder(item.id) : undefined}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="receipt-outline"
              title="No Orders Yet"
              message="Your order history will appear here."
            />
          }
        />
      )}
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
  title:     { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  filterRow: {
    flexDirection:     'row',
    paddingHorizontal: Spacing[4],
    paddingVertical:   Spacing[3],
    backgroundColor:   Colors.white,
    gap:               Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  filterChip: {
    paddingHorizontal: Spacing[3],
    paddingVertical:   Spacing[1.5],
    borderRadius:      18,
    borderWidth:       1,
    borderColor:       Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText:       { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  filterTextActive: { color: Colors.white, fontWeight: '600' },
  list: { padding: Spacing[4], paddingBottom: Spacing[10] },
});
