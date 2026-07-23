import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Colors }         from '@/constants/colors';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { formatPrice, formatDate } from '@/utils/formatters';
import { apiGet }         from '@/api/client';

interface DailyRevenue {
  date: string; totalOrders: number; totalRevenue: number;
}

type Range = '7d' | '30d' | '90d';

const RANGES: { key: Range; label: string }[] = [
  { key: '7d',  label: 'Last 7 Days' },
  { key: '30d', label: 'Last 30 Days' },
  { key: '90d', label: 'Last 90 Days' },
];

function getFromDate(range: Range): string {
  const d = new Date();
  if (range === '7d')  d.setDate(d.getDate() - 7);
  if (range === '30d') d.setDate(d.getDate() - 30);
  if (range === '90d') d.setDate(d.getDate() - 90);
  return d.toISOString().split('T')[0];
}

export default function AdminReportsScreen() {
  const insets = useSafeAreaInsets();
  const [range,      setRange]      = useState<Range>('30d');
  const [report,     setReport]     = useState<DailyRevenue[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loaded,     setLoaded]     = useState(false);

  const load = async (r: Range = range) => {
    setLoading(true);
    try {
      const data = await apiGet<DailyRevenue[]>('/admin/revenue', {
        from:    getFromDate(r),
        to:      new Date().toISOString().split('T')[0],
        groupBy: 'day',
      });
      setReport(data ?? []);
      setLoaded(true);
    } catch (e) { console.warn(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const handleRange = (r: Range) => { setRange(r); load(r); };

  const totalRevenue  = report.reduce((s, d) => s + d.totalRevenue, 0);
  const totalOrders   = report.reduce((s, d) => s + d.totalOrders, 0);
  const avgDailyRev   = report.length > 0 ? totalRevenue / report.length : 0;
  const maxBar        = Math.max(...report.map(d => d.totalRevenue), 1);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Revenue Reports</Text>
        <TouchableOpacity
          onPress={() => load()}
          style={styles.loadBtn}
          accessibilityRole="button"
          accessibilityLabel="Load report"
        >
          <Text style={styles.loadBtnText}>Load</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
      >
        {/* Range picker */}
        <View style={styles.rangeRow}>
          {RANGES.map(r => (
            <TouchableOpacity
              key={r.key}
              style={[styles.rangeChip, range === r.key && styles.rangeChipActive]}
              onPress={() => handleRange(r.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: range === r.key }}
            >
              <Text style={[styles.rangeText, range === r.key && styles.rangeTextActive]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <LoadingSpinner message="Loading report…" />
        ) : !loaded ? (
          <View style={styles.promptBox}>
            <Ionicons name="bar-chart-outline" size={56} color={Colors.border} />
            <Text style={styles.promptTitle}>Select a range and tap Load</Text>
            <Text style={styles.promptSub}>Generate revenue reports for any time period</Text>
          </View>
        ) : (
          <>
            {/* Summary cards */}
            <View style={styles.summaryRow}>
              {[
                { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: '💰', color: Colors.success },
                { label: 'Total Orders',  value: totalOrders,               icon: '📦', color: Colors.primary },
                { label: 'Avg Daily',     value: formatPrice(avgDailyRev),  icon: '📊', color: Colors.secondary },
              ].map(s => (
                <View key={s.label} style={styles.summCard}>
                  <Text style={styles.summIcon}>{s.icon}</Text>
                  <Text style={[styles.summValue, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.summLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Bar chart */}
            {report.length > 0 && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Daily Revenue</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={[styles.chart, { width: Math.max(report.length * 44, 300) }]}>
                    {report.map(day => (
                      <View key={day.date} style={styles.barCol}>
                        <Text style={styles.barValue}>
                          {day.totalRevenue > 0 ? `$${Math.round(day.totalRevenue)}` : ''}
                        </Text>
                        <View style={styles.barTrack}>
                          <View style={[styles.bar, { height: Math.max(4, (day.totalRevenue / maxBar) * 120) }]} />
                        </View>
                        <Text style={styles.barLabel} numberOfLines={1}>
                          {new Date(day.date).toLocaleDateString('en', { month: 'numeric', day: 'numeric' })}
                        </Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Data table */}
            <View style={styles.tableCard}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.tableHeadText, { flex: 2 }]}>Date</Text>
                <Text style={[styles.tableCell, styles.tableHeadText]}>Orders</Text>
                <Text style={[styles.tableCell, styles.tableHeadText]}>Revenue</Text>
              </View>
              {report.slice().reverse().map(day => (
                <View key={day.date} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{formatDate(day.date, 'MMM d, yyyy')}</Text>
                  <Text style={styles.tableCell}>{day.totalOrders}</Text>
                  <Text style={[styles.tableCell, styles.revenueCell]}>{formatPrice(day.totalRevenue)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ height: Spacing[10] }} />
      </ScrollView>
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
  title:        { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  loadBtn: {
    backgroundColor:   Colors.primary,
    paddingHorizontal: Spacing[4],
    paddingVertical:   Spacing[2],
    borderRadius:      BorderRadius.full,
  },
  loadBtnText:  { color: Colors.white, fontWeight: '700', fontSize: 14 },
  content:      { padding: Spacing[4] },
  rangeRow: {
    flexDirection:  'row',
    gap:            Spacing[2],
    marginBottom:   Spacing[4],
  },
  rangeChip: {
    flex:              1,
    paddingVertical:   Spacing[2.5],
    borderRadius:      BorderRadius.xl,
    borderWidth:       1.5,
    borderColor:       Colors.border,
    alignItems:        'center',
    backgroundColor:   Colors.white,
  },
  rangeChipActive:{ borderColor: Colors.primary, backgroundColor: '#FFF0EB' },
  rangeText:      { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  rangeTextActive:{ color: Colors.primary, fontWeight: '700' },
  promptBox: {
    alignItems:     'center',
    paddingVertical: Spacing[12],
    gap:            Spacing[3],
  },
  promptTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  promptSub:   { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  summaryRow: {
    flexDirection:  'row',
    gap:            Spacing[3],
    marginBottom:   Spacing[4],
  },
  summCard: {
    flex:          1,
    backgroundColor:Colors.white,
    borderRadius:  BorderRadius.xl,
    padding:       Spacing[3],
    alignItems:    'center',
    ...Shadow.sm,
  },
  summIcon:  { fontSize: 22, marginBottom: Spacing[1] },
  summValue: { fontSize: 14, fontWeight: '800', marginBottom: 2, textAlign: 'center' },
  summLabel: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },
  chartCard: {
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.xl,
    padding:         Spacing[4],
    marginBottom:    Spacing[4],
    ...Shadow.sm,
  },
  chartTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing[3] },
  chart:      { flexDirection: 'row', alignItems: 'flex-end', height: 160 },
  barCol:     { flex: 1, alignItems: 'center', gap: Spacing[1], minWidth: 40 },
  barValue:   { fontSize: 8, color: Colors.textSecondary, height: 14 },
  barTrack:   { flex: 1, width: '70%', justifyContent: 'flex-end' },
  bar:        { width: '100%', backgroundColor: Colors.primary, borderRadius: 3, minHeight: 4 },
  barLabel:   { fontSize: 10, color: Colors.textSecondary },
  tableCard: {
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.xl,
    overflow:        'hidden',
    marginBottom:    Spacing[4],
    ...Shadow.sm,
  },
  tableHeader: {
    flexDirection:   'row',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  tableRow: {
    flexDirection:   'row',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  tableCell:     { flex: 1, fontSize: 13, color: Colors.textPrimary },
  tableHeadText: { fontWeight: '700', color: Colors.textSecondary, fontSize: 12 },
  revenueCell:   { color: Colors.success, fontWeight: '600' },
});
