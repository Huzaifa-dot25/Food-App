import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Rating } from '@/components/common/Rating';
import { Badge }  from '@/components/common/Badge';
import { Colors } from '@/constants/colors';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { formatDeliveryTime, formatDistance, formatPrice } from '@/utils/formatters';
import type { RestaurantSummary } from '@/types/restaurant.types';

interface RestaurantCardProps {
  restaurant: RestaurantSummary;
  onFavoriteToggle?: (id: number) => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onFavoriteToggle,
}) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => router.push(`/(customer)/restaurant/${restaurant.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${restaurant.name} restaurant`}
    >
      {/* Cover Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: restaurant.coverImageUrl ?? restaurant.logoImageUrl ?? undefined }}
          style={styles.image}
          defaultSource={require('@/components/common/placeholder.png')}
        />

        {/* Favorite button */}
        <TouchableOpacity
          style={styles.favoriteBtn}
          onPress={() => onFavoriteToggle?.(restaurant.id)}
          accessibilityLabel={restaurant.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          accessibilityRole="button"
        >
          <Ionicons
            name={restaurant.isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={restaurant.isFavorite ? Colors.error : Colors.white}
          />
        </TouchableOpacity>

        {/* Closed overlay */}
        {!restaurant.isCurrentlyOpen && (
          <View style={styles.closedOverlay}>
            <Text style={styles.closedText}>Closed</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
          <Rating value={restaurant.averageRating} count={restaurant.totalRatings} size={12} />
        </View>

        <Text style={styles.category}>{restaurant.categoryName}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>
              {formatDeliveryTime(restaurant.estimatedDeliveryTimeMinutes)}
            </Text>
          </View>

          <View style={styles.dot} />

          <View style={styles.metaItem}>
            <Ionicons name="bicycle-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>
              {restaurant.deliveryFee === 0 ? 'Free delivery' : formatPrice(restaurant.deliveryFee)}
            </Text>
          </View>

          {restaurant.distanceKm !== null && (
            <>
              <View style={styles.dot} />
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.metaText}>{formatDistance(restaurant.distanceKm)}</Text>
              </View>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.xl,
    marginBottom:    Spacing[4],
    overflow:        'hidden',
    ...Shadow.md,
  },
  imageContainer: { position: 'relative', height: 160 },
  image:          { width: '100%', height: '100%', resizeMode: 'cover' },
  favoriteBtn: {
    position:        'absolute',
    top:             Spacing[3],
    right:           Spacing[3],
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius:    BorderRadius.full,
    padding:         Spacing[1.5],
  },
  closedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  closedText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  info:       { padding: Spacing[3] },
  titleRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   Spacing[0.5],
  },
  name: {
    fontSize:   16,
    fontWeight: '700',
    color:      Colors.textPrimary,
    flex:       1,
    marginRight: Spacing[2],
  },
  category: {
    fontSize:     12,
    color:        Colors.textSecondary,
    marginBottom: Spacing[2],
  },
  metaRow:  { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing[1] },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 12, color: Colors.textSecondary },
  dot: {
    width:           4,
    height:          4,
    borderRadius:    2,
    backgroundColor: Colors.border,
  },
});
