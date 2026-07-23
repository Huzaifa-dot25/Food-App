import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { RestaurantCard } from '@/components/restaurant/RestaurantCard';
import { EmptyState }     from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Colors }         from '@/constants/colors';
import { Spacing }        from '@/constants/spacing';
import { restaurantApi }  from '@/api/restaurantApi';
import type { RestaurantSummary } from '@/types/restaurant.types';

export default function FavoritesScreen() {
  const insets   = useSafeAreaInsets();
  const [favorites,  setFavorites]  = useState<RestaurantSummary[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await restaurantApi.getFavorites();
      setFavorites(res.items);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRemoveFavorite = async (id: number) => {
    try {
      await restaurantApi.removeFavorite(id);
      setFavorites(prev => prev.filter(r => r.id !== id));
      Toast.show({ type: 'success', text1: 'Removed from Favorites' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message });
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.count}>{favorites.length} saved</Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <RestaurantCard
              restaurant={{ ...item, isFavorite: true }}
              onFavoriteToggle={handleRemoveFavorite}
            />
          </View>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title="No Favorites Yet"
            message="Save your favourite restaurants to find them quickly."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical:   Spacing[4],
    backgroundColor:   Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  title:    { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  count:    { fontSize: 14, color: Colors.textSecondary },
  list:     { padding: Spacing[4], paddingBottom: Spacing[10] },
  cardWrap: { marginBottom: Spacing[2] },
});
