import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/spacing';

interface BadgeProps {
  label:    string;
  color?:   string;
  bgColor?: string;
  size?:    'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color   = Colors.primary,
  bgColor = '#FFF0EB',
  size    = 'md',
}) => (
  <View style={[styles.badge, { backgroundColor: bgColor }, size === 'sm' && styles.sm]}>
    <Text style={[styles.text, { color }, size === 'sm' && styles.smText]}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing[2.5],
    paddingVertical:   Spacing[0.5],
    borderRadius:      BorderRadius.full,
    alignSelf:         'flex-start',
  },
  sm: { paddingHorizontal: Spacing[2], paddingVertical: 2 },
  text:   { fontSize: 12, fontWeight: '600' },
  smText: { fontSize: 10 },
});
