import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, TextInput, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Badge }          from '@/components/common/Badge';
import { Rating }         from '@/components/common/Rating';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState }     from '@/components/common/EmptyState';
import { Colors }         from '@/constants/colors';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { formatDate }     from '@/utils/formatters';
import { apiGet, apiPatch } from '@/api/client';

interface AdminRestaurant {
  id: number; name: string; ownerName: string; ownerEmail: string;
  city: string; status: string; averageRating: number;
  totalOrders: number; totalRevenue: number; createdAt: string;
}

const STATUS_FILTERS = ['All', 'PendingApproval', 'Active', 'Suspended'];

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  Active:          { color: Colors.success, bg: Colors.successLight },
  PendingApproval: { color: Colors.warning, bg: Colors.warningLight },
  Suspended:       { color: Colors.error,   bg: Colors.errorLight },
};

export default function AdminRestaurantsScreen() {
  const insets = useSafeAreaInsets();
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [statusFilter,setStatusFilter]= useState('All');
  const [search,      setSearch]      = useState('');
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);

  const load = useCallback(async () => {
    try {
      const params: Record<string, any> = { pageSize: 50 };
      if (statusFilter !== 'All') params.status = statusFilter;
      const res = await apiGet<any>('/admin/restaurants', params);
      setRestaurants(res.items ?? []);
    } catch (e) { console.warn(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, [statusFilter]);

  useEffect(() => { setLoading(true); load(); }, [statusFilter]);

  const handleApprove = async (id: number, name: string) => {
    try {
      await apiPatch(`/admin/restaurants/${id}/approve`);
      Toast.show({ type: 'success', text1: 'Restaurant Approved', text2: name });
      load();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message });
    }
  };

  const handleSuspend = (id: number, name: string) => {
    Alert.alert(`Suspend "${name}"?`, 'This will prevent the restaurant from receiving orders.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Suspend', style: 'destructive',
        onPress: async () => {
          try {
            await apiPatch(`/admin/restaurants/${id}/suspend`, { reason: 'Admin action' });
            Toast.show({ type: 'success', text1: 'Restaurant Suspended' });
            load();
          } catch (e: any) {
            Toast.show({ type: 'error', text1: 'Error', text2: e.message });
          }
        },
      },
    ]);
  };

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.city.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading && restaurants.length === 0) return <LoadingSpinner fullScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Restaurants</Text>
        <Text style={styles.count}>{filtered.length}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or city…"
          placeholderTextColor={Colors.textPlaceholder}
          value={search}
          onChangeText={setSearch}
          accessibilityLabel="Search restaurants"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} accessibilityRole="button" accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Status filters */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.chip, statusFilter === s && styles.chipActive]}
            onPress={() => setStatusFilter(s)}
            accessibilityRole="button"
            accessibilityState={{ selected: statusFilter === s }}
          >
            <Text style={[styles.chipText, statusFilter === s && styles.chipTextActive]}>
              {s === 'PendingApproval' ? 'Pending' : s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
        ListEmptyComponent={<EmptyState icon="restaurant-outline" title="No Restaurants Found" message="Try changing filters." />}
        renderItem={({ item }) => {
          const sc = STATUS_COLORS[item.status] ?? { color: Colors.textSecondary, bg: Colors.background };
          return (
            <View style={styles.card}>
              {/* Top row */}
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.restName}>{item.name}</Text>
                  <Text style={styles.restCity}>{item.city}</Text>
                </View>
                <Badge label={item.status === 'PendingApproval' ? 'Pending' : item.status} color={sc.color} bgColor={sc.bg} size="sm" />
              </View>

              {/* Owner info */}
              <View style={styles.ownerRow}>
                <Ionicons name="person-outline" size={13} color={Colors.textSecondary} />
                <Text style={styles.ownerText}>{item.ownerName} • {item.ownerEmail}</Text>
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                <Rating value={item.averageRating} showCount={false} size={13} />
                <Text style={styles.stat}>📦 {item.totalOrders} orders</Text>
                <Text style={styles.stat}>Joined {formatDate(item.createdAt, 'MMM yyyy')}</Text>
              </View>

              {/* Actions */}
              <View style={styles.actionRow}>
                {item.status === 'PendingApproval' && (
                  <TouchableOpacity
                    style={[styles.btn, styles.approveBtn]}
                    onPress={() => handleApprove(item.id, item.name)}
                    accessibilityRole="button"
                    accessibilityLabel={`Approve ${item.name}`}
                  >
                    <Ionicons name="checkmark" size={16} color={Colors.white} />
                    <Text style={styles.btnText}>Approve</Text>
                  </TouchableOpacity>
                )}
                {item.status === 'Active' && (
                  <TouchableOpacity
                    style={[styles.btn, styles.suspendBtn]}
                    onPress={() => handleSuspend(item.id, item.name)}
                    accessibilityRole="button"
                    accessibilityLabel={`Suspend ${item.name}`}
                  >
                    <Ionicons name="ban-outline" size={16} color={Colors.white} />
                    <Text style={styles.btnText}>Suspend</Text>
                  </TouchableOpacity>
                )}
                {item.status === 'Suspended' && (
                  <TouchableOpacity
                    style={[styles.btn, styles.approveBtn]}
                    onPress={() => handleApprove(item.id, item.name)}
                    accessibilityRole="button"
                    accessibilityLabel={`Reactivate ${item.name}`}
                  >
                    <Ionicons name="checkmark-circle-outline" size={16} color={Colors.white} />
                    <Text style={styles.btnText}>Reactivate</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
  title:   { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  count:   { fontSize: 14, color: Colors.textSecondary },
  searchBox: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   Colors.background,
    borderRadius:      BorderRadius.full,
    paddingHorizontal: Spacing[4],
    paddingVertical:   Spacing[2.5],
    margin:            Spacing[4],
    gap:               Spacing[2],
    borderWidth:       1,
    borderColor:       Colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary, padding: 0 },
  filterRow: {
    flexDirection:    'row',
    paddingHorizontal: Spacing[4],
    paddingBottom:    Spacing[3],
    gap:              Spacing[2],
    backgroundColor:  Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    flexWrap:         'wrap',
  },
  chip: {
    paddingHorizontal: Spacing[3],
    paddingVertical:   Spacing[1.5],
    borderRadius:      BorderRadius.full,
    borderWidth:       1,
    borderColor:       Colors.border,
  },
  chipActive:    { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText:      { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  chipTextActive:{ color: Colors.white, fontWeight: '600' },
  list: { padding: Spacing[4], paddingBottom: Spacing[10] },
  card: {
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.xl,
    padding:         Spacing[4],
    marginBottom:    Spacing[3],
    ...Shadow.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing[2] },
  restName:   { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  restCity:   { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  ownerRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing[1.5], marginBottom: Spacing[2] },
  ownerText:  { fontSize: 12, color: Colors.textSecondary },
  statsRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], marginBottom: Spacing[3], flexWrap: 'wrap' },
  stat:       { fontSize: 12, color: Colors.textSecondary },
  actionRow:  { flexDirection: 'row', gap: Spacing[3] },
  btn: {
    flex:          1,
    flexDirection: 'row',
    alignItems:    'center',
    justifyContent:'center',
    paddingVertical: Spacing[2.5],
    borderRadius:  BorderRadius.lg,
    gap:           Spacing[1.5],
  },
  approveBtn: { backgroundColor: Colors.success },
  suspendBtn: { backgroundColor: Colors.error },
  btnText:    { color: Colors.white, fontWeight: '700', fontSize: 13 },
});
