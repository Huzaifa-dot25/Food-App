import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { CartItemRow }    from '@/components/cart/CartItemRow';
import { Button }         from '@/components/common/Button';
import { EmptyState }     from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Colors }         from '@/constants/colors';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { formatPrice }    from '@/utils/formatters';
import { useCart }        from '@/hooks/useCart';

export default function CartScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const {
    cart, isLoading, fetch,
    updateItem, removeItem,
    applyCoupon, removeCoupon, clear,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);

  useEffect(() => { fetch(); }, []);

  const handleUpdateQty = async (itemId: number, qty: number) => {
    try {
      await updateItem(itemId, qty);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message });
    }
  };

  const handleRemove = async (itemId: number) => {
    try {
      await removeItem(itemId);
      Toast.show({ type: 'success', text1: 'Item removed' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message });
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      await applyCoupon(couponInput.trim().toUpperCase());
      Toast.show({ type: 'success', text1: 'Coupon applied!', text2: `${couponInput.toUpperCase()} applied.` });
      setShowCouponInput(false);
      setCouponInput('');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Invalid Coupon', text2: e.message });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
      Toast.show({ type: 'success', text1: 'Coupon removed' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message });
    }
  };

  const handleClear = () => {
    Alert.alert('Clear Cart', 'Remove all items from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => clear() },
    ]);
  };

  if (isLoading && !cart) return <LoadingSpinner fullScreen />;

  const isEmpty = !cart || cart.items.length === 0;

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
        <Text style={styles.title}>My Cart</Text>
        {!isEmpty && (
          <TouchableOpacity
            onPress={handleClear}
            accessibilityRole="button"
            accessibilityLabel="Clear cart"
          >
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {isEmpty ? (
        <EmptyState
          icon="cart-outline"
          title="Your Cart is Empty"
          message="Add items from a restaurant to get started."
          actionLabel="Browse Restaurants"
          onAction={() => router.push('/(customer)/(tabs)/home')}
        />
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            {/* ── Restaurant name ───────────────── */}
            <View style={styles.restaurantBadge}>
              <Ionicons name="restaurant-outline" size={16} color={Colors.primary} />
              <Text style={styles.restaurantName}>
                {cart.restaurantName ?? 'Restaurant'}
              </Text>
            </View>

            {/* ── Items ────────────────────────── */}
            <View style={styles.itemsCard}>
              {cart.items.map(item => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onIncrease={() => handleUpdateQty(item.id, item.quantity + 1)}
                  onDecrease={() => handleUpdateQty(item.id, item.quantity - 1)}
                  onRemove={() => handleRemove(item.id)}
                />
              ))}
            </View>

            {/* ── Coupon ───────────────────────── */}
            <View style={styles.couponSection}>
              {cart.couponCode ? (
                <View style={styles.couponApplied}>
                  <View style={styles.couponLeft}>
                    <Ionicons name="pricetag-outline" size={18} color={Colors.success} />
                    <View>
                      <Text style={styles.couponCode}>{cart.couponCode}</Text>
                      <Text style={styles.couponSaving}>
                        You save {formatPrice(cart.discountAmount ?? 0)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={handleRemoveCoupon}
                    accessibilityRole="button"
                    accessibilityLabel="Remove coupon"
                  >
                    <Ionicons name="close-circle" size={22} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              ) : showCouponInput ? (
                <View style={styles.couponInputRow}>
                  <TextInput
                    style={styles.couponInput}
                    placeholder="Enter coupon code"
                    placeholderTextColor={Colors.textPlaceholder}
                    value={couponInput}
                    onChangeText={t => setCouponInput(t.toUpperCase())}
                    autoCapitalize="characters"
                    autoFocus
                    accessibilityLabel="Coupon code input"
                  />
                  <TouchableOpacity
                    style={styles.applyBtn}
                    onPress={handleApplyCoupon}
                    disabled={couponLoading}
                    accessibilityRole="button"
                    accessibilityLabel="Apply coupon"
                  >
                    <Text style={styles.applyBtnText}>
                      {couponLoading ? '…' : 'Apply'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowCouponInput(false)}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel coupon input"
                  >
                    <Ionicons name="close" size={20} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.couponTap}
                  onPress={() => setShowCouponInput(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Add coupon code"
                >
                  <Ionicons name="pricetag-outline" size={18} color={Colors.primary} />
                  <Text style={styles.couponTapText}>Have a coupon code?</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
                </TouchableOpacity>
              )}
            </View>

            {/* ── Bill Summary ─────────────────── */}
            <View style={styles.billCard}>
              <Text style={styles.billTitle}>Bill Summary</Text>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Subtotal</Text>
                <Text style={styles.billValue}>{formatPrice(cart.subtotal)}</Text>
              </View>
              {(cart.discountAmount ?? 0) > 0 && (
                <View style={styles.billRow}>
                  <Text style={[styles.billLabel, { color: Colors.success }]}>
                    Coupon Discount
                  </Text>
                  <Text style={[styles.billValue, { color: Colors.success }]}>
                    -{formatPrice(cart.discountAmount ?? 0)}
                  </Text>
                </View>
              )}
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Delivery Fee</Text>
                <Text style={styles.billValue}>
                  {cart.deliveryFee === 0 ? (
                    <Text style={{ color: Colors.success }}>FREE</Text>
                  ) : formatPrice(cart.deliveryFee)}
                </Text>
              </View>
              <View style={styles.billDivider} />
              <View style={styles.billRow}>
                <Text style={styles.billTotal}>Total</Text>
                <Text style={styles.billTotalValue}>{formatPrice(cart.total)}</Text>
              </View>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* ── Checkout Button ──────────────────── */}
          <View style={[styles.checkoutBar, { paddingBottom: insets.bottom + Spacing[2] }]}>
            <View style={styles.checkoutTotal}>
              <Text style={styles.checkoutTotalLabel}>{cart.itemCount} items</Text>
              <Text style={styles.checkoutTotalValue}>{formatPrice(cart.total)}</Text>
            </View>
            <Button
              title="Proceed to Checkout"
              onPress={() => router.push('/(customer)/checkout')}
              style={styles.checkoutBtn}
              fullWidth={false}
            />
          </View>
        </>
      )}
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
    gap:               Spacing[3],
  },
  backBtn:  { padding: Spacing[1] },
  title:    { flex: 1, fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  clearText:{ fontSize: 14, color: Colors.error, fontWeight: '600' },

  content: { padding: Spacing[4] },

  restaurantBadge: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               Spacing[2],
    backgroundColor:   '#FFF0EB',
    borderRadius:      BorderRadius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical:   Spacing[1.5],
    alignSelf:         'flex-start',
    marginBottom:      Spacing[3],
  },
  restaurantName: { fontSize: 13, color: Colors.primary, fontWeight: '600' },

  itemsCard: {
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.xl,
    paddingHorizontal: Spacing[4],
    marginBottom:    Spacing[3],
    ...Shadow.sm,
  },

  couponSection: {
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.xl,
    marginBottom:    Spacing[3],
    overflow:        'hidden',
    ...Shadow.sm,
  },
  couponApplied: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    padding:           Spacing[4],
    backgroundColor:   Colors.successLight,
  },
  couponLeft:    { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  couponCode:    { fontSize: 14, fontWeight: '700', color: Colors.success },
  couponSaving:  { fontSize: 12, color: Colors.success, marginTop: 2 },
  couponInputRow:{
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: Spacing[4],
    paddingVertical:   Spacing[2],
    gap:               Spacing[2],
  },
  couponInput: {
    flex:              1,
    height:            44,
    borderWidth:       1.5,
    borderColor:       Colors.primary,
    borderRadius:      BorderRadius.lg,
    paddingHorizontal: Spacing[3],
    fontSize:          14,
    fontWeight:        '600',
    color:             Colors.textPrimary,
    letterSpacing:     1,
  },
  applyBtn: {
    backgroundColor:   Colors.primary,
    paddingHorizontal: Spacing[4],
    paddingVertical:   Spacing[2.5],
    borderRadius:      BorderRadius.lg,
  },
  applyBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  couponTap: {
    flexDirection:     'row',
    alignItems:        'center',
    padding:           Spacing[4],
    gap:               Spacing[2],
  },
  couponTapText: { flex: 1, fontSize: 14, color: Colors.primary, fontWeight: '500' },

  billCard: {
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.xl,
    padding:         Spacing[4],
    ...Shadow.sm,
  },
  billTitle:     { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing[3] },
  billRow:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing[2.5] },
  billLabel:     { fontSize: 14, color: Colors.textSecondary },
  billValue:     { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  billDivider:   { height: 1, backgroundColor: Colors.divider, marginVertical: Spacing[2] },
  billTotal:     { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  billTotalValue:{ fontSize: 16, fontWeight: '800', color: Colors.primary },

  checkoutBar: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: Spacing[4],
    paddingTop:        Spacing[3],
    backgroundColor:   Colors.white,
    borderTopWidth:    1,
    borderTopColor:    Colors.border,
    gap:               Spacing[3],
    ...Shadow.lg,
  },
  checkoutTotal:      { flex: 1 },
  checkoutTotalLabel: { fontSize: 12, color: Colors.textSecondary },
  checkoutTotalValue: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  checkoutBtn:        { flex: 1 },
});
