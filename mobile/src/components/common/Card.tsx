import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/colors';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';

interface CardProps {
  children:    React.ReactNode;
  style?:      ViewStyle;
  onPress?:    () => void;
  padding?:    number;
  shadow?:     'sm' | 'md' | 'lg' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  padding = Spacing[4],
  shadow  = 'sm',
}) => {
  const cardStyle = [
    styles.card,
    shadow !== 'none' && Shadow[shadow],
    { padding },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={cardStyle}
        accessibilityRole="button"
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.xl,
  },
});
