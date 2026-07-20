import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge }   from '@/components/common/Badge';
import { Colors }  from '@/constants/colors';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { formatDate, formatPrice, formatTimeAgo } from '@/utils/formatters';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/constants';
import type { OrderSummary } from '@/types/order.types';

interface OrderCardProps {
  order:     OrderSummary;
  onReorder?: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onReorder }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => router.push(`/(customer)/(tabs)/orders`)}
      accessibilityRole="button"
      accessibilityLabel={`Order ${order.orderNumber}`}
    >
      <View style={styles.header}>
        {order.restaurantLogo ? (
          <Image source={{ uri: order.restaurantLogo }} style={styles.logo} />
        ) : (
          <View style={[styles.logo, styles.logoPlaceholder]}>
            <Ionicons name="restaurant-outline" size={20} color={Colors.textSecondary} />
          </View>
        )}
        <View style={styles.headerInfo}>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {order.restaurantName}
          </Text>
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
        </View>
        <Badge
          label={ORDER_STATUS_LABELS[order.status] ?? order.status}
          color={ORDER_STATUS_COLORS[order.status] ?? Colors.primary}
          bgColor={`${ORDER_STATUS_COLORS[order.status] ?? Colors.primary}18`}
          size="sm"
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <Text style={styles.meta}>{order.itemCount} items • {formatPrice(order.totalAmount)}</Text>
        <Text style={styles.meta}>{formatTimeAgo(order.createdAt)}</Text>
      </View>

      {(order.status === 'Delivered') && onReorder && (
        <TouchableOpacity
          style={styles.reorderBtn}
          onPress={onReorder}
          accessibilityRole="button"
          accessibilityLabel="Reorder"
        >
          <Ionicons name="refresh-outline" size={14} color={Colors.primary} />
          <Text style={styles.reorderText}>Reorder</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.xl,
    marginBottom:    Spacing[3],
    padding:         Spacing[4],
    ...Shadow.sm,
  },
  header:       { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  logo:         { width: 44, height: 44, borderRadius: BorderRadius.lg, resizeMode: 'cover' },
  logoPlaceholder: { backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  headerInfo:   { flex: 1 },
  restaurantName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  orderNumber:    { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  divider:      { height: 1, backgroundColor: Colors.divider, marginVertical: Spacing[3] },
  footer:       { flexDirection: 'row', justifyContent: 'space-between' },
  meta:         { fontSize: 13, color: Colors.textSecondary },
  reorderBtn:   {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
    marginTop:     Spacing[3],
    alignSelf:     'flex-start',
    paddingVertical: Spacing[1.5],
    paddingHorizontal: Spacing[3],
    borderRadius:  BorderRadius.full,
    borderWidth:   1,
    borderColor:   Colors.primary,
  },
  reorderText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
});
