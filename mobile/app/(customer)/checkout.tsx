import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Button }         from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Colors }         from '@/constants/colors';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { formatPrice }    from '@/utils/formatters';
import { useCart }        from '@/hooks/useCart';
import { useAppDispatch } from '@/store';
import { placeOrder }     from '@/store/slices/orderSlice';
import { authApi }        from '@/api/authApi';
import type { Address }   from '@/types/auth.types';

type PaymentMethod = 'CashOnDelivery' | 'Card';

const PAYMENT_OPTIONS: { key: PaymentMethod; label: string; icon: string; desc: string }[] = [
  { key: 'CashOnDelivery', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when your order arrives' },
  { key: 'Card',           label: 'Credit / Debit Card', icon: '💳', desc: 'Sandbox — no real charge' },
];

export default function CheckoutScreen() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { cart } = useCart();

  const [addresses,       setAddresses]       = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod,   setPaymentMethod]   = useState<PaymentMethod>('CashOnDelivery');
  const [instructions,    setInstructions]    = useState('');
  const [loading,         setLoading]         = useState(false);
  const [loadingAddr,     setLoadingAddr]     = useState(true);

  useEffect(() => {
    authApi.getAddresses()
      .then(addrs => {
        setAddresses(addrs);
        const def = addrs.find(a => a.isDefault) ?? addrs[0] ?? null;
        setSelectedAddress(def);
      })
      .catch(console.warn)
      .finally(() => setLoadingAddr(false));
  }, []);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Toast.show({ type: 'error', text1: 'No Address', text2: 'Please select a delivery address.' });
      return;
    }
    if (!cart || cart.items.length === 0) {
      Toast.show({ type: 'error', text1: 'Empty Cart', text2: 'Add items to your cart first.' });
      return;
    }

    setLoading(true);
    try {
      const result = await dispatch(placeOrder({
        addressId:            selectedAddress.id,
        paymentMethod,
        deliveryInstructions: instructions.trim() || undefined,
      })).unwrap();

      if (paymentMethod === 'Card') {
        router.replace({
          pathname: '/(customer)/payment',
          params:   { orderId: result.id },
        });
      } else {
        Toast.show({ type: 'success', text1: 'Order Placed!', text2: `Order ${result.orderNumber} confirmed.` });
        router.replace({
          pathname: '/(customer)/order-tracking/[id]',
          params:   { id: result.id },
        });
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Order Failed', text2: e.message ?? 'Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingAddr) return <LoadingSpinner fullScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ───────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ── Step 1: Delivery Address ─────────── */}
        <Text style={styles.stepTitle}>1. Delivery Address</Text>
        <View style={styles.card}>
          {addresses.length === 0 ? (
            <TouchableOpacity
              style={styles.addAddressBtn}
              onPress={() => router.push('/(customer)/(tabs)/profile')}
              accessibilityRole="button"
            >
              <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
              <Text style={styles.addAddressText}>Add a delivery address</Text>
            </TouchableOpacity>
          ) : (
            addresses.map(addr => (
              <TouchableOpacity
                key={addr.id}
                style={[
                  styles.addressRow,
                  selectedAddress?.id === addr.id && styles.addressRowSelected,
                ]}
                onPress={() => setSelectedAddress(addr)}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedAddress?.id === addr.id }}
              >
                <View style={[
                  styles.radioOuter,
                  selectedAddress?.id === addr.id && styles.radioOuterSelected,
                ]}>
                  {selectedAddress?.id === addr.id && <View style={styles.radioInner} />}
                </View>
                <View style={styles.addressInfo}>
                  <View style={styles.addrLabelRow}>
                    <Ionicons name="location-outline" size={14} color={Colors.primary} />
                    <Text style={styles.addrLabel}>{addr.label}</Text>
                    {addr.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addrStreet} numberOfLines={2}>
                    {addr.street}{addr.apartment ? `, ${addr.apartment}` : ''}
                  </Text>
                  <Text style={styles.addrCity}>{addr.city}, {addr.state}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* ── Step 2: Delivery Instructions ──── */}
        <Text style={styles.stepTitle}>2. Delivery Instructions</Text>
        <View style={styles.card}>
          <TextInput
            style={styles.instructionsInput}
            placeholder="E.g. Leave at the door, ring doorbell twice…"
            placeholderTextColor={Colors.textPlaceholder}
            value={instructions}
            onChangeText={setInstructions}
            multiline
            numberOfLines={3}
            maxLength={300}
            accessibilityLabel="Delivery instructions"
          />
          <Text style={styles.charCount}>{instructions.length}/300</Text>
        </View>

        {/* ── Step 3: Payment Method ──────────── */}
        <Text style={styles.stepTitle}>3. Payment Method</Text>
        <View style={styles.card}>
          {PAYMENT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.paymentRow,
                paymentMethod === opt.key && styles.paymentRowSelected,
              ]}
              onPress={() => setPaymentMethod(opt.key)}
              accessibilityRole="radio"
              accessibilityState={{ selected: paymentMethod === opt.key }}
            >
              <Text style={styles.paymentEmoji}>{opt.icon}</Text>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentLabel}>{opt.label}</Text>
                <Text style={styles.paymentDesc}>{opt.desc}</Text>
              </View>
              <View style={[
                styles.radioOuter,
                paymentMethod === opt.key && styles.radioOuterSelected,
              ]}>
                {paymentMethod === opt.key && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Order Summary ───────────────────── */}
        <Text style={styles.stepTitle}>Order Summary</Text>
        <View style={styles.card}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items ({cart?.itemCount ?? 0})</Text>
            <Text style={styles.summaryValue}>{formatPrice(cart?.subtotal ?? 0)}</Text>
          </View>
          {(cart?.discountAmount ?? 0) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Colors.success }]}>Coupon</Text>
              <Text style={[styles.summaryValue, { color: Colors.success }]}>
                -{formatPrice(cart?.discountAmount ?? 0)}
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>
              {(cart?.deliveryFee ?? 0) === 0
                ? <Text style={{ color: Colors.success }}>FREE</Text>
                : formatPrice(cart?.deliveryFee ?? 0)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(cart?.total ?? 0)}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Place Order Button ─────────────────── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing[2] }]}>
        <Button
          title={`Place Order • ${formatPrice(cart?.total ?? 0)}`}
          onPress={handlePlaceOrder}
          isLoading={loading}
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: Spacing[4],
    paddingVertical:   Spacing[3],
    backgroundColor:   Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backBtn: { padding: Spacing[1] },
  title:   { flex: 1, fontSize: 18, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  content: { padding: Spacing[4] },

  stepTitle: {
    fontSize:     13,
    fontWeight:   '700',
    color:        Colors.textSecondary,
    textTransform:'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing[2],
    marginTop:    Spacing[4],
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.xl,
    overflow:        'hidden',
    ...Shadow.sm,
  },

  // Address
  addAddressBtn: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing[3],
    padding:       Spacing[4],
  },
  addAddressText: { fontSize: 15, color: Colors.primary, fontWeight: '500' },
  addressRow: {
    flexDirection:   'row',
    alignItems:      'flex-start',
    padding:         Spacing[4],
    gap:             Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  addressRowSelected: { backgroundColor: '#FFF9F7' },
  radioOuter: {
    width:           20,
    height:          20,
    borderRadius:    10,
    borderWidth:     2,
    borderColor:     Colors.border,
    alignItems:      'center',
    justifyContent:  'center',
    marginTop:       2,
    flexShrink:      0,
  },
  radioOuterSelected: { borderColor: Colors.primary },
  radioInner: {
    width:           10,
    height:          10,
    borderRadius:    5,
    backgroundColor: Colors.primary,
  },
  addressInfo:   { flex: 1 },
  addrLabelRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing[1.5], marginBottom: 3 },
  addrLabel:     { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  defaultBadge: {
    backgroundColor:   '#FFF0EB',
    paddingHorizontal: Spacing[2],
    paddingVertical:   1,
    borderRadius:      BorderRadius.full,
  },
  defaultText: { fontSize: 10, color: Colors.primary, fontWeight: '600' },
  addrStreet:  { fontSize: 13, color: Colors.textPrimary, lineHeight: 18, marginBottom: 2 },
  addrCity:    { fontSize: 12, color: Colors.textSecondary },

  // Instructions
  instructionsInput: {
    padding:     Spacing[4],
    fontSize:    14,
    color:       Colors.textPrimary,
    minHeight:   80,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign:   'right',
    fontSize:    11,
    color:       Colors.textSecondary,
    paddingRight: Spacing[4],
    paddingBottom: Spacing[2],
  },

  // Payment
  paymentRow: {
    flexDirection:   'row',
    alignItems:      'center',
    padding:         Spacing[4],
    gap:             Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  paymentRowSelected: { backgroundColor: '#FFF9F7' },
  paymentEmoji: { fontSize: 28 },
  paymentInfo:  { flex: 1 },
  paymentLabel: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  paymentDesc:  { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  // Summary
  summaryRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    padding:        Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  summaryLabel: { fontSize: 14, color: Colors.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  summaryTotal: { borderBottomWidth: 0 },
  totalLabel:   { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  totalValue:   { fontSize: 16, fontWeight: '800', color: Colors.primary },

  bottomBar: {
    paddingHorizontal: Spacing[4],
    paddingTop:        Spacing[3],
    backgroundColor:   Colors.white,
    borderTopWidth:    1,
    borderTopColor:    Colors.border,
    ...Shadow.lg,
  },
});
