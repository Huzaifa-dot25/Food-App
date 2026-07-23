import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  FlatList, RefreshControl, Animated, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { FoodCard }       from '@/components/food/FoodCard';
import { Rating }         from '@/components/common/Rating';
import { Badge }          from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState }     from '@/components/common/ErrorState';
import { Colors }         from '@/constants/colors';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { formatDeliveryTime, formatPrice } from '@/utils/formatters';
import { restaurantApi }  from '@/api/restaurantApi';
import { foodApi }        from '@/api/foodApi';
import { reviewApi }      from '@/api/reviewApi';
import { useCart }        from '@/hooks/useCart';
import type { Restaurant } from '@/types/restaurant.types';
import type { FoodSummary, FoodCategory } from '@/types/food.types';
import type { Review }     from '@/types/api.types';

const COVER_HEIGHT = 220;

export default function RestaurantDetailScreen() {
  const { id }   = useLocalSearchParams<{ id: string }>();
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const { addItem } = useCart();

  const [restaurant,  setRestaurant]  = useState<Restaurant | null>(null);
  const [categories,  setCategories]  = useState<FoodCategory[]>([]);
  const [foods,       setFoods]       = useState<FoodSummary[]>([]);
  const [reviews,     setReviews]     = useState<Review[]>([]);
  const [activeTab,   setActiveTab]   = useState<'menu' | 'info' | 'reviews'>('menu');
  const [activeCategory, setActiveCat] = useState<number | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const scrollY = new Animated.Value(0);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [rest, cats, revs] = await Promise.all([
        restaurantApi.getById(Number(id)),
        foodApi.getCategories(Number(id)),
        reviewApi.getRestaurantReviews(Number(id), 1, 5),
      ]);
      setRestaurant(rest);
      setCategories(cats);
      setReviews(revs.items);

      // Load foods
      const foodData = await foodApi.getByRestaurant(Number(id));
      setFoods(foodData);
      if (cats.length > 0) setActiveCat(cats[0].id);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load restaurant.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleAddToCart = async (foodId: number) => {
    try {
      await addItem(foodId, 1);
      Toast.show({ type: 'success', text1: 'Added to Cart', text2: 'Item added successfully.' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message });
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error || !restaurant) return <ErrorState message={error ?? 'Restaurant not found.'} onRetry={load} />;

  const filteredFoods = activeCategory
    ? foods.filter(f => {
        const cat = categories.find(c => c.id === activeCategory);
        return cat ? f.categoryName === cat.name : true;
      })
    : foods;

  const headerBgColor = scrollY.interpolate({
    inputRange:  [0, COVER_HEIGHT - 60],
    outputRange: ['transparent', Colors.white],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* ── Floating Back Button ─────────────────────── */}
      <Animated.View style={[styles.floatingHeader, { backgroundColor: headerBgColor, paddingTop: insets.top }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/(customer)/notifications')}
          style={styles.backBtn}
          accessibilityRole="button"
        >
          <Ionicons name="share-social-outline" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={Colors.primary} />}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        {/* ── Cover Image ──────────────────────────── */}
        <View style={styles.cover}>
          <Image
            source={{ uri: restaurant.coverImageUrl ?? restaurant.logoImageUrl ?? undefined }}
            style={styles.coverImage}
            resizeMode="cover"
          />
          {!restaurant.isCurrentlyOpen && (
            <View style={styles.closedOverlay}>
              <Text style={styles.closedText}>Currently Closed</Text>
            </View>
          )}
        </View>

        {/* ── Info Card ────────────────────────────── */}
        <View style={styles.infoCard}>
          {/* Logo */}
          <View style={styles.logoWrap}>
            <Image
              source={{ uri: restaurant.logoImageUrl ?? undefined }}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>

          <View style={styles.infoBody}>
            <Text style={styles.restName}>{restaurant.name}</Text>
            <Text style={styles.restCategory}>{restaurant.categoryName}</Text>
            <Text style={styles.restCity}>{restaurant.city}</Text>

            <View style={styles.metaRow}>
              <Rating value={restaurant.averageRating} count={restaurant.totalRatings} size={13} />
              <View style={styles.dot} />
              <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{formatDeliveryTime(restaurant.estimatedDeliveryTimeMinutes)}</Text>
              <View style={styles.dot} />
              <Ionicons name="bicycle-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.metaText}>
                {restaurant.deliveryFee === 0 ? 'Free' : formatPrice(restaurant.deliveryFee)}
              </Text>
            </View>

            {restaurant.minOrderAmount > 0 && (
              <Text style={styles.minOrder}>
                Min. order: {formatPrice(restaurant.minOrderAmount)}
              </Text>
            )}
          </View>
        </View>

        {/* ── Tabs ─────────────────────────────────── */}
        <View style={styles.tabs}>
          {(['menu', 'info', 'reviews'] as const).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, activeTab === t && styles.tabBtnActive]}
              onPress={() => setActiveTab(t)}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === t }}
            >
              <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Menu Tab ─────────────────────────────── */}
        {activeTab === 'menu' && (
          <View style={styles.menuSection}>
            {/* Category filter */}
            {categories.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.catRow}
              >
                <TouchableOpacity
                  style={[styles.catChip, !activeCategory && styles.catChipActive]}
                  onPress={() => setActiveCat(null)}
                >
                  <Text style={[styles.catChipText, !activeCategory && styles.catChipTextActive]}>All</Text>
                </TouchableOpacity>
                {categories.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.catChip, activeCategory === c.id && styles.catChipActive]}
                    onPress={() => setActiveCat(c.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: activeCategory === c.id }}
                  >
                    <Text style={[styles.catChipText, activeCategory === c.id && styles.catChipTextActive]}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Food list */}
            {filteredFoods.map(food => (
              <View key={food.id} style={styles.foodWrap}>
                <FoodCard
                  food={food}
                  onPress={() => router.push(`/(customer)/food/${food.id}`)}
                  onAddToCart={() => handleAddToCart(food.id)}
                  layout="list"
                />
              </View>
            ))}
          </View>
        )}

        {/* ── Info Tab ─────────────────────────────── */}
        {activeTab === 'info' && (
          <View style={styles.infoSection}>
            {restaurant.description ? (
              <View style={styles.infoBlock}>
                <Text style={styles.infoLabel}>About</Text>
                <Text style={styles.infoText}>{restaurant.description}</Text>
              </View>
            ) : null}

            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoText}>
                {restaurant.street}, {restaurant.city}, {restaurant.state} {restaurant.zipCode}
              </Text>
            </View>

            {restaurant.phone && (
              <View style={styles.infoBlock}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoText}>{restaurant.phone}</Text>
              </View>
            )}

            {restaurant.businessHours?.length > 0 && (
              <View style={styles.infoBlock}>
                <Text style={styles.infoLabel}>Hours</Text>
                {restaurant.businessHours.map(h => (
                  <View key={h.dayOfWeek} style={styles.hourRow}>
                    <Text style={styles.dayName}>{h.dayName}</Text>
                    <Text style={styles.hourText}>
                      {h.isClosed ? 'Closed' : `${h.openTime} – ${h.closeTime}`}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── Reviews Tab ──────────────────────────── */}
        {activeTab === 'reviews' && (
          <View style={styles.reviewsSection}>
            {reviews.length === 0 ? (
              <View style={styles.emptyReviews}>
                <Ionicons name="chatbubble-outline" size={48} color={Colors.border} />
                <Text style={styles.emptyText}>No reviews yet</Text>
              </View>
            ) : (
              reviews.map(review => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewInitial}>
                        {review.customerName?.[0]?.toUpperCase() ?? 'U'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewName}>{review.customerName}</Text>
                      <Rating value={review.rating} showCount={false} size={12} />
                    </View>
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
                  {review.ownerReply && (
                    <View style={styles.ownerReply}>
                      <Text style={styles.ownerReplyLabel}>Owner replied:</Text>
                      <Text style={styles.ownerReplyText}>{review.ownerReply}</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* ── Cart FAB ─────────────────────────────────── */}
      <View style={[styles.cartFab, { bottom: insets.bottom + Spacing[4] }]}>
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => router.push('/(customer)/cart')}
          accessibilityRole="button"
          accessibilityLabel="View cart"
        >
          <Ionicons name="cart-outline" size={22} color={Colors.white} />
          <Text style={styles.cartBtnText}>View Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.background },
  floatingHeader: {
    position:         'absolute',
    top:              0,
    left:             0,
    right:            0,
    zIndex:           100,
    flexDirection:    'row',
    justifyContent:   'space-between',
    paddingHorizontal: Spacing[4],
    paddingBottom:    Spacing[2],
  },
  backBtn: {
    width:           40,
    height:          40,
    borderRadius:    BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems:      'center',
    justifyContent:  'center',
    ...Shadow.sm,
  },
  cover:        { height: COVER_HEIGHT, backgroundColor: Colors.border },
  coverImage:   { width: '100%', height: '100%' },
  closedOverlay:{
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  closedText: { color: Colors.white, fontSize: 18, fontWeight: '700' },

  infoCard: {
    backgroundColor:   Colors.white,
    marginHorizontal:  Spacing[4],
    marginTop:         -Spacing[6],
    borderRadius:      BorderRadius['2xl'],
    padding:           Spacing[4],
    ...Shadow.md,
    flexDirection:     'row',
    alignItems:        'flex-start',
    gap:               Spacing[3],
    marginBottom:      Spacing[2],
  },
  logoWrap: {
    width:        60,
    height:       60,
    borderRadius: BorderRadius.lg,
    overflow:     'hidden',
    borderWidth:  2,
    borderColor:  Colors.white,
    ...Shadow.sm,
  },
  logo:       { width: '100%', height: '100%' },
  infoBody:   { flex: 1 },
  restName:   { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, marginBottom: 2 },
  restCategory: { fontSize: 13, color: Colors.textSecondary },
  restCity:   { fontSize: 12, color: Colors.textSecondary, marginBottom: Spacing[2] },
  metaRow:    { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing[1.5] },
  metaText:   { fontSize: 12, color: Colors.textSecondary },
  dot:        { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.border },
  minOrder:   { fontSize: 11, color: Colors.textSecondary, marginTop: Spacing[1.5] },

  tabs: {
    flexDirection:     'row',
    backgroundColor:   Colors.white,
    marginBottom:      Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  tabBtn: {
    flex:              1,
    paddingVertical:   Spacing[3],
    alignItems:        'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabBtnActive:  { borderBottomColor: Colors.primary },
  tabText:       { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },

  menuSection: { paddingHorizontal: Spacing[4] },
  catRow: {
    paddingVertical:   Spacing[3],
    gap:               Spacing[2],
    paddingHorizontal: Spacing[1],
  },
  catChip: {
    paddingHorizontal: Spacing[3],
    paddingVertical:   Spacing[1.5],
    borderRadius:      BorderRadius.full,
    borderWidth:       1,
    borderColor:       Colors.border,
    backgroundColor:   Colors.white,
  },
  catChipActive:    { borderColor: Colors.primary, backgroundColor: '#FFF0EB' },
  catChipText:      { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  catChipTextActive:{ color: Colors.primary, fontWeight: '600' },
  foodWrap: { marginBottom: Spacing[2] },

  infoSection: { padding: Spacing[4], gap: Spacing[4] },
  infoBlock: {},
  infoLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing[2] },
  infoText:  { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
  hourRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing[1.5],
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  dayName:  { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  hourText: { fontSize: 13, color: Colors.textSecondary },

  reviewsSection: { padding: Spacing[4], gap: Spacing[3] },
  emptyReviews:   { alignItems: 'center', paddingVertical: Spacing[10] },
  emptyText:      { fontSize: 16, color: Colors.textSecondary, marginTop: Spacing[3] },
  reviewCard: {
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.xl,
    padding:         Spacing[4],
    ...Shadow.sm,
  },
  reviewHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            Spacing[3],
    marginBottom:   Spacing[2],
  },
  reviewAvatar: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: Colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
  },
  reviewInitial: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  reviewName:    { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  reviewDate:    { fontSize: 11, color: Colors.textSecondary },
  reviewComment: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  ownerReply: {
    marginTop:        Spacing[3],
    padding:          Spacing[3],
    backgroundColor:  Colors.background,
    borderRadius:     BorderRadius.lg,
    borderLeftWidth:  3,
    borderLeftColor:  Colors.primary,
  },
  ownerReplyLabel: { fontSize: 12, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
  ownerReplyText:  { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  cartFab: { position: 'absolute', left: Spacing[5], right: Spacing[5] },
  cartBtn: {
    backgroundColor: Colors.primary,
    borderRadius:    BorderRadius.full,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: Spacing[4],
    gap:             Spacing[2],
    ...Shadow.lg,
  },
  cartBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
