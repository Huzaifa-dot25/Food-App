import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { OrderStatusBar }  from '@/components/order/OrderStatusBar';
import { LoadingSpinner }  from '@/components/common/LoadingSpinner';
import { ErrorState }      from '@/components/common/ErrorState';
import { Button }          from '@/components/common/Button';
import { Colors }          from '@/constants/colors';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { formatPrice, formatDeliveryTime, formatTimeAgo } from '@/utils/formatters';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/constants';
import { orderApi }        from '@/api/orderApi';
import { getInitials }     from '@/utils';
import type { Order }      from '@/types/order.types';

const POLL_INTERVAL = 10_000; // 10 seconds

export default function OrderTrackingScreen() {
  const { id }  = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  const [order,   setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await orderApi.getById(Number(id));
      setOrder(data);
      setError(null);
      // Stop polling when delivered or cancelled
      if (data.status === 'Delivered' || data.status === 'Cancelled') {
        if (pollRef.current) clearInterval(pollRef.current);
      }
    } catch (e: any) {
      setError(e.message ?? 'Failed to load order.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    // Poll for updates
    pollRef.current = setInterval(load, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [load]);

  if (loading) return <LoadingSpinner fullScreen message="Loading order…" />;
  if (error || !order) return <ErrorState message={error ?? 'Order not found.'} onRetry={load} />;

  const statusColor = ORDER_STATUS_COLORS[order.status] ?? Colors.primary;
  const isActive    = !['Delivered', 'Cancelled'].includes(order.status);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ───────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace('/(customer)/(tabs)/orders')}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Back to orders"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Track Order</Text>
          <Text style={styles.orderNum}>{order.orderNumber}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Status Banner ─────────────────────── */}
        <View style={[styles.statusBanner, { backgroundColor: `${statusColor}15` }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <View style={styles.statusInfo}>
            <Text style={[styles.statusLabel, { color: statusColor }]}>
              {ORDER_STATUS_LABELS[order.status] ?? order.status}
            </Text>
            {order.status === 'OutForDelivery' && (
              <Text style={styles.statusSub}>
                Your rider is on the way! ETA ~{order.estimatedDeliveryMinutes} min
              </Text>
            )}
            {order.status === 'Delivered' && (
              <Text style={styles.statusSub}>
                Delivered {formatTimeAgo(order.deliveredAt!)}
              </Text>
            )}
            {order.status === 'Cancelled' && order.cancellationReason && (
              <Text style={styles.statusSub}>Reason: {order.cancellationReason}</Text>
            )}
          </View>
          {/* Live indicator */}
          {isActive && (
            <View style={styles.liveBadge}>
              <View style={[styles.liveDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>

        {/* ── Status Progress Bar ────────────────── */}
        <View style={styles.card}>
          <OrderStatusBar status={order.status} />
        </View>

        {/* ── Rider Info (when assigned) ────────── */}
        {order.rider && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Rider</Text>
            <View style={styles.riderRow}>
              {order.rider.riderPhoto ? (
                <Image source={{ uri: order.rider.riderPhoto }} style={styles.riderAvatar} />
              ) : (
                <View style={styles.riderAvatarPlaceholder}>
                  <Text style={styles.riderInitials}>
                    {getInitials(order.rider.riderName)}
                  </Text>
                </View>
              )}
              <View style={styles.riderInfo}>
                <Text style={styles.riderName}>{order.rider.riderName}</Text>
                <Text style={styles.riderVehicle}>{order.rider.vehicleType}</Text>
              </View>
              {order.rider.riderPhone && (
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => Linking.openURL(`tel:${order.rider!.riderPhone}`)}
                  accessibilityRole="button"
                  accessibilityLabel="Call rider"
                >
                  <Ionicons name="call-outline" size={20} color={Colors.white} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* ── Map placeholder ────────────────────── */}
        {order.status === 'OutForDelivery' && (
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={48} color={Colors.border} />
            <Text style={styles.mapText}>
              Live map available when Google Maps SDK is configured
            </Text>
            <Text style={styles.mapSub}>
              Delivery address: {order.deliveryAddress}
            </Text>
          </View>
        )}

        {/* ── Restaurant ────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Restaurant</Text>
          <View style={styles.restRow}>
            {order.restaurantLogo ? (
              <Image source={{ uri: order.restaurantLogo }} style={styles.restLogo} />
            ) : (
              <View style={styles.restLogoPlaceholder}>
                <Ionicons name="restaurant-outline" size={20} color={Colors.textSecondary} />
              </View>
            )}
            <Text style={styles.restName}>{order.restaurantName}</Text>
          </View>
        </View>

        {/* ── Order Items ────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items Ordered</Text>
          {order.items.map(item => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemQtyBadge}>
                <Text style={styles.itemQty}>{item.quantity}x</Text>
              </View>
              <Text style={styles.itemName} numberOfLines={1}>{item.foodName}</Text>
              <Text style={styles.itemPrice}>{formatPrice(item.totalPrice)}</Text>
            </View>
          ))}
        </View>

        {/* ── Delivery Info ─────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Details</Text>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={Colors.primary} />
            <Text style={styles.infoText}>{order.deliveryAddress}</Text>
          </View>
          {order.deliveryInstructions && (
            <View style={styles.infoRow}>
              <Ionicons name="chatbubble-outline" size={16} color={Colors.primary} />
              <Text style={styles.infoText}>{order.deliveryInstructions}</Text>
            </View>
          )}
        </View>

        {/* ── Bill Summary ──────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bill Summary</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Subtotal</Text>
            <Text style={styles.billValue}>{formatPrice(order.subTotal)}</Text>
          </View>
          {order.discountAmount > 0 && (
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: Colors.success }]}>Discount</Text>
              <Text style={[styles.billValue, { color: Colors.success }]}>
                -{formatPrice(order.discountAmount)}
              </Text>
            </View>
          )}
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={styles.billValue}>
              {order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}
            </Text>
          </View>
          <View style={[styles.billRow, styles.billTotal]}>
            <Text style={styles.billTotalLabel}>Total</Text>
            <Text style={styles.billTotalValue}>{formatPrice(order.totalAmount)}</Text>
          </View>
          <View style={styles.paymentBadge}>
            <Ionicons
              name={order.paymentMethod === 'CashOnDelivery' ? 'cash-outline' : 'card-outline'}
              size={14}
              color={Colors.textSecondary}
            />
            <Text style={styles.paymentText}>
              {order.paymentMethod === 'CashOnDelivery' ? 'Cash on Delivery' : 'Card'} •{' '}
              <Text style={{ color: order.paymentStatus === 'Paid' ? Colors.success : Colors.warning }}>
                {order.paymentStatus}
              </Text>
            </Text>
          </View>
        </View>

        {/* ── Actions ───────────────────────────── */}
        <View style={[styles.actions, { paddingBottom: insets.bottom + Spacing[6] }]}>
          {order.canReview && (
            <Button
              title="Leave a Review"
              onPress={() =>
                router.push({
                  pathname: '/(customer)/(tabs)/orders',
                  params: { reviewOrderId: order.id },
                })
              }
              variant="primary"
            />
          )}
          {order.status === 'Delivered' && (
            <Button
              title="Reorder"
              onPress={async () => {
                await orderApi.reorder(order.id);
                router.push('/(customer)/cart');
              }}
              variant="outline"
            />
          )}
          <Button
            title="Back to Orders"
            onPress={() => router.replace('/(customer)/(tabs)/orders')}
            variant="ghost"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical:   Spacing[3],
    backgroundColor:   Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backBtn:  { padding: Spacing[1] },
  title:    { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  orderNum: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },

  statusBanner: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: Spacing[4],
    paddingVertical:   Spacing[4],
    marginHorizontal:  Spacing[4],
    marginTop:         Spacing[4],
    borderRadius:      BorderRadius.xl,
    gap:               Spacing[3],
  },
  statusDot: { width: 12, height: 12, borderRadius: 6, flexShrink: 0 },
  statusInfo:  { flex: 1 },
  statusLabel: { fontSize: 16, fontWeight: '700' },
  statusSub:   { fontSize: 13, color: Colors.textSecondary, marginTop: 3 },
  liveBadge: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               4,
    backgroundColor:   Colors.successLight,
    paddingHorizontal: Spacing[2],
    paddingVertical:   Spacing[0.5],
    borderRadius:      BorderRadius.full,
  },
  liveDot:  { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontSize: 10, fontWeight: '800', color: Colors.success, letterSpacing: 1 },

  card: {
    backgroundColor:   Colors.white,
    borderRadius:      BorderRadius.xl,
    padding:           Spacing[4],
    marginHorizontal:  Spacing[4],
    marginTop:         Spacing[3],
    ...Shadow.sm,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing[3] },

  riderRow:              { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  riderAvatar:           { width: 48, height: 48, borderRadius: 24 },
  riderAvatarPlaceholder:{
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  riderInitials: { color: Colors.white, fontWeight: '700', fontSize: 18 },
  riderInfo:     { flex: 1 },
  riderName:     { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  riderVehicle:  { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  callBtn: {
    width:           44,
    height:          44,
    borderRadius:    22,
    backgroundColor: Colors.success,
    alignItems:      'center',
    justifyContent:  'center',
  },

  mapPlaceholder: {
    height:          200,
    backgroundColor: Colors.background,
    borderRadius:    BorderRadius.xl,
    marginHorizontal: Spacing[4],
    marginTop:        Spacing[3],
    alignItems:       'center',
    justifyContent:   'center',
    borderWidth:      1.5,
    borderColor:      Colors.border,
    borderStyle:      'dashed',
    gap:              Spacing[2],
    padding:          Spacing[4],
  },
  mapText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', fontWeight: '500' },
  mapSub:  { fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },

  restRow:             { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  restLogo:            { width: 40, height: 40, borderRadius: BorderRadius.md },
  restLogoPlaceholder: {
    width: 40, height: 40, borderRadius: BorderRadius.md,
    backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center',
  },
  restName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },

  itemRow: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingVertical: Spacing[2],
    gap:             Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  itemQtyBadge: {
    width:           28,
    height:          28,
    borderRadius:    BorderRadius.md,
    backgroundColor: '#FFF0EB',
    alignItems:      'center',
    justifyContent:  'center',
  },
  itemQty:  { fontSize: 12, fontWeight: '700', color: Colors.primary },
  itemName: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  itemPrice:{ fontSize: 14, fontWeight: '600', color: Colors.textPrimary },

  infoRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[2], marginBottom: Spacing[2] },
  infoText: { flex: 1, fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },

  billRow:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing[2] },
  billLabel:      { fontSize: 14, color: Colors.textSecondary },
  billValue:      { fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  billTotal:      { marginTop: Spacing[2], paddingTop: Spacing[2], borderTopWidth: 1, borderTopColor: Colors.divider },
  billTotalLabel: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  billTotalValue: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  paymentBadge: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            Spacing[1.5],
    marginTop:      Spacing[3],
  },
  paymentText: { fontSize: 13, color: Colors.textSecondary },

  actions: {
    padding: Spacing[4],
    gap:     Spacing[3],
  },
});
