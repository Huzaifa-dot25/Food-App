import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, TextInput, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Badge }          from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState }     from '@/components/common/EmptyState';
import { Colors }         from '@/constants/colors';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { formatDate, getInitials } from '@/utils';
import { apiGet, apiPatch } from '@/api/client';

interface AdminUser {
  id: number; fullName: string; email: string;
  phoneNumber: string; status: string;
  isEmailVerified: boolean; roles: string[]; createdAt: string;
}

const ROLE_FILTERS = ['All', 'Customer', 'Owner', 'Rider'];

export default function AdminUsersScreen() {
  const insets = useSafeAreaInsets();
  const [users,      setUsers]      = useState<AdminUser[]>([]);
  const [roleFilter, setRoleFilter] = useState('All');
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page,       setPage]       = useState(1);
  const [hasMore,    setHasMore]    = useState(true);

  const load = useCallback(async (reset = false) => {
    const p = reset ? 1 : page;
    try {
      const params: Record<string, any> = { pageNumber: p, pageSize: 20 };
      if (roleFilter !== 'All') params.role = roleFilter;
      const res = await apiGet<any>('/admin/users', params);
      const items: AdminUser[] = res.items ?? [];
      setUsers(prev => reset ? items : [...prev, ...items]);
      setHasMore(p < (res.totalPages ?? 1));
      if (reset) setPage(1);
    } catch (e) { console.warn(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, [roleFilter, page]);

  useEffect(() => { setLoading(true); load(true); }, [roleFilter]);

  const handleSuspend = (user: AdminUser) => {
    Alert.alert(`Suspend ${user.fullName}?`, 'This will prevent the user from logging in.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Suspend', style: 'destructive',
        onPress: async () => {
          try {
            await apiPatch(`/admin/users/${user.id}/suspend`, { reason: 'Admin action' });
            Toast.show({ type: 'success', text1: 'User suspended' });
            load(true);
          } catch (e: any) {
            Toast.show({ type: 'error', text1: 'Error', text2: e.message });
          }
        },
      },
    ]);
  };

  const handleActivate = async (userId: number) => {
    try {
      await apiPatch(`/admin/users/${userId}/activate`);
      Toast.show({ type: 'success', text1: 'User activated' });
      load(true);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message });
    }
  };

  const filteredUsers = users.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading && users.length === 0) return <LoadingSpinner fullScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Users</Text>
        <Text style={styles.count}>{filteredUsers.length} users</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email…"
          placeholderTextColor={Colors.textPlaceholder}
          value={search}
          onChangeText={setSearch}
          accessibilityLabel="Search users"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} accessibilityRole="button" accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Role filters */}
      <View style={styles.filterRow}>
        {ROLE_FILTERS.map(r => (
          <TouchableOpacity
            key={r}
            style={[styles.chip, roleFilter === r && styles.chipActive]}
            onPress={() => setRoleFilter(r)}
            accessibilityRole="button"
            accessibilityState={{ selected: roleFilter === r }}
          >
            <Text style={[styles.chipText, roleFilter === r && styles.chipTextActive]}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={item => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={Colors.primary} />}
        ListEmptyComponent={<EmptyState icon="people-outline" title="No Users Found" message="Try adjusting your filters." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(item.fullName)}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.fullName}</Text>
                <Text style={styles.email}>{item.email}</Text>
                <View style={styles.tagsRow}>
                  {item.roles.map(role => (
                    <Badge key={role} label={role} size="sm" color={Colors.primary} bgColor="#FFF0EB" />
                  ))}
                  <Badge
                    label={item.status}
                    size="sm"
                    color={item.status === 'Active' ? Colors.success : Colors.error}
                    bgColor={item.status === 'Active' ? Colors.successLight : Colors.errorLight}
                  />
                </View>
                <Text style={styles.date}>Joined {formatDate(item.createdAt)}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.actionBtn, item.status === 'Active' ? styles.suspendBtn : styles.activateBtn]}
              onPress={() => item.status === 'Active' ? handleSuspend(item) : handleActivate(item.id)}
              accessibilityRole="button"
              accessibilityLabel={item.status === 'Active' ? 'Suspend user' : 'Activate user'}
            >
              <Ionicons
                name={item.status === 'Active' ? 'ban-outline' : 'checkmark-circle-outline'}
                size={16}
                color={Colors.white}
              />
              <Text style={styles.actionBtnText}>
                {item.status === 'Active' ? 'Suspend' : 'Activate'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  list:  { padding: Spacing[4], paddingBottom: Spacing[10] },
  card: {
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.xl,
    padding:         Spacing[4],
    marginBottom:    Spacing[3],
    ...Shadow.sm,
  },
  cardLeft:  { flexDirection: 'row', gap: Spacing[3], marginBottom: Spacing[3] },
  avatar: {
    width:           44,
    height:          44,
    borderRadius:    22,
    backgroundColor: Colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  avatarText:{ color: Colors.white, fontWeight: '800', fontSize: 16 },
  info:      { flex: 1 },
  name:      { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  email:     { fontSize: 13, color: Colors.textSecondary, marginBottom: Spacing[2] },
  tagsRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[1.5], marginBottom: Spacing[1.5] },
  date:      { fontSize: 11, color: Colors.textSecondary },
  actionBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             Spacing[1.5],
    paddingVertical: Spacing[2.5],
    borderRadius:    BorderRadius.lg,
  },
  suspendBtn:    { backgroundColor: Colors.error },
  activateBtn:   { backgroundColor: Colors.success },
  actionBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
});
