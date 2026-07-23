import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { RestaurantCard } from '@/components/restaurant/RestaurantCard';
import { FoodCard }       from '@/components/food/FoodCard';
import { EmptyState }     from '@/components/common/EmptyState';
import { Colors }         from '@/constants/colors';
import { BorderRadius, Spacing, Shadow } from '@/constants/spacing';
import { debounce }       from '@/utils';
import { restaurantApi }  from '@/api/restaurantApi';
import { foodApi }        from '@/api/foodApi';
import { useLocation }    from '@/hooks/useLocation';
import type { RestaurantSummary } from '@/types/restaurant.types';
import type { FoodSummary }       from '@/types/food.types';

type Tab    = 'restaurants' | 'food';
type SortBy = 'rating' | 'distance' | 'deliveryFee';

const SORT_OPTIONS: { key: SortBy; label: string }[] = [
  { key: 'rating',      label: '⭐ Top Rated' },
  { key: 'distance',    label: '📍 Nearest' },
  { key: 'deliveryFee', label: '🚴 Free Delivery' },
];

export default function SearchScreen() {
  const insets  = useSafeAreaInsets();
  const params  = useLocalSearchParams<{ categoryId?: string; sortBy?: SortBy; categoryName?: string }>();
  const { location } = useLocation();

  const [query,       setQuery]       = useState('');
  const [tab,         setTab]         = useState<Tab>('restaurants');
  const [sortBy,      setSortBy]      = useState<SortBy>((params.sortBy as SortBy) ?? 'rating');
  const [restaurants, setRestaurants] = useState<RestaurantSummary[]>([]);
  const [foods,       setFoods]       = useState<FoodSummary[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [searched,    setSearched]    = useState(false);
  const [openOnly,    setOpenOnly]    = useState(false);

  const inputRef = useRef<TextInput>(null);

  const doSearch = useCallback(
    debounce(async (text: string) => {
      if (!text.trim() && !params.categoryId) return;
      setLoading(true);
      setSearched(true);
      try {
        const [rResult, fResult] = await Promise.all([
          restaurantApi.search({
            keyword:    text.trim() || undefined,
            categoryId: params.categoryId ? Number(params.categoryId) : undefined,
            sortBy,
            isOpen:     openOnly || undefined,
            latitude:   location?.latitude,
            longitude:  location?.longitude,
            radiusKm:   sortBy === 'distance' ? 10 : undefined,
            pageSize:   20,
          }),
          foodApi.search({
            keyword:  text.trim() || undefined,
            sortBy:   sortBy === 'rating' ? 'rating' : undefined,
            pageSize: 20,
          }),
        ]);
        setRestaurants(rResult.items);
        setFoods(fResult.items);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    }, 400),
    [sortBy, openOnly, location, params.categoryId],
  );

  const handleQueryChange = (text: string) => {
    setQuery(text);
    doSearch(text);
  };

  const handleSortChange = async (s: SortBy) => {
    setSortBy(s);
    if (query || params.categoryId) doSearch(query);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Search Header ─────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Restaurants, food, cuisine…"
            placeholderTextColor={Colors.textPlaceholder}
            value={query}
            onChangeText={handleQueryChange}
            autoFocus={!params.categoryId}
            returnKeyType="search"
            onSubmitEditing={() => doSearch(query)}
            accessibilityLabel="Search input"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => { setQuery(''); setRestaurants([]); setFoods([]); setSearched(false); }}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Category chip ─────────────────────────────── */}
      {params.categoryName && (
        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{params.categoryName}</Text>
          </View>
        </View>
      )}

      {/* ── Sort + Filter row ─────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {SORT_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.filterChip, sortBy === opt.key && styles.filterChipActive]}
            onPress={() => handleSortChange(opt.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: sortBy === opt.key }}
          >
            <Text style={[styles.filterChipText, sortBy === opt.key && styles.filterChipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.filterChip, openOnly && styles.filterChipActive]}
          onPress={() => { setOpenOnly(o => !o); doSearch(query); }}
          accessibilityRole="button"
          accessibilityState={{ selected: openOnly }}
        >
          <Text style={[styles.filterChipText, openOnly && styles.filterChipTextActive]}>
            🟢 Open Now
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Tabs ──────────────────────────────────────── */}
      <View style={styles.tabs}>
        {(['restaurants', 'food'] as Tab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t }}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'restaurants' ? `Restaurants (${restaurants.length})` : `Food (${foods.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Results ───────────────────────────────────── */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : !searched ? (
        <EmptyState
          icon="search-outline"
          title="Find Great Food"
          message="Search for restaurants, dishes, or cuisines"
        />
      ) : tab === 'restaurants' ? (
        restaurants.length === 0 ? (
          <EmptyState
            icon="restaurant-outline"
            title="No Restaurants Found"
            message="Try a different search or change filters"
          />
        ) : (
          <FlatList
            data={restaurants}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => (
              <View style={styles.cardWrap}>
                <RestaurantCard restaurant={item} />
              </View>
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : foods.length === 0 ? (
        <EmptyState
          icon="fast-food-outline"
          title="No Food Found"
          message="Try a different search term"
        />
      ) : (
        <FlatList
          data={foods}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.cardWrap}>
              <FoodCard food={item} layout="list" onPress={() => {}} />
            </View>
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor:   Colors.white,
    paddingHorizontal: Spacing[4],
    paddingVertical:   Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  searchBox: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   Colors.background,
    borderRadius:      BorderRadius.full,
    paddingHorizontal: Spacing[4],
    paddingVertical:   Spacing[2.5],
    gap:               Spacing[2],
  },
  input: { flex: 1, fontSize: 15, color: Colors.textPrimary, padding: 0 },

  chipRow: { flexDirection: 'row', paddingHorizontal: Spacing[4], paddingTop: Spacing[2] },
  chip: {
    backgroundColor:   Colors.primary,
    borderRadius:      BorderRadius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical:   Spacing[1],
  },
  chipText: { fontSize: 12, color: Colors.white, fontWeight: '600' },

  filterScroll: { maxHeight: 48 },
  filterRow: {
    paddingHorizontal: Spacing[4],
    gap:               Spacing[2],
    alignItems:        'center',
    paddingVertical:   Spacing[2],
  },
  filterChip: {
    paddingHorizontal: Spacing[3],
    paddingVertical:   Spacing[1.5],
    borderRadius:      BorderRadius.full,
    borderWidth:       1,
    borderColor:       Colors.border,
    backgroundColor:   Colors.white,
  },
  filterChipActive:     { borderColor: Colors.primary, backgroundColor: '#FFF0EB' },
  filterChipText:       { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  filterChipTextActive: { color: Colors.primary, fontWeight: '600' },

  tabs: {
    flexDirection:     'row',
    backgroundColor:   Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  tab: {
    flex:           1,
    paddingVertical: Spacing[3],
    alignItems:     'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive:     { borderBottomColor: Colors.primary },
  tabText:       { fontSize: 14, fontWeight: '500', color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },

  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list:       { padding: Spacing[4], paddingBottom: Spacing[10] },
  cardWrap:   { marginBottom: Spacing[2] },
});
