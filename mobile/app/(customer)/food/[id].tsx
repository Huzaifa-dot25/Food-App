import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Rating }         from '@/components/common/Rating';
import { Badge }          from '@/components/common/Badge';
import { Button }         from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState }     from '@/components/common/ErrorState';
import { Colors }         from '@/constants/colors';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { formatPrice }    from '@/utils/formatters';
import { foodApi }        from '@/api/foodApi';
import { useCart }        from '@/hooks/useCart';
import type { Food }      from '@/types/food.types';

const { width } = Dimensions.get('window');

export default function FoodDetailScreen() {
  const { id }  = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { addItem, isLoading: cartLoading } = useCart();

  const [food,      setFood]      = useState<Food | null>(null);
  const [quantity,  setQuantity]  = useState(1);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!id) return;
    foodApi.getById(Number(id))
      .then(f => { setFood(f); })
      .catch(e => setError(e.message ?? 'Failed to load food.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!food) return;
    try {
      await addItem(food.id, quantity);
      Toast.show({ type: 'success', text1: 'Added to Cart', text2: `${food.name} x${quantity}` });
      router.back();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message });
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error || !food) return <ErrorState message={error ?? 'Food not found.'} onRetry={() => router.back()} />;

  const totalPrice = food.effectivePrice * quantity;
  const images     = food.images.length > 0
    ? food.images.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
    : [];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Image Gallery ───────────────────────── */}
        <View style={styles.gallery}>
          {images.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={e => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / width);
                  setActiveImg(idx);
                }}
                scrollEventThrottle={16}
              >
                {images.map((img, i) => (
                  <Image key={i} source={{ uri: img.imageUrl }} style={styles.image} resizeMode="cover" />
                ))}
              </ScrollView>
              {images.length > 1 && (
                <View style={styles.dots}>
                  {images.map((_, i) => (
                    <View key={i} style={[styles.dot, i === activeImg && styles.dotActive]} />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Ionicons name="fast-food-outline" size={80} color={Colors.border} />
            </View>
          )}

          {/* Back button */}
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + Spacing[2] }]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* ── Info ────────────────────────────────── */}
        <View style={styles.content}>
          {/* Tags */}
          <View style={styles.tags}>
            {food.isBestSeller  && <Badge label="Best Seller"  color={Colors.primary}  bgColor="#FFF0EB" />}
            {food.isPopular     && <Badge label="Popular"      color={Colors.secondary} bgColor="#EEF6FF" />}
            {food.isRecommended && <Badge label="Recommended"  color="#27AE60"          bgColor="#EEFFF5" />}
            {food.isVegetarian  && <Badge label="🌱 Veg"        color="#27AE60"          bgColor="#EEFFF5" />}
            {food.isSpicy       && <Badge label="🌶 Spicy"       color={Colors.error}     bgColor={Colors.errorLight} />}
          </View>

          {/* Name */}
          <Text style={styles.name}>{food.name}</Text>

          {/* Restaurant */}
          <TouchableOpacity
            style={styles.restaurantLink}
            onPress={() => router.push(`/(customer)/restaurant/${food.restaurantId}`)}
            accessibilityRole="button"
          >
            <Ionicons name="restaurant-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.restaurantName}>{food.restaurantName}</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Rating value={food.averageRating} count={food.totalRatings} size={14} />
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(food.effectivePrice)}</Text>
            {food.discountPrice && (
              <View style={styles.discountBadge}>
                <Text style={styles.originalPrice}>{formatPrice(food.price)}</Text>
                <Text style={styles.discountPct}>
                  {Math.round((1 - food.discountPrice / food.price) * 100)}% off
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          {food.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{food.description}</Text>
            </View>
          )}

          {/* Category */}
          <View style={styles.infoRow}>
            <Ionicons name="pricetag-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{food.categoryName}</Text>
          </View>
        </View>
      </ScrollView>

      {/* ── Bottom Bar ──────────────────────────────── */}
      {food.isAvailable ? (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing[2] }]}>
          {/* Quantity */}
          <View style={styles.qtyControl}>
            <TouchableOpacity
              onPress={() => setQuantity(q => Math.max(1, q - 1))}
              style={styles.qtyBtn}
              accessibilityRole="button"
              accessibilityLabel="Decrease quantity"
              disabled={quantity <= 1}
            >
              <Ionicons name="remove" size={20} color={quantity <= 1 ? Colors.border : Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity
              onPress={() => setQuantity(q => Math.min(50, q + 1))}
              style={styles.qtyBtn}
              accessibilityRole="button"
              accessibilityLabel="Increase quantity"
            >
              <Ionicons name="add" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <Button
            title={`Add to Cart • ${formatPrice(totalPrice)}`}
            onPress={handleAddToCart}
            isLoading={cartLoading}
            style={styles.addBtn}
            fullWidth={false}
          />
        </View>
      ) : (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing[2] }]}>
          <View style={styles.unavailable}>
            <Ionicons name="close-circle-outline" size={20} color={Colors.error} />
            <Text style={styles.unavailableText}>Currently Unavailable</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  gallery:   { position: 'relative' },
  image:     { width, height: 280, backgroundColor: Colors.background },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  dots: {
    position:       'absolute',
    bottom:         Spacing[3],
    left:           0,
    right:          0,
    flexDirection:  'row',
    justifyContent: 'center',
    gap:            Spacing[1.5],
  },
  dot:      { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive:{ backgroundColor: Colors.white, width: 16 },
  backBtn: {
    position:        'absolute',
    left:            Spacing[4],
    zIndex:          10,
    width:           40,
    height:          40,
    borderRadius:    BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems:      'center',
    justifyContent:  'center',
    ...Shadow.sm,
  },

  content: { padding: Spacing[5] },
  tags:    { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2], marginBottom: Spacing[3] },
  name: {
    fontSize:   24,
    fontWeight: '800',
    color:      Colors.textPrimary,
    marginBottom: Spacing[2],
  },
  restaurantLink: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing[1],
    marginBottom:  Spacing[2],
  },
  restaurantName: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  ratingRow:      { marginBottom: Spacing[3] },
  priceRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], marginBottom: Spacing[4] },
  price:          { fontSize: 26, fontWeight: '800', color: Colors.primary },
  discountBadge:  { gap: Spacing[1] },
  originalPrice:  { fontSize: 14, color: Colors.textSecondary, textDecorationLine: 'line-through' },
  discountPct:    { fontSize: 12, color: Colors.success, fontWeight: '600' },

  section:      { marginBottom: Spacing[4] },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing[2] },
  description:  { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
  infoRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing[2],
    marginBottom:  Spacing[2],
  },
  infoText:     { fontSize: 14, color: Colors.textSecondary },

  bottomBar: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: Spacing[5],
    paddingTop:        Spacing[3],
    backgroundColor:   Colors.white,
    borderTopWidth:    1,
    borderTopColor:    Colors.border,
    gap:               Spacing[4],
    ...Shadow.lg,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems:    'center',
    borderWidth:   1.5,
    borderColor:   Colors.primary,
    borderRadius:  BorderRadius.full,
    overflow:      'hidden',
  },
  qtyBtn:  { paddingHorizontal: Spacing[3], paddingVertical: Spacing[2.5] },
  qtyText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, minWidth: 28, textAlign: 'center' },
  addBtn:  { flex: 1 },
  unavailable: {
    flex:           1,
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            Spacing[2],
    paddingVertical: Spacing[3],
  },
  unavailableText: { fontSize: 16, color: Colors.error, fontWeight: '600' },
});
