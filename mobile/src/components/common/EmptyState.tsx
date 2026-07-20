import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';

interface EmptyStateProps {
  icon?:       keyof typeof Ionicons.glyphMap;
  title:       string;
  message?:    string;
  actionLabel?: string;
  onAction?:   () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon        = 'search-outline',
  title,
  message,
  actionLabel,
  onAction,
}) => (
  <View style={styles.container}>
    <View style={styles.iconWrapper}>
      <Ionicons name={icon} size={64} color={Colors.primary} style={{ opacity: 0.4 }} />
    </View>
    <Text style={styles.title}>{title}</Text>
    {message && <Text style={styles.message}>{message}</Text>}
    {actionLabel && onAction && (
      <Button
        title={actionLabel}
        onPress={onAction}
        variant="outline"
        fullWidth={false}
        style={styles.button}
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    padding:         Spacing[8],
  },
  iconWrapper: { marginBottom: Spacing[4] },
  title: {
    fontSize:   20,
    fontWeight: '700',
    color:      Colors.textPrimary,
    textAlign:  'center',
    marginBottom: Spacing[2],
  },
  message: {
    fontSize:    14,
    color:       Colors.textSecondary,
    textAlign:   'center',
    lineHeight:  22,
    marginBottom: Spacing[4],
  },
  button: { marginTop: Spacing[2] },
});
