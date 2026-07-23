import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  FlatList, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState }     from '@/components/common/EmptyState';
import { Colors }         from '@/constants/colors';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { formatPrice, formatDate } from '@/utils/formatters';
import { orderApi }       from '@/api/orderApi';
import { apiGet }         from '@/api/client';

export default function RiderEarningsScreen() {
  const insets = useSafeAreaInsets();
  const [profile,    setProfile]    = useState<any>(null);
  const [history,    setHistory]    = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [prof, hist] = await Promise.all([
        apiGet<any>('/riders/profile'),
        orderApi.getRiderHistory({ pageSize: 50 }),
      ]);
      setProfile(prof);
      setHistory(hist.items);
    } catch (e) { console.warn(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  const todayEarnings = history
    .filter(d => new Date(d.deliveredAt ?? d.assignedAt).toDateString() === new Date().toDateString())
    .reduce((s: number, d: any) => s + (d.totalAmount * 0.1), 0); // 10% commission mock

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Earnings</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />
        }
      >
        {/* ── Summary cards ─────────────────────── */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: Colors.primary }]}>
            <Ionicons name="cash-outline" size={28} color={Colors.white} />
            <Text style={styles.statAmount}>{formatPrice(profile?.totalEarnings ?? 0)}</Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </View>
          <View style={styles.miniStats}>
            <View style={styles.miniCard}>
              <Text style={styles.miniValue}>{formatPrice(todayEarnings)}</Text>
              <Text style={styles.miniLabel}>Today</Text>
            </View>
            <View style={styles.miniCard}>
              <Text style={styles.miniValue}>{profile?.totalDeliveries ?? 0}</Text>
              <Text style={styles.miniLabel}>Deliveries</Text>
            </View>
          </View>
        </View>

        {/* ── Delivery History ──────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery History</Text>
          {history.length === 0 ? (
            <EmptyState
              icon="bicycle-outline"
              title="No Deliveries Yet"
              message="Complete your first delivery to see earnings here."
            />
          ) : (
            history.map((item: any) => {
              const commission = (item.totalAmount ?? 0) * 0.1;
              return (
                <View key={item.assignmentId} style={styles.historyCard}>
                  <View style={styles.histIcon}>
                    <Ionicons name="bicycle" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.histInfo}>
                    <Text style={styles.histOrder}>{item.orderNumber}</Text>
                    <Text style={styles.histAddr} numberOfLines={1}>
                      {item.deliveryAddress}
                    </Text>
                    <Text style={styles.histDate}>
                      {item.deliveredAt ? formatDate(item.deliveredAt) : formatDate(item.assignedAt)}
                    </Text>
                  </View>
                  <View style={styles.histEarn}>
                    <Text style={styles.histAmount}>{formatPrice(commission)}</Text>
                    <View style={styles.paidBadge}>
                      <Text style={styles.paidText}>Paid</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: Spacing[10] }} />
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
  title:      { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  statsRow: {
    flexDirection:    'row',
    gap:              Spacing[3],
    padding:          Spacing[4],
  },
  statCard: {
    flex:          1.2,
    borderRadius:  BorderRadius.xl,
    padding:       Spacing[4],
    alignItems:    'center',
    gap:           Spacing[2],
    ...Shadow.md,
  },
  statAmount: { fontSize: 24, fontWeight: '900', color: Colors.white },
  statLabel:  { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  miniStats: { flex: 1, gap: Spacing[3] },
  miniCard: {
    flex:            1,
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.xl,
    alignItems:      'center',
    justifyContent:  'center',
    ...Shadow.sm,
  },
  miniValue:  { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  miniLabel:  { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  section: { paddingHorizontal: Spacing[4] },
  sectionTitle: {
    fontSize:     16,
    fontWeight:   '700',
    color:        Colors.textPrimary,
    marginBottom: Spacing[3],
  },
  historyCard: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.xl,
    padding:         Spacing[3],
    marginBottom:    Spacing[2.5],
    gap:             Spacing[3],
    ...Shadow.sm,
  },
  histIcon: {
    width:           44,
    height:          44,
    borderRadius:    BorderRadius.lg,
    backgroundColor: '#FFF0EB',
    alignItems:      'center',
    justifyContent:  'center',
  },
  histInfo:  { flex: 1 },
  histOrder: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  histAddr:  { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  histDate:  { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  histEarn:  { alignItems: 'flex-end', gap: Spacing[1] },
  histAmount:{ fontSize: 15, fontWeight: '800', color: Colors.success },
  paidBadge: {
    backgroundColor:   Colors.successLight,
    paddingHorizontal: Spacing[2],
    paddingVertical:   2,
    borderRadius:      BorderRadius.full,
  },
  paidText: { fontSize: 10, color: Colors.success, fontWeight: '700' },
});
