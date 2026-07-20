import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { BorderRadius, Layout, Spacing } from '@/constants/spacing';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title:        string;
  onPress:      () => void;
  variant?:     Variant;
  size?:        Size;
  isLoading?:   boolean;
  disabled?:    boolean;
  fullWidth?:   boolean;
  leftIcon?:    React.ReactNode;
  rightIcon?:   React.ReactNode;
  style?:       ViewStyle;
  textStyle?:   TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant    = 'primary',
  size       = 'md',
  isLoading  = false,
  disabled   = false,
  fullWidth  = true,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.white}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {leftIcon  && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`], textStyle]}>
            {title}
          </Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius:    BorderRadius.xl,
    alignItems:      'center',
    justifyContent:  'center',
    flexDirection:   'row',
  },
  fullWidth: { width: '100%' },

  // Variants
  primary:   { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.secondary },
  outline: {
    backgroundColor: 'transparent',
    borderWidth:     1.5,
    borderColor:     Colors.primary,
  },
  ghost:   { backgroundColor: 'transparent' },
  danger:  { backgroundColor: Colors.error },
  disabled:{ opacity: 0.5 },

  // Sizes
  sm: { height: 36, paddingHorizontal: Spacing[3] },
  md: { height: Layout.buttonHeight, paddingHorizontal: Spacing[5] },
  lg: { height: 58, paddingHorizontal: Spacing[6] },

  // Text styles
  text:          { ...Typography.button, color: Colors.white },
  primaryText:   { color: Colors.white },
  secondaryText: { color: Colors.white },
  outlineText:   { color: Colors.primary },
  ghostText:     { color: Colors.primary },
  dangerText:    { color: Colors.white },
  smText:        { fontSize: 13 },
  mdText:        { fontSize: 15 },
  lgText:        { fontSize: 17 },

  content:   { flexDirection: 'row', alignItems: 'center' },
  iconLeft:  { marginRight: Spacing[2] },
  iconRight: { marginLeft: Spacing[2] },
});
