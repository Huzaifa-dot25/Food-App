import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Colors }         from '@/constants/colors';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { formatPrice }    from '@/utils/formatters';
import { orderApi }       from '@/api/orderApi';
import { restaurantApi }  from '@/api/restaurantApi';
import { reviewApi }      from '@/api/reviewApi';

export default function OwnerAnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats,      setStats]      = useState({
    totalOrders: 0, totalRevenue: 0, avgOrderValue: 0,
    totalReviews: 0, avgRating: 0, pendingOrders: 0,
  });
  const [recentRevenue, setRecentRevenue] = useState<{ label: string; value: number }[]>([]);

  const load = async () => {
    try {
      const rest     = await restaurantApi.getMine();
      const orders   = await orderApi.getRestaurantOrders(rest.id, { pageSize: 200 });
      const delivered= orders.items.filter(o => o.status === 'Delivered');
      const pending  = orders.items.filter(o => o.status === 'Pending').length;
      const revenue  = delivered.reduce((s, o) => s + o.totalAmount, 0);
      const reviews  = await reviewApi.getRestaurantReviews(rest.id, 1, 100);
      const avgRating= reviews.items.length > 0
        ? reviews.items.reduce((s, r) => s + r.rating, 0) / reviews.items.length
        : 0;

      setStats({
        totalOrders:   orders.totalCount,
        totalRevenue:  revenue,
        avgOrderValue: delivered.length > 0 ? revenue / delivered.length : 0,
        totalReviews:  reviews.totalCount,
        avgRating,
        pendingOrders: pending,
      });

      // Last 7 days revenue
      const dayRevenue: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dayRevenue[d.toLocaleDateString('en', { weekday: 'short' })] = 0;
      }
      delivered.forEach(o => {
        const d = new Date(o.createdAt);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
        if (diffDays <= 6) {
          const key = d.toLocaleDateString('en', { weekday: 'short' });
          dayRevenue[key] = (dayRevenue[key] ?? 0) + o.totalAmount;
        }
      });
      setRecentRevenue(Object.entries(dayRevenue).map(([label, value]) => ({ label, value })));
    } catch (e) { console.warn(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const maxBar = Math.max(...recentRevenue.map(r => r.value), 1);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
      >
        {/* ── KPI cards ──────────────────────────── */}
        <View style={styles.kpiGrid}>
          {[
            { label: 'Total Orders',   value: stats.totalOrders,              icon: '📦', color: Colors.secondary },
            { label: 'Revenue',        value: formatPrice(stats.totalRevenue), icon: '💰', color: Colors.success },
            { label: 'Avg Order',      value: formatPrice(stats.avgOrderValue),icon: '📊', color: Colors.primary },
            { label: 'Avg Rating',     value: `⭐ ${stats.avgRating.toFixed(1)}`, icon: '⭐', color: Colors.warning },
            { label: 'Total Reviews',  value: stats.totalReviews,             icon: '💬', color: Colors.info },
            { label: 'Pending',        value: stats.pendingOrders,            icon: '⏳', color: Colors.error },
          ].map(kpi => (
            <View key={kpi.label} style={styles.kpiCard}>
              <Text style={styles.kpiIcon}>{kpi.icon}</Text>
              <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Revenue Chart (bar) ──────────────── */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Revenue — Last 7 Days</Text>
          <View style={styles.chart}>
            {recentRevenue.map(({ label, value }) => (
              <View key={label} style={styles.barCol}>
                <Text style={styles.barValue}>
                  {value > 0 ? `$${Math.round(value)}` : ''}
                </Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      { height: Math.max(4, (value / maxBar) * 120) },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing[5],
    paddingVertical:   Spacing[4],
    backgroundColor:   Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  title:   { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  content: { padding: Spacing[4], paddingBottom: Spacing[10] },
  kpiGrid: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    gap:            Spacing[3],
    marginBottom:   Spacing[4],
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
  kpiLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  chartCard: {
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.xl,
    padding:         Spacing[4],
    ...Shadow.sm,
  },
  chartTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing[4] },
  chart: {
    flexDirection:  'row',
    alignItems:     'flex-end',
    justifyContent: 'space-between',
    height:         160,
  },
  barCol:    { flex: 1, alignItems: 'center', gap: Spacing[1] },
  barValue:  { fontSize: 9, color: Colors.textSecondary, height: 14 },
  barTrack: {
    flex:    1,
    width:   '60%',
    justifyContent: 'flex-end',
  },
  bar:       { width: '100%', backgroundColor: Colors.primary, borderRadius: 4, minHeight: 4 },
  barLabel:  { fontSize: 10, color: Colors.textSecondary, fontWeight: '500' },
});
