import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenHeaderProps {
  title:       string;
  showBack?:   boolean;
  rightAction?: {
    icon:    keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    badge?:  number;
  };
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  showBack    = true,
  rightAction,
}) => {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + Spacing[2] }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {showBack ? (
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      <Text style={styles.title} numberOfLines={1}>{title}</Text>

      {rightAction ? (
        <TouchableOpacity
          onPress={rightAction.onPress}
          style={styles.rightButton}
          accessibilityRole="button"
        >
          <Ionicons name={rightAction.icon} size={24} color={Colors.textPrimary} />
          {!!rightAction.badge && rightAction.badge > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {rightAction.badge > 99 ? '99+' : rightAction.badge}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    backgroundColor:  Colors.white,
    paddingHorizontal: Spacing[4],
    paddingBottom:    Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  title: {
    fontSize:   17,
    fontWeight: '600',
    color:      Colors.textPrimary,
    flex:       1,
    textAlign:  'center',
    marginHorizontal: Spacing[2],
  },
  backButton:  { width: 36, height: 36, justifyContent: 'center' },
  rightButton: { width: 36, height: 36, justifyContent: 'center', alignItems: 'flex-end', position: 'relative' },
  placeholder: { width: 36 },
  badge: {
    position:        'absolute',
    top:             -4,
    right:           -4,
    backgroundColor: Colors.error,
    borderRadius:    10,
    minWidth:        18,
    height:          18,
    alignItems:      'center',
    justifyContent:  'center',
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 10, color: Colors.white, fontWeight: '700' },
});
