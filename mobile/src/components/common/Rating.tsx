import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';

interface RatingProps {
  value:      number;
  count?:     number;
  size?:      number;
  showCount?: boolean;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  count,
  size      = 14,
  showCount = true,
}) => (
  <View style={styles.container} accessibilityLabel={`Rating: ${value.toFixed(1)} out of 5`}>
    <Ionicons name="star" size={size} color={Colors.star} />
    <Text style={[styles.value, { fontSize: size }]}>{value.toFixed(1)}</Text>
    {showCount && count !== undefined && (
      <Text style={[styles.count, { fontSize: size - 2 }]}>({count})</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: Spacing[0.5] },
  value:     { fontWeight: '600', color: Colors.textPrimary },
  count:     { color: Colors.textSecondary },
});
