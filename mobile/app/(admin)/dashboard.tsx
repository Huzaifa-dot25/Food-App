import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Colors }         from '@/constants/colors';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { formatPrice }    from '@/utils/formatters';
import { apiGet }         from '@/api/client';
import { useAuth }        from '@/hooks/useAuth';

interface DashboardStats {
  totalUsers:       number;
  totalRestaurants: number;
  totalRiders:      number;
  totalOrders:      number;
  pendingOrders:    number;
  activeRiders:     number;
  totalRevenue:     number;
  todayRevenue:     number;
  todayOrders:      number;
  revenueChart:     { date: string; totalOrders: number; totalRevenue: number }[];
}

export default function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { logout } = useAuth();

  const [stats,      setStats]      = useState<DashboardStats | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiGet<DashboardStats>('/admin/dashboard');
      setStats(data);
    } catch (e) { console.warn(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const maxBar = Math.max(...(stats?.revenueChart.map(d => d.totalRevenue) ?? [1]), 1);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Admin Panel</Text>
          <Text style={styles.title}>Dashboard</Text>
        </View>
        <TouchableOpacity
          onPress={() => Alert.alert('Sign Out', 'Sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Sign Out', style: 'destructive',
              onPress: () => { logout(); router.replace('/(auth)/welcome'); },
            },
          ])}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Ionicons name="log-out-outline" size={24} color={Colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />
        }
      >
        {/* Today's stats */}
        <View style={styles.todayCard}>
          <View style={styles.todayItem}>
            <Text style={styles.todayValue}>{stats?.todayOrders ?? 0}</Text>
            <Text style={styles.todayLabel}>Today's Orders</Text>
          </View>
          <View style={styles.todayDivider} />
          <View style={styles.todayItem}>
            <Text style={styles.todayValue}>{formatPrice(stats?.todayRevenue ?? 0)}</Text>
            <Text style={styles.todayLabel}>Today's Revenue</Text>
          </View>
          <View style={styles.todayDivider} />
          <View style={styles.todayItem}>
            <Text style={styles.todayValue}>{stats?.pendingOrders ?? 0}</Text>
            <Text style={[styles.todayLabel, { color: Colors.warning }]}>Pending</Text>
          </View>
        </View>

        {/* KPI grid */}
        <View style={styles.kpiGrid}>
          {[
            { label: 'Total Users',       value: stats?.totalUsers,       icon: '👥', color: Colors.secondary },
            { label: 'Restaurants',       value: stats?.totalRestaurants, icon: '🍽️', color: Colors.primary },
            { label: 'Riders',            value: stats?.totalRiders,      icon: '🚴', color: '#8B5CF6' },
            { label: 'Total Orders',      value: stats?.totalOrders,      icon: '📦', color: Colors.warning },
            { label: 'Active Riders',     value: stats?.activeRiders,     icon: '🟢', color: Colors.success },
            { label: 'Total Revenue',     value: formatPrice(stats?.totalRevenue ?? 0), icon: '💰', color: Colors.success },
          ].map(kpi => (
            <View key={kpi.label} style={styles.kpiCard}>
              <Text style={styles.kpiIcon}>{kpi.icon}</Text>
              <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
            </View>
          ))}
        </View>

        {/* Revenue chart */}
        {stats?.revenueChart && stats.revenueChart.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Revenue — Last 7 Days</Text>
            <View style={styles.chart}>
              {stats.revenueChart.map(day => (
                <View key={day.date} style={styles.barCol}>
                  <Text style={styles.barValue}>
                    {day.totalRevenue > 0 ? `$${Math.round(day.totalRevenue)}` : ''}
                  </Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.bar, { height: Math.max(4, (day.totalRevenue / maxBar) * 110) }]} />
                  </View>
                  <Text style={styles.barLabel}>
                    {new Date(day.date).toLocaleDateString('en', { weekday: 'narrow' })}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Quick nav */}
        <View style={styles.quickNav}>
          {[
            { label: 'Users',       icon: 'people-outline',       route: '/(admin)/users' },
            { label: 'Restaurants', icon: 'restaurant-outline',   route: '/(admin)/restaurants' },
            { label: 'Reports',     icon: 'bar-chart-outline',    route: '/(admin)/reports' },
          ].map(link => (
            <TouchableOpacity
              key={link.label}
              style={styles.navCard}
              onPress={() => router.push(link.route as any)}
              accessibilityRole="button"
            >
              <View style={styles.navIcon}>
                <Ionicons name={link.icon as any} size={26} color={Colors.primary} />
              </View>
              <Text style={styles.navLabel}>{link.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: Spacing[10] }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'center',
    paddingHorizontal: Spacing[5],
    paddingVertical:  Spacing[4],
    backgroundColor:  Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  greeting: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  title:    { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },

  todayCard: {
    flexDirection:    'row',
    backgroundColor:  Colors.primary,
    margin:           Spacing[4],
    borderRadius:     BorderRadius.xl,
    padding:          Spacing[4],
    ...Shadow.md,
  },
  todayItem:    { flex: 1, alignItems: 'center' },
  todayValue:   { fontSize: 22, fontWeight: '900', color: Colors.white },
  todayLabel:   { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 4, textAlign: 'center' },
  todayDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginVertical: 4 },

  kpiGrid: {
    flexDirection:    'row',
    flexWrap:         'wrap',
    paddingHorizontal: Spacing[4],
    gap:              Spacing[3],
    marginBottom:     Spacing[4],
  },
  kpiCard: {
    width:          '47%',
    backgroundColor:Colors.white,
    borderRadius:   BorderRadius.xl,
    padding:        Spacing[4],
    alignItems:     'center',
    ...Shadow.sm,
  },
  kpiIcon:  { fontSize: 26, marginBottom: Spacing[1.5] },
  kpiValue: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  kpiLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500', textAlign: 'center' },

  chartCard: {
    backgroundColor:   Colors.white,
    borderRadius:      BorderRadius.xl,
    padding:           Spacing[4],
    marginHorizontal:  Spacing[4],
    marginBottom:      Spacing[4],
    ...Shadow.sm,
  },
  chartTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing[4] },
  chart: {
    flexDirection:  'row',
    alignItems:     'flex-end',
    justifyContent: 'space-between',
    height:         150,
  },
  barCol:   { flex: 1, alignItems: 'center', gap: Spacing[1] },
  barValue: { fontSize: 9, color: Colors.textSecondary, height: 14 },
  barTrack: { flex: 1, width: '65%', justifyContent: 'flex-end' },
  bar:      { width: '100%', backgroundColor: Colors.primary, borderRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },

  quickNav: { paddingHorizontal: Spacing[4], gap: Spacing[3], marginBottom: Spacing[4] },
  navCard: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  Colors.white,
    borderRadius:     BorderRadius.xl,
    padding:          Spacing[4],
    gap:              Spacing[3],
    ...Shadow.sm,
  },
  navIcon: {
    width:           48,
    height:          48,
    borderRadius:    BorderRadius.xl,
    backgroundColor: '#FFF0EB',
    alignItems:      'center',
    justifyContent:  'center',
  },
  navLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
});
