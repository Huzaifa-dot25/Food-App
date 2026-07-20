import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'small' | 'large';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  fullScreen = false,
  size       = 'large',
}) => (
  <View style={[styles.container, fullScreen && styles.fullScreen]}>
    <ActivityIndicator size={size} color={Colors.primary} />
    {message && <Text style={styles.message}>{message}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems:     'center',
    justifyContent: 'center',
    padding:        Spacing[6],
  },
  fullScreen: {
    flex:            1,
    backgroundColor: Colors.background,
  },
  message: {
    marginTop: Spacing[3],
    color:     Colors.textSecondary,
    fontSize:  14,
  },
});
