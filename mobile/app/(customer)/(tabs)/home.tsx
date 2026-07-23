import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, RefreshControl, StatusBar, Image, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RestaurantCard }   from '@/components/restaurant/RestaurantCard';
import { FoodCard }         from '@/components/food/FoodCard';
import { LoadingSpinner }   from '@/components/common/LoadingSpinner';
import { Colors }           from '@/constants/colors';
import { Spacing, BorderRadius, Shadow } from '@/constants/spacing';
import { useAppSelector }   from '@/store';
import { selectUser }       from '@/store/slices/authSlice';
import { useLocation }      from '@/hooks/useLocation';
import { restaurantApi }    from '@/api/restaurantApi';
import { foodApi }          from '@/api/foodApi';
import type { RestaurantSummary } from '@/types/restaurant.types';
import type { FoodSummary }       from '@/types/food.types';

type CuisineCategory = { id: number; name: string; icon: string };

const CUISINE_ICONS: Record<string, string> = {
  Pizza: '🍕', Burgers: '🍔', Sushi: '🍣', Chinese: '🥡',
  Indian: '🍛', Mexican: '🌮', Italian: '🍝', Thai: '🍜',
  Desserts: '🧁', Healthy: '🥗',
};

export default function HomeScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const user    = useAppSelector(selectUser);
  const { location } = useLocation();

  const [featured,   setFeatured]   = useState<RestaurantSummary[]>([]);
  const [nearby,     setNearby]     = useState<RestaurantSummary[]>([]);
  const [popular,    setPopular]    = useState<FoodSummary[]>([]);
  const [categories, setCategories] = useState<CuisineCategory[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [featuredRes, categoriesRes] = await Promise.all([
        restaurantApi.getFeatured(),
        fetch(`${require('@/api/client').apiClient.defaults.baseURL}/restaurant-categories`)
          .then(r => r.json()).then(r => r.data ?? []).catch(() => []),
      ]);
      setFeatured(featuredRes);
      setCategories(categoriesRes.slice(0, 8));

      if (location) {
        const [nearbyRes] = await Promise.all([
          restaurantApi.getNearby(location.latitude, location.longitude, 5),
        ]);
        setNearby(nearbyRes);
      }
    } catch (e) {
      console.warn('Home load error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [location]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  if (loading) return <LoadingSpinner fullScreen />;

  const firstName = user?.firstName ?? 'there';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* ── Header ───────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {getTimeOfDay()} 👋</Text>
            <Text style={styles.name}>{firstName}!</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push('/(customer)/notifications')}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* ── Location ─────────────────────────────────────── */}
        <TouchableOpacity style={styles.locationRow} accessibilityRole="button">
          <Ionicons name="location-outline" size={16} color={Colors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {location ? 'Using your current location' : 'Set your location'}
          </Text>
          <Ionicons name="chevron-down" size={14} color={Colors.textSecondary} />
        </TouchableOpacity>

        {/* ── Search Bar (tap to navigate) ─────────────────── */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/(customer)/(tabs)/search')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Search for restaurants or food"
        >
          <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.searchPlaceholder}>Search restaurants or food…</Text>
        </TouchableOpacity>

        {/* ── Promo Banner ─────────────────────────────────── */}
        <View style={styles.banner}>
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerTag}>Limited Offer</Text>
            <Text style={styles.bannerTitle}>Get 20% off{'\n'}your first order!</Text>
            <TouchableOpacity
              style={styles.bannerBtn}
              onPress={() => router.push('/(customer)/(tabs)/search')}
              accessibilityRole="button"
            >
              <Text style={styles.bannerBtnText}>Order Now</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.bannerEmoji}>🎉</Text>
        </View>

        {/* ── Categories ───────────────────────────────────── */}
        {categories.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <TouchableOpacity onPress={() => router.push('/(customer)/(tabs)/search')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              keyExtractor={item => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.catItem}
                  onPress={() =>
                    router.push({
                      pathname: '/(customer)/(tabs)/search',
                      params: { categoryId: item.id, categoryName: item.name },
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={item.name}
                >
                  <View style={styles.catIcon}>
                    <Text style={styles.catEmoji}>
                      {CUISINE_ICONS[item.name] ?? '🍽️'}
                    </Text>
                  </View>
                  <Text style={styles.catName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* ── Featured Restaurants ─────────────────────────── */}
        {featured.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Restaurants</Text>
              <TouchableOpacity onPress={() => router.push('/(customer)/(tabs)/search')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={featured}
              keyExtractor={item => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hList}
              renderItem={({ item }) => (
                <View style={{ width: 280, marginRight: Spacing[4] }}>
                  <RestaurantCard restaurant={item} />
                </View>
              )}
            />
          </View>
        )}

        {/* ── Nearby Restaurants ───────────────────────────── */}
        {nearby.length > 0 && (
          <View style={[styles.section, styles.sectionPad]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Near You</Text>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: '/(customer)/(tabs)/search',
                    params: { sortBy: 'distance' },
                  })
                }
              >
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {nearby.map(item => (
              <RestaurantCard key={item.id} restaurant={item} />
            ))}
          </View>
        )}

        <View style={{ height: Spacing[6] }} />
      </ScrollView>
    </View>
  );
}

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'center',
    paddingHorizontal: Spacing[5],
    paddingVertical:  Spacing[3],
    backgroundColor:  Colors.white,
  },
  greeting:  { fontSize: 14, color: Colors.textSecondary },
  name:      { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  notifBtn:  { padding: Spacing[2] },

  locationRow: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              Spacing[1.5],
    paddingHorizontal: Spacing[5],
    paddingVertical:  Spacing[2],
    backgroundColor:  Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  locationText: { flex: 1, fontSize: 13, color: Colors.textSecondary },

  searchBar: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              Spacing[3],
    marginHorizontal: Spacing[5],
    marginVertical:   Spacing[4],
    backgroundColor:  Colors.white,
    borderRadius:     BorderRadius.full,
    paddingHorizontal: Spacing[4],
    paddingVertical:  Spacing[3],
    ...Shadow.sm,
  },
  searchPlaceholder: { fontSize: 15, color: Colors.textPlaceholder },

  banner: {
    marginHorizontal: Spacing[5],
    marginBottom:     Spacing[5],
    borderRadius:     BorderRadius['2xl'],
    backgroundColor:  Colors.primary,
    padding:          Spacing[5],
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    overflow:         'hidden',
  },
  bannerTextCol: { flex: 1 },
  bannerTag: {
    fontSize:        11,
    fontWeight:      '700',
    color:           'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
    borderRadius:    BorderRadius.full,
    alignSelf:       'flex-start',
    marginBottom:    Spacing[2],
  },
  bannerTitle: { fontSize: 18, fontWeight: '800', color: Colors.white, lineHeight: 24, marginBottom: Spacing[3] },
  bannerBtn: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius:    BorderRadius.full,
    alignSelf:       'flex-start',
  },
  bannerBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  bannerEmoji:   { fontSize: 56, marginLeft: Spacing[3] },

  section:    { marginBottom: Spacing[2] },
  sectionPad: { paddingHorizontal: Spacing[5] },
  sectionHeader: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'center',
    paddingHorizontal: Spacing[5],
    marginBottom:     Spacing[3],
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  seeAll:       { fontSize: 14, color: Colors.primary, fontWeight: '600' },

  catList:  { paddingHorizontal: Spacing[5] },
  catItem:  { alignItems: 'center', marginRight: Spacing[4], width: 64 },
  catIcon: {
    width:           56,
    height:          56,
    borderRadius:    BorderRadius.xl,
    backgroundColor: Colors.white,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    Spacing[1.5],
    ...Shadow.sm,
  },
  catEmoji:  { fontSize: 28 },
  catName: {
    fontSize:   11,
    color:      Colors.textSecondary,
    textAlign:  'center',
    fontWeight: '500',
  },
  hList: { paddingHorizontal: Spacing[5] },
});
