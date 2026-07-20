import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Rating }  from '@/components/common/Rating';
import { Badge }   from '@/components/common/Badge';
import { Colors }  from '@/constants/colors';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { formatPrice } from '@/utils/formatters';
import type { FoodSummary } from '@/types/food.types';

interface FoodCardProps {
  food:      FoodSummary;
  onPress:   () => void;
  onAddToCart?: () => void;
  layout?:   'grid' | 'list';
}

export const FoodCard: React.FC<FoodCardProps> = ({
  food,
  onPress,
  onAddToCart,
  layout = 'list',
}) => {
  if (layout === 'grid') {
    return (
      <TouchableOpacity
        style={styles.gridCard}
        onPress={onPress}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={food.name}
      >
        <Image
          source={{ uri: food.primaryImageUrl ?? undefined }}
          style={styles.gridImage}
        />
        {food.isBestSeller && (
          <Badge label="Best Seller" size="sm" style={styles.badge} />
        )}
        <View style={styles.gridInfo}>
          <Text style={styles.name} numberOfLines={1}>{food.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(food.effectivePrice)}</Text>
            {food.discountPrice && (
              <Text style={styles.originalPrice}>{formatPrice(food.price)}</Text>
            )}
          </View>
          <Rating value={food.averageRating} showCount={false} size={12} />
        </View>
        {onAddToCart && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={onAddToCart}
            accessibilityLabel={`Add ${food.name} to cart`}
            accessibilityRole="button"
          >
            <Ionicons name="add" size={20} color={Colors.white} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.listCard}
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={food.name}
    >
      <Image
        source={{ uri: food.primaryImageUrl ?? undefined }}
        style={styles.listImage}
      />
      <View style={styles.listInfo}>
        <Text style={styles.name} numberOfLines={1}>{food.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(food.effectivePrice)}</Text>
          {food.discountPrice && (
            <Text style={styles.originalPrice}>{formatPrice(food.price)}</Text>
          )}
        </View>
        <View style={styles.row}>
          <Rating value={food.averageRating} showCount={false} size={12} />
          {food.isBestSeller && <Badge label="Best Seller" size="sm" />}
        </View>
      </View>
      {onAddToCart && (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={onAddToCart}
          accessibilityLabel={`Add ${food.name} to cart`}
          accessibilityRole="button"
        >
          <Ionicons name="add" size={20} color={Colors.white} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // List layout
  listCard: {
    flexDirection:   'row',
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.xl,
    marginBottom:    Spacing[3],
    overflow:        'hidden',
    ...Shadow.sm,
  },
  listImage: { width: 90, height: 90, resizeMode: 'cover' },
  listInfo: {
    flex:    1,
    padding: Spacing[3],
    justifyContent: 'space-between',
  },

  // Grid layout
  gridCard: {
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.xl,
    overflow:        'hidden',
    flex:            1,
    margin:          Spacing[1.5],
    ...Shadow.sm,
  },
  gridImage: { width: '100%', height: 120, resizeMode: 'cover' },
  gridInfo:  { padding: Spacing[2.5] },

  // Shared
  name:          { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  priceRow:      { flexDirection: 'row', alignItems: 'center', gap: Spacing[1.5], marginBottom: 4 },
  price:         { fontSize: 14, fontWeight: '700', color: Colors.primary },
  originalPrice: { fontSize: 12, color: Colors.textSecondary, textDecorationLine: 'line-through' },
  row:           { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  badge:         { position: 'absolute', top: Spacing[2], left: Spacing[2] },
  addBtn: {
    position:        'absolute',
    bottom:          Spacing[2],
    right:           Spacing[2],
    backgroundColor: Colors.primary,
    borderRadius:    BorderRadius.full,
    width:           32,
    height:          32,
    alignItems:      'center',
    justifyContent:  'center',
  },
});
