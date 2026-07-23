import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl, Switch, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Badge }          from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState }     from '@/components/common/EmptyState';
import { Colors }         from '@/constants/colors';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { formatPrice }    from '@/utils/formatters';
import { orderApi }       from '@/api/orderApi';
import { apiPatch }       from '@/api/client';
import { useAuth }        from '@/hooks/useAuth';
import { useLocation }    from '@/hooks/useLocation';

export default function RiderDashboardScreen() {
  const insets   = useSafeAreaInsets();
  const router   = useRouter();
  const { user, logout } = useAuth();
  const { location } = useLocation();

  const [deliveries,   setDeliveries]  = useState<any[]>([]);
  const [isAvailable,  setIsAvailable] = useState(false);
  const [riderId,      setRiderId]     = useState<number | null>(null);
  const [loading,      setLoading]     = useState(true);
  const [refreshing,   setRefreshing]  = useState(false);

  const load = useCallback(async () => {
    try {
      const active = await orderApi.getActiveDeliveries();
      setDeliveries(active);
    } catch (e) { console.warn(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Update rider GPS location every 30 seconds when available
  useEffect(() => {
    if (!isAvailable || !location || !riderId) return;
    const interval = setInterval(async () => {
      try {
        await apiPatch('/riders/location', {
          latitude: location.latitude,
          longitude: location.longitude,
        });
      } catch {}
    }, 30_000);
    return () => clearInterval(interval);
  }, [isAvailable, location, riderId]);

  const handleToggleAvailability = async () => {
    try {
      const res = await apiPatch<any>('/riders/availability');
      setIsAvailable(res.isAvailable);
      Toast.show({
        type: res.isAvailable ? 'success' : 'info',
        text1: res.isAvailable ? 'You are now Online' : 'You are now Offline',
      });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message });
    }
  };

  const handleAccept = async (assignmentId: number) => {
    try {
      await orderApi.acceptDelivery(assignmentId);
      Toast.show({ type: 'success', text1: 'Delivery Accepted!' });
      load();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message });
    }
  };

  const handleReject = async (assignmentId: number) => {
    try {
      await orderApi.rejectDelivery(assignmentId);
      Toast.show({ type: 'info', text1: 'Delivery Rejected' });
      load();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message });
    }
  };

  const handlePickup = async (assignmentId: number) => {
    Alert.alert('Confirm Pickup', 'Confirm you have picked up the order?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm Pickup',
        onPress: async () => {
          try {
            await orderApi.confirmPickup(assignmentId);
            Toast.show({ type: 'success', text1: 'Pickup Confirmed!' });
            load();
          } catch (e: any) {
            Toast.show({ type: 'error', text1: 'Error', text2: e.message });
          }
        },
      },
    ]);
  };

  const handleDeliver = async (assignmentId: number) => {
    Alert.alert('Confirm Delivery', 'Confirm the order has been delivered?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm Delivery',
        onPress: async () => {
          try {
            await orderApi.confirmDelivery(assignmentId);
            Toast.show({ type: 'success', text1: 'Delivery Complete! 🎉' });
            load();
          } catch (e: any) {
            Toast.show({ type: 'error', text1: 'Error', text2: e.message });
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        </View>
        <TouchableOpacity
          onPress={() => Alert.alert('Sign Out', 'Sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/welcome'); } },
          ])}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Ionicons name="log-out-outline" size={24} color={Colors.error} />
        </TouchableOpacity>
      </View>

      {/* Availability toggle */}
      <View style={styles.availabilityCard}>
        <View style={styles.availRow}>
          <View style={[styles.availDot, { backgroundColor: isAvailable ? Colors.success : Colors.border }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.availTitle}>
              {isAvailable ? 'You are Online' : 'You are Offline'}
            </Text>
            <Text style={styles.availSub}>
              {isAvailable ? 'Ready to receive deliveries' : 'Toggle to start receiving deliveries'}
            </Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={handleToggleAvailability}
            trackColor={{ false: Colors.border, true: `${Colors.success}80` }}
            thumbColor={isAvailable ? Colors.success : Colors.white}
            accessibilityLabel="Toggle availability"
          />
        </View>
      </View>

      <FlatList
        data={deliveries}
        keyExtractor={item => String(item.assignmentId ?? item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>
            Active Deliveries ({deliveries.length})
          </Text>
        }
        ListEmptyComponent={
          <EmptyState
            icon="bicycle-outline"
            title={isAvailable ? 'No Deliveries Yet' : 'You are Offline'}
            message={isAvailable ? 'Waiting for new delivery requests…' : 'Toggle availability to start receiving deliveries.'}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.deliveryCard}>
            {/* Restaurant */}
            <View style={styles.locationBlock}>
              <View style={styles.locationIcon}>
                <Ionicons name="restaurant-outline" size={18} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.locationLabel}>Pickup</Text>
                <Text style={styles.locationName}>{item.restaurantName}</Text>
                <Text style={styles.locationAddr} numberOfLines={1}>{item.restaurantAddress}</Text>
              </View>
            </View>

            <View style={styles.routeLine} />

            {/* Customer */}
            <View style={styles.locationBlock}>
              <View style={[styles.locationIcon, { backgroundColor: '#EEFFF5' }]}>
                <Ionicons name="home-outline" size={18} color={Colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.locationLabel}>Deliver to</Text>
                <Text style={styles.locationName}>{item.customerName}</Text>
                <Text style={styles.locationAddr} numberOfLines={1}>{item.deliveryAddress}</Text>
              </View>
            </View>

            {item.deliveryInstructions && (
              <View style={styles.instructionsBox}>
                <Ionicons name="chatbubble-outline" size={13} color={Colors.textSecondary} />
                <Text style={styles.instructions}>{item.deliveryInstructions}</Text>
              </View>
            )}

            <View style={styles.orderMeta}>
              <Text style={styles.orderAmt}>{formatPrice(item.totalAmount)}</Text>
              <View style={styles.payTag}>
                <Ionicons
                  name={item.paymentMethod === 'CashOnDelivery' ? 'cash-outline' : 'card-outline'}
                  size={13}
                  color={Colors.textSecondary}
                />
                <Text style={styles.payText}>{item.paymentMethod === 'CashOnDelivery' ? 'Cash' : 'Card'}</Text>
              </View>
            </View>

            {/* Actions */}
            {!item.isAccepted ? (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.btn, styles.acceptBtn]}
                  onPress={() => handleAccept(item.assignmentId)}
                  accessibilityRole="button"
                  accessibilityLabel="Accept delivery"
                >
                  <Ionicons name="checkmark" size={18} color={Colors.white} />
                  <Text style={styles.btnText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.rejectBtn]}
                  onPress={() => handleReject(item.assignmentId)}
                  accessibilityRole="button"
                  accessibilityLabel="Reject delivery"
                >
                  <Ionicons name="close" size={18} color={Colors.white} />
                  <Text style={styles.btnText}>Reject</Text>
                </TouchableOpacity>
              </View>
            ) : !item.pickedUpAt ? (
              <TouchableOpacity
                style={[styles.btn, styles.pickupBtn, { flex: 0 }]}
                onPress={() => handlePickup(item.assignmentId)}
                accessibilityRole="button"
                accessibilityLabel="Confirm pickup"
              >
                <Ionicons name="bag-check-outline" size={18} color={Colors.white} />
                <Text style={styles.btnText}>Confirm Pickup</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.btn, styles.deliverBtn, { flex: 0 }]}
                onPress={() => handleDeliver(item.assignmentId)}
                accessibilityRole="button"
                accessibilityLabel="Confirm delivery"
              >
                <Ionicons name="checkmark-done-outline" size={18} color={Colors.white} />
                <Text style={styles.btnText}>Confirm Delivery</Text>
              </TouchableOpacity>
            )}
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
    justifyContent:   'space-between',
    alignItems:       'center',
    paddingHorizontal: Spacing[5],
    paddingVertical:  Spacing[4],
    backgroundColor:  Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  greeting: { fontSize: 12, color: Colors.textSecondary },
  name:     { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  availabilityCard: {
    margin:          Spacing[4],
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.xl,
    padding:         Spacing[4],
    ...Shadow.sm,
  },
  availRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  availDot:  { width: 12, height: 12, borderRadius: 6 },
  availTitle:{ fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  availSub:  { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  list:      { padding: Spacing[4], paddingBottom: Spacing[10] },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing[3] },
  deliveryCard: {
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.xl,
    padding:         Spacing[4],
    marginBottom:    Spacing[3],
    ...Shadow.sm,
  },
  locationBlock: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[3] },
  locationIcon: {
    width:           36,
    height:          36,
    borderRadius:    BorderRadius.md,
    backgroundColor: '#FFF0EB',
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  locationLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', textTransform: 'uppercase' },
  locationName:  { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginTop: 1 },
  locationAddr:  { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  routeLine: {
    height:          20,
    width:           2,
    backgroundColor: Colors.border,
    marginLeft:      17,
    marginVertical:  Spacing[1],
  },
  instructionsBox: {
    flexDirection:   'row',
    alignItems:      'flex-start',
    gap:             Spacing[2],
    backgroundColor: Colors.background,
    borderRadius:    BorderRadius.md,
    padding:         Spacing[2.5],
    marginTop:       Spacing[3],
  },
  instructions: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  orderMeta: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginVertical: Spacing[3],
  },
  orderAmt: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  payTag:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  payText:  { fontSize: 13, color: Colors.textSecondary },
  actionRow:{ flexDirection: 'row', gap: Spacing[3] },
  btn: {
    flex:          1,
    flexDirection: 'row',
    alignItems:    'center',
    justifyContent:'center',
    paddingVertical: Spacing[3],
    borderRadius:  BorderRadius.lg,
    gap:           Spacing[1.5],
  },
  acceptBtn:   { backgroundColor: Colors.success },
  rejectBtn:   { backgroundColor: Colors.error },
  pickupBtn:   { backgroundColor: Colors.secondary },
  deliverBtn:  { backgroundColor: Colors.success },
  btnText:     { color: Colors.white, fontWeight: '700', fontSize: 14 },
});
