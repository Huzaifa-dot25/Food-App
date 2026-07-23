import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, RefreshControl, Alert, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState }     from '@/components/common/EmptyState';
import { Colors }         from '@/constants/colors';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { formatPrice }    from '@/utils/formatters';
import { foodApi }        from '@/api/foodApi';
import { restaurantApi }  from '@/api/restaurantApi';
import type { FoodSummary, FoodCategory } from '@/types/food.types';

export default function OwnerMenuScreen() {
  const insets = useSafeAreaInsets();
  const [restaurantId,  setRestaurantId]  = useState<number | null>(null);
  const [categories,    setCategories]    = useState<FoodCategory[]>([]);
  const [foods,         setFoods]         = useState<FoodSummary[]>([]);
  const [activeCategory,setActiveCategory]= useState<number | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);

  const load = useCallback(async () => {
    try {
      const rest = await restaurantApi.getMine();
      setRestaurantId(rest.id);
      const [cats, foodList] = await Promise.all([
        foodApi.getCategories(rest.id),
        foodApi.getByRestaurant(rest.id),
      ]);
      setCategories(cats);
      setFoods(foodList);
    } catch (e) { console.warn(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (foodId: number) => {
    if (!restaurantId) return;
    try {
      await foodApi.toggleAvailability(restaurantId, foodId);
      setFoods(prev => prev.map(f =>
        f.id === foodId ? { ...f, isAvailable: !f.isAvailable } : f,
      ));
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message });
    }
  };

  const handleDelete = (foodId: number, foodName: string) => {
    Alert.alert('Delete Item', `Delete "${foodName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!restaurantId) return;
          try {
            await foodApi.delete(restaurantId, foodId);
            setFoods(prev => prev.filter(f => f.id !== foodId));
            Toast.show({ type: 'success', text1: 'Item deleted' });
          } catch (e: any) {
            Toast.show({ type: 'error', text1: 'Error', text2: e.message });
          }
        },
      },
    ]);
  };

  const filtered = activeCategory
    ? foods.filter(f => {
        const cat = categories.find(c => c.id === activeCategory);
        return cat ? f.categoryName === cat.name : true;
      })
    : foods;

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu</Text>
        <Text style={styles.count}>{foods.length} items</Text>
      </View>

      {/* Category filter */}
      <FlatList
        data={[{ id: null as any, name: 'All', description: null, sortOrder: 0, foodCount: foods.length }, ...categories]}
        horizontal
        keyExtractor={i => String(i.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catList}
        style={styles.catScroll}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.catChip, activeCategory === item.id && styles.catChipActive]}
            onPress={() => setActiveCategory(item.id)}
            accessibilityRole="button"
          >
            <Text style={[styles.catChipText, activeCategory === item.id && styles.catChipTextActive]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            icon="fast-food-outline"
            title="No Items"
            message="Add food items to your menu to start receiving orders."
          />
        }
        renderItem={({ item }) => (
          <View style={[styles.foodCard, !item.isAvailable && styles.foodCardDisabled]}>
            {item.primaryImageUrl ? (
              <Image source={{ uri: item.primaryImageUrl }} style={styles.foodImg} />
            ) : (
              <View style={[styles.foodImg, styles.foodImgPlaceholder]}>
                <Ionicons name="fast-food-outline" size={24} color={Colors.border} />
              </View>
            )}
            <View style={styles.foodInfo}>
              <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.foodCategory}>{item.categoryName}</Text>
              <Text style={styles.foodPrice}>{formatPrice(item.effectivePrice)}</Text>
            </View>
            <View style={styles.foodActions}>
              <Switch
                value={item.isAvailable}
                onValueChange={() => handleToggle(item.id)}
                trackColor={{ false: Colors.border, true: `${Colors.success}80` }}
                thumbColor={item.isAvailable ? Colors.success : Colors.textSecondary}
                accessibilityLabel={item.isAvailable ? 'Mark unavailable' : 'Mark available'}
              />
              <TouchableOpacity
                onPress={() => handleDelete(item.id, item.name)}
                style={styles.deleteBtn}
                accessibilityRole="button"
                accessibilityLabel="Delete food item"
              >
                <Ionicons name="trash-outline" size={18} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical:  Spacing[4],
    backgroundColor:  Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  title:      { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  count:      { fontSize: 14, color: Colors.textSecondary },
  catScroll:  { maxHeight: 52, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  catList:    { paddingHorizontal: Spacing[4], paddingVertical: Spacing[2], gap: Spacing[2], alignItems: 'center' },
  catChip: {
    paddingHorizontal: Spacing[3],
    paddingVertical:   Spacing[1.5],
    borderRadius:      BorderRadius.full,
    borderWidth:       1,
    borderColor:       Colors.border,
    backgroundColor:   Colors.white,
  },
  catChipActive:     { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catChipText:       { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  catChipTextActive: { color: Colors.white, fontWeight: '600' },
  list:       { padding: Spacing[4], paddingBottom: Spacing[10] },
  foodCard: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.xl,
    marginBottom:    Spacing[3],
    overflow:        'hidden',
    ...Shadow.sm,
  },
  foodCardDisabled: { opacity: 0.55 },
  foodImg: {
    width:       80,
    height:      80,
    resizeMode:  'cover',
    backgroundColor: Colors.background,
  },
  foodImgPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  foodInfo:     { flex: 1, padding: Spacing[3] },
  foodName:     { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  foodCategory: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  foodPrice:    { fontSize: 15, fontWeight: '800', color: Colors.primary },
  foodActions:  { paddingRight: Spacing[3], gap: Spacing[2], alignItems: 'center' },
  deleteBtn:    { padding: Spacing[1] },
});
