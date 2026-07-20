import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { formatPrice } from '@/utils/formatters';
import type { CartItem } from '@/types/order.types';

interface CartItemRowProps {
  item:         CartItem;
  onIncrease:   () => void;
  onDecrease:   () => void;
  onRemove:     () => void;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}) => (
  <View style={styles.row} accessibilityLabel={`${item.foodName}, quantity ${item.quantity}`}>
    <Image
      source={{ uri: item.foodImageUrl ?? undefined }}
      style={styles.image}
    />

    <View style={styles.info}>
      <Text style={styles.name} numberOfLines={1}>{item.foodName}</Text>
      <Text style={styles.price}>{formatPrice(item.unitPrice)}</Text>

      <View style={styles.qty}>
        <TouchableOpacity
          onPress={item.quantity === 1 ? onRemove : onDecrease}
          style={[styles.qtyBtn, item.quantity === 1 && styles.removeBtn]}
          accessibilityRole="button"
          accessibilityLabel={item.quantity === 1 ? 'Remove item' : 'Decrease quantity'}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={item.quantity === 1 ? 'trash-outline' : 'remove'}
            size={16}
            color={item.quantity === 1 ? Colors.error : Colors.primary}
          />
        </TouchableOpacity>

        <Text style={styles.qtyText}>{item.quantity}</Text>

        <TouchableOpacity
          onPress={onIncrease}
          style={styles.qtyBtn}
          accessibilityRole="button"
          accessibilityLabel="Increase quantity"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="add" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>

    <Text style={styles.total}>{formatPrice(item.totalPrice)}</Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    gap: Spacing[3],
  },
  image: {
    width:        64,
    height:       64,
    borderRadius: BorderRadius.lg,
    resizeMode:   'cover',
    backgroundColor: Colors.background,
  },
  info:    { flex: 1 },
  name:    { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  price:   { fontSize: 13, color: Colors.textSecondary, marginBottom: Spacing[1.5] },
  qty: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing[2],
  },
  qtyBtn: {
    width:           28,
    height:          28,
    borderRadius:    BorderRadius.md,
    borderWidth:     1,
    borderColor:     Colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
  },
  removeBtn: { borderColor: Colors.error },
  qtyText:   { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, minWidth: 20, textAlign: 'center' },
  total:     { fontSize: 14, fontWeight: '700', color: Colors.primary },
});
