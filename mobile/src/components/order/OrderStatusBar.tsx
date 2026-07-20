import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { ORDER_STATUS_LABELS } from '@/constants';
import { Spacing } from '@/constants/spacing';
import type { OrderStatus } from '@/types/order.types';

const STEPS: OrderStatus[] = [
  'Confirmed', 'Preparing', 'ReadyForPickup', 'OutForDelivery', 'Delivered',
];

interface OrderStatusBarProps {
  status: OrderStatus;
}

export const OrderStatusBar: React.FC<OrderStatusBarProps> = ({ status }) => {
  if (status === 'Cancelled') {
    return (
      <View style={styles.cancelledContainer}>
        <Ionicons name="close-circle" size={32} color={Colors.error} />
        <Text style={styles.cancelledText}>Order Cancelled</Text>
      </View>
    );
  }

  const currentIdx = STEPS.indexOf(status === 'Pending' ? 'Confirmed' : status);

  return (
    <View style={styles.container}>
      {STEPS.map((step, idx) => {
        const isDone    = idx <= currentIdx;
        const isActive  = idx === currentIdx;
        const isLast    = idx === STEPS.length - 1;

        return (
          <React.Fragment key={step}>
            <View style={styles.step}>
              <View style={[styles.dot, isDone && styles.dotDone, isActive && styles.dotActive]}>
                {isDone && (
                  <Ionicons
                    name={isActive ? 'ellipse' : 'checkmark'}
                    size={isActive ? 8 : 12}
                    color={Colors.white}
                  />
                )}
              </View>
              <Text style={[styles.label, isDone && styles.labelDone]} numberOfLines={2}>
                {ORDER_STATUS_LABELS[step]}
              </Text>
            </View>
            {!isLast && (
              <View style={[styles.line, idx < currentIdx && styles.lineDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection:  'row',
    alignItems:     'flex-start',
    paddingVertical: Spacing[4],
  },
  step: { alignItems: 'center', flex: 1 },
  dot: {
    width:           24,
    height:          24,
    borderRadius:    12,
    backgroundColor: Colors.border,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    Spacing[1],
  },
  dotDone:   { backgroundColor: Colors.primary },
  dotActive: { backgroundColor: Colors.primary, width: 28, height: 28, borderRadius: 14 },
  label: {
    fontSize:  10,
    color:     Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  labelDone: { color: Colors.primary, fontWeight: '600' },
  line: {
    height:          2,
    flex:            0.5,
    backgroundColor: Colors.border,
    marginTop:       11,
    alignSelf:       'flex-start',
  },
  lineDone: { backgroundColor: Colors.primary },
  cancelledContainer: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        Spacing[4],
    gap:            Spacing[2],
  },
  cancelledText: { fontSize: 16, fontWeight: '600', color: Colors.error },
});
