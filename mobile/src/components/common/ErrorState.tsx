import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Something went wrong. Please try again.',
  onRetry,
}) => (
  <View style={styles.container} accessibilityRole="alert">
    <Ionicons name="alert-circle-outline" size={56} color={Colors.error} />
    <Text style={styles.message}>{message}</Text>
    {onRetry && (
      <Button
        title="Try Again"
        onPress={onRetry}
        variant="outline"
        fullWidth={false}
        style={styles.button}
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    padding:        Spacing[8],
  },
  message: {
    fontSize:     14,
    color:        Colors.textSecondary,
    textAlign:    'center',
    marginTop:    Spacing[3],
    marginBottom: Spacing[4],
    lineHeight:   22,
  },
  button: {},
});
