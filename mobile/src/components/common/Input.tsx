import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography, FontSize } from '@/constants/typography';
import { BorderRadius, Layout, Spacing } from '@/constants/spacing';

interface InputProps extends TextInputProps {
  label?:       string;
  error?:       string;
  leftIcon?:    keyof typeof Ionicons.glyphMap;
  rightIcon?:   keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  isPassword?:  boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  isPassword = false,
  style,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused,    setIsFocused]    = useState(false);

  const passwordIcon = showPassword ? 'eye-off-outline' : 'eye-outline';
  const secureEntry  = isPassword && !showPassword;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label} accessibilityLabel={label}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.focused,
          !!error   && styles.errorBorder,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={isFocused ? Colors.primary : Colors.textSecondary}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[styles.input, leftIcon && styles.inputWithLeftIcon, style]}
          placeholderTextColor={Colors.textPlaceholder}
          secureTextEntry={secureEntry}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityHint={error}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(p => !p)}
            style={styles.rightIcon}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <Ionicons name={passwordIcon} size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}

        {rightIcon && !isPassword && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            disabled={!onRightIconPress}
          >
            <Ionicons name={rightIcon} size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text style={styles.errorText} accessibilityRole="alert">
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: Spacing[4] },
  label: {
    ...Typography.label,
    color:        Colors.textPrimary,
    marginBottom: Spacing[1.5],
  },
  inputWrapper: {
    flexDirection:   'row',
    alignItems:      'center',
    height:          Layout.inputHeight,
    borderWidth:     1.5,
    borderColor:     Colors.border,
    borderRadius:    BorderRadius.xl,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing[4],
  },
  focused:     { borderColor: Colors.primary, backgroundColor: '#FFF9F7' },
  errorBorder: { borderColor: Colors.error },
  input: {
    flex:            1,
    ...Typography.body1,
    color:           Colors.textPrimary,
    paddingVertical: 0,
  },
  inputWithLeftIcon: { marginLeft: Spacing[2] },
  leftIcon:  { marginRight: Spacing[1] },
  rightIcon: { padding: Spacing[1] },
  errorText: {
    ...Typography.caption,
    color:      Colors.error,
    marginTop:  Spacing[1],
    marginLeft: Spacing[1],
  },
});
