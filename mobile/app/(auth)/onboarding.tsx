import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/common/Button';
import { Colors } from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/spacing';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id:       '1',
    emoji:    '🍕',
    title:    'Discover Great Food',
    subtitle: 'Explore hundreds of restaurants near you. Filter by cuisine, rating, or delivery time.',
    bg:       '#FFF3EE',
    accent:   Colors.primary,
  },
  {
    id:       '2',
    emoji:    '⚡',
    title:    'Order in Seconds',
    subtitle: 'Add to cart, apply coupons, and checkout in a few taps. It\'s that simple.',
    bg:       '#EEF6FF',
    accent:   Colors.secondary,
  },
  {
    id:       '3',
    emoji:    '📍',
    title:    'Live Order Tracking',
    subtitle: 'Watch your delivery in real time on a map. Know exactly when it arrives.',
    bg:       '#EEFFF5',
    accent:   '#27AE60',
  },
];

export default function OnboardingScreen() {
  const router    = useRouter();
  const insets    = useSafeAreaInsets();
  const [current, setCurrent] = useState(0);
  const flatRef   = useRef<FlatList>(null);

  const handleNext = () => {
    if (current < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: current + 1, animated: true });
      setCurrent(c => c + 1);
    } else {
      router.push('/(auth)/register');
    }
  };

  const handleSkip = () => router.push('/(auth)/login');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Skip */}
      <TouchableOpacity
        style={styles.skipBtn}
        onPress={handleSkip}
        accessibilityRole="button"
        accessibilityLabel="Skip onboarding"
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={[styles.slide, { backgroundColor: item.bg }]}>
            {/* Illustration placeholder */}
            <View style={[styles.illustrationBox, { backgroundColor: item.bg }]}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <Text style={[styles.slideTitle, { color: item.accent }]}>
              {item.title}
            </Text>
            <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === current && styles.dotActive,
              i === current && { backgroundColor: SLIDES[current].accent },
            ]}
          />
        ))}
      </View>

      {/* Actions */}
      <View style={[styles.actions, { paddingBottom: insets.bottom + Spacing[4] }]}>
        <Button
          title={current === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          variant="primary"
          size="lg"
        />

        {current < SLIDES.length - 1 && (
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.signInLink}
            accessibilityRole="button"
          >
            <Text style={styles.signInText}>
              Already have an account? <Text style={styles.signInBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  skipBtn: {
    alignSelf:    'flex-end',
    paddingHorizontal: Spacing[5],
    paddingVertical:   Spacing[3],
  },
  skipText: { fontSize: 15, color: Colors.textSecondary, fontWeight: '500' },
  slide: {
    width,
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    paddingHorizontal: Spacing[8],
  },
  illustrationBox: {
    width:           240,
    height:          240,
    borderRadius:    BorderRadius['3xl'],
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    Spacing[8],
  },
  emoji:         { fontSize: 96 },
  slideTitle: {
    fontSize:   28,
    fontWeight: '800',
    textAlign:  'center',
    marginBottom: Spacing[3],
  },
  slideSubtitle: {
    fontSize:  16,
    color:     Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  dots: {
    flexDirection:  'row',
    justifyContent: 'center',
    gap:            Spacing[2],
    paddingVertical: Spacing[6],
  },
  dot: {
    width:        8,
    height:       8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: { width: 24, borderRadius: 4 },
  actions: {
    paddingHorizontal: Spacing[6],
    gap: Spacing[3],
  },
  signInLink:  { alignItems: 'center', paddingVertical: Spacing[2] },
  signInText:  { fontSize: 14, color: Colors.textSecondary },
  signInBold:  { color: Colors.primary, fontWeight: '700' },
});
