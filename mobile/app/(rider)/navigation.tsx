import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Linking, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState }     from '@/components/common/EmptyState';
import { Colors }         from '@/constants/colors';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { orderApi }       from '@/api/orderApi';

export default function RiderNavigationScreen() {
  const insets = useSafeAreaInsets();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    orderApi.getActiveDeliveries()
      .then(d => setDeliveries(d.filter((a: any) => a.isAccepted)))
      .catch(console.warn)
      .finally(() => setLoading(false));
  }, []);

  const openMaps = (lat: number, lng: number, label: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    Linking.openURL(url).catch(() =>
      Toast.show({ type: 'error', text1: 'Cannot open Maps', text2: 'Please install Google Maps.' }),
    );
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Navigation</Text>
        <Text style={styles.subtitle}>Active deliveries requiring navigation</Text>
      </View>

      {deliveries.length === 0 ? (
        <EmptyState
          icon="navigate-outline"
          title="No Active Deliveries"
          message="Accept a delivery from the Deliveries tab to see navigation here."
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {deliveries.map((delivery: any) => (
            <View key={delivery.assignmentId} style={styles.card}>
              <Text style={styles.orderNum}>{delivery.orderNumber}</Text>

              {/* Pickup */}
              <View style={styles.navBlock}>
                <View style={[styles.navIcon, { backgroundColor: '#FFF0EB' }]}>
                  <Ionicons name="restaurant-outline" size={20} color={Colors.primary} />
                </View>
                <View style={styles.navInfo}>
                  <Text style={styles.navType}>PICKUP FROM</Text>
                  <Text style={styles.navName}>{delivery.restaurantName}</Text>
                  <Text style={styles.navAddr}>{delivery.restaurantAddress}</Text>
                </View>
                <TouchableOpacity
                  style={styles.dirBtn}
                  onPress={() => openMaps(
                    delivery.restaurantLatitude,
                    delivery.restaurantLongitude,
                    delivery.restaurantName,
                  )}
                  accessibilityRole="button"
                  accessibilityLabel={`Navigate to ${delivery.restaurantName}`}
                >
                  <Ionicons name="navigate" size={18} color={Colors.white} />
                  <Text style={styles.dirBtnText}>Go</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              {/* Delivery */}
              <View style={styles.navBlock}>
                <View style={[styles.navIcon, { backgroundColor: '#EEFFF5' }]}>
                  <Ionicons name="home-outline" size={20} color={Colors.success} />
                </View>
                <View style={styles.navInfo}>
                  <Text style={styles.navType}>DELIVER TO</Text>
                  <Text style={styles.navName}>{delivery.customerName}</Text>
                  <Text style={styles.navAddr}>{delivery.deliveryAddress}</Text>
                  {delivery.deliveryInstructions && (
                    <Text style={styles.navNote}>
                      📝 {delivery.deliveryInstructions}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.dirBtn, { backgroundColor: Colors.success }]}
                  onPress={() => openMaps(
                    delivery.deliveryLatitude,
                    delivery.deliveryLongitude,
                    delivery.customerName,
                  )}
                  accessibilityRole="button"
                  accessibilityLabel={`Navigate to ${delivery.customerName}`}
                >
                  <Ionicons name="navigate" size={18} color={Colors.white} />
                  <Text style={styles.dirBtnText}>Go</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
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
  title:    { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  content:  { padding: Spacing[4], paddingBottom: Spacing[10] },
  card: {
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.xl,
    padding:         Spacing[4],
    marginBottom:    Spacing[4],
    ...Shadow.md,
  },
  orderNum: {
    fontSize:     14,
    fontWeight:   '700',
    color:        Colors.textSecondary,
    marginBottom: Spacing[3],
  },
  navBlock: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[3] },
  navIcon: {
    width:           44,
    height:          44,
    borderRadius:    BorderRadius.lg,
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  navInfo:  { flex: 1 },
  navType:  { fontSize: 10, color: Colors.textSecondary, fontWeight: '700', letterSpacing: 0.8 },
  navName:  { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginTop: 2 },
  navAddr:  { fontSize: 12, color: Colors.textSecondary, marginTop: 2, lineHeight: 18 },
  navNote:  { fontSize: 11, color: Colors.textSecondary, marginTop: 4, fontStyle: 'italic' },
  dirBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             4,
    backgroundColor: Colors.primary,
    borderRadius:    BorderRadius.lg,
    paddingHorizontal: Spacing[3],
    paddingVertical:   Spacing[2.5],
    flexShrink:      0,
  },
  dirBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  divider: {
    height:          1,
    backgroundColor: Colors.divider,
    marginVertical:  Spacing[3],
    marginLeft:      56,
  },
});
