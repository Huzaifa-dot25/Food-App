import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Button } from '@/components/common/Button';
import { Colors } from '@/constants/colors';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { apiPost } from '@/api/client';
import type { PaymentDto } from '@/types/order.types';

// Mock card tokens accepted by the sandbox gateway
const MOCK_TOKENS = [
  { label: 'Visa',       token: 'tok_visa',       last4: '4242', brand: 'VISA' },
  { label: 'Mastercard', token: 'tok_mastercard',  last4: '5555', brand: 'MC'   },
  { label: 'Amex',       token: 'tok_amex',        last4: '3782', brand: 'AMEX' },
];

export default function PaymentScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  const [selectedToken, setSelectedToken] = useState(MOCK_TOKENS[0].token);
  const [cardHolder,    setCardHolder]    = useState('');
  const [loading,       setLoading]       = useState(false);

  const selectedCard = MOCK_TOKENS.find(t => t.token === selectedToken)!;

  const handlePay = async () => {
    if (!orderId) return;
    if (!cardHolder.trim()) {
      Toast.show({ type: 'error', text1: 'Missing Info', text2: 'Please enter the cardholder name.' });
      return;
    }

    setLoading(true);
    try {
      const result = await apiPost<PaymentDto>('/payments/card', {
        orderId: Number(orderId),
        cardToken: selectedToken,
      });

      if (result.status === 'Paid') {
        Toast.show({ type: 'success', text1: 'Payment Successful!', text2: 'Your order is confirmed.' });
        router.replace({
          pathname: '/(customer)/order-tracking/[id]',
          params:   { id: orderId },
        });
      } else {
        Toast.show({ type: 'error', text1: 'Payment Failed', text2: 'Please try again.' });
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Payment Error', text2: e.message ?? 'Please try again.' });
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.title}>Secure Payment</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ── Sandbox Notice ───────────────────── */}
        <View style={styles.sandboxNotice}>
          <Ionicons name="shield-checkmark-outline" size={18} color={Colors.secondary} />
          <Text style={styles.sandboxText}>
            Sandbox Mode — No real charges. Select a test card below.
          </Text>
        </View>

        {/* ── Card Preview ─────────────────────── */}
        <View style={styles.cardPreview}>
          <View style={styles.cardTop}>
            <Ionicons name="wifi-outline" size={24} color="rgba(255,255,255,0.7)" style={{ transform: [{ rotate: '90deg' }] }} />
            <Text style={styles.cardBrand}>{selectedCard.brand}</Text>
          </View>
          <Text style={styles.cardNumber}>•••• •••• •••• {selectedCard.last4}</Text>
          <View style={styles.cardBottom}>
            <View>
              <Text style={styles.cardFieldLabel}>CARDHOLDER</Text>
              <Text style={styles.cardFieldValue}>
                {cardHolder.trim() || 'YOUR NAME'}
              </Text>
            </View>
            <View>
              <Text style={styles.cardFieldLabel}>EXPIRES</Text>
              <Text style={styles.cardFieldValue}>12/28</Text>
            </View>
          </View>
        </View>

        {/* ── Select Card Type ─────────────────── */}
        <Text style={styles.sectionLabel}>Select Test Card</Text>
        <View style={styles.cardOptions}>
          {MOCK_TOKENS.map(opt => (
            <TouchableOpacity
              key={opt.token}
              style={[
                styles.cardOption,
                selectedToken === opt.token && styles.cardOptionSelected,
              ]}
              onPress={() => setSelectedToken(opt.token)}
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedToken === opt.token }}
              accessibilityLabel={`Select ${opt.label} card`}
            >
              <Text style={[
                styles.cardOptionText,
                selectedToken === opt.token && styles.cardOptionTextSelected,
              ]}>
                {opt.label}
              </Text>
              <Text style={styles.cardOptionLast4}>···· {opt.last4}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Card Form ────────────────────────── */}
        <Text style={styles.sectionLabel}>Card Details</Text>
        <View style={styles.formCard}>
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Cardholder Name</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="John Doe"
              placeholderTextColor={Colors.textPlaceholder}
              value={cardHolder}
              onChangeText={setCardHolder}
              autoCapitalize="words"
              accessibilityLabel="Cardholder name"
            />
          </View>
          <View style={styles.fieldDivider} />
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Card Number</Text>
            <Text style={styles.fieldReadonly}>•••• •••• •••• {selectedCard.last4}</Text>
          </View>
          <View style={styles.fieldDivider} />
          <View style={styles.formRow}>
            <View style={[styles.formField, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Expiry</Text>
              <Text style={styles.fieldReadonly}>12/28</Text>
            </View>
            <View style={styles.fieldVertDivider} />
            <View style={[styles.formField, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>CVV</Text>
              <Text style={styles.fieldReadonly}>•••</Text>
            </View>
          </View>
        </View>

        {/* ── Security badges ───────────────────── */}
        <View style={styles.securityRow}>
          <View style={styles.securityItem}>
            <Ionicons name="lock-closed-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.securityText}>SSL Encrypted</Text>
          </View>
          <View style={styles.securityItem}>
            <Ionicons name="shield-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.securityText}>PCI Compliant</Text>
          </View>
          <View style={styles.securityItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.securityText}>Secure Checkout</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Pay Button ────────────────────────────── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing[2] }]}>
        <Button
          title="Pay Now (Sandbox)"
          onPress={handlePay}
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

  sandboxNotice: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               Spacing[2],
    backgroundColor:   Colors.infoLight,
    borderRadius:      BorderRadius.lg,
    padding:           Spacing[3],
    marginBottom:      Spacing[5],
  },
  sandboxText: { flex: 1, fontSize: 12, color: Colors.secondary, lineHeight: 18 },

  // Card visual
  cardPreview: {
    backgroundColor: Colors.primary,
    borderRadius:    BorderRadius['2xl'],
    padding:         Spacing[5],
    marginBottom:    Spacing[5],
    ...Shadow.lg,
  },
  cardTop:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[6] },
  cardBrand:       { fontSize: 18, fontWeight: '800', color: Colors.white, letterSpacing: 2 },
  cardNumber:      { fontSize: 20, letterSpacing: 4, color: Colors.white, fontWeight: '600', marginBottom: Spacing[5] },
  cardBottom:      { flexDirection: 'row', justifyContent: 'space-between' },
  cardFieldLabel:  { fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, marginBottom: 4 },
  cardFieldValue:  { fontSize: 14, color: Colors.white, fontWeight: '600' },

  sectionLabel: {
    fontSize:     13,
    fontWeight:   '700',
    color:        Colors.textSecondary,
    textTransform:'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing[3],
    marginTop:    Spacing[2],
  },

  cardOptions: {
    flexDirection:   'row',
    gap:             Spacing[3],
    marginBottom:    Spacing[5],
  },
  cardOption: {
    flex:            1,
    borderWidth:     1.5,
    borderColor:     Colors.border,
    borderRadius:    BorderRadius.xl,
    padding:         Spacing[3],
    alignItems:      'center',
    backgroundColor: Colors.white,
  },
  cardOptionSelected: { borderColor: Colors.primary, backgroundColor: '#FFF0EB' },
  cardOptionText:     { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  cardOptionTextSelected: { color: Colors.primary },
  cardOptionLast4:    { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },

  formCard: {
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.xl,
    marginBottom:    Spacing[4],
    ...Shadow.sm,
  },
  formField: { padding: Spacing[4] },
  formRow:   { flexDirection: 'row' },
  fieldLabel:     { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', marginBottom: Spacing[1.5], textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldInput: {
    fontSize:    15,
    color:       Colors.textPrimary,
    fontWeight:  '500',
    padding:     0,
  },
  fieldReadonly:       { fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },
  fieldDivider:        { height: 1, backgroundColor: Colors.divider },
  fieldVertDivider:    { width: 1, backgroundColor: Colors.divider },

  securityRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing[5], marginTop: Spacing[2] },
  securityItem:{ flexDirection: 'row', alignItems: 'center', gap: Spacing[1] },
  securityText:{ fontSize: 11, color: Colors.textSecondary },

  bottomBar: {
    paddingHorizontal: Spacing[4],
    paddingTop:        Spacing[3],
    backgroundColor:   Colors.white,
    borderTopWidth:    1,
    borderTopColor:    Colors.border,
    ...Shadow.lg,
  },
});
