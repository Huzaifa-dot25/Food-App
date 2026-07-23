import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/common/Button';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius } from '@/constants/spacing';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background — replace with actual food image asset */}
      <View style={styles.bgPlaceholder} />

      {/* Gradient overlay */}
      <View style={styles.gradient} />

      {/* Content */}
      <View style={[styles.content, { paddingBottom: insets.bottom + Spacing[6] }]}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>🍔</Text>
          </View>
          <Text style={styles.logoText}>FoodDelivery</Text>
        </View>

        {/* Headline */}
        <View style={styles.headline}>
          <Text style={styles.title}>Hungry?</Text>
          <Text style={styles.subtitle}>
            Order food from your favourite{'\n'}restaurants in minutes
          </Text>
        </View>

        {/* CTA Buttons */}
        <View style={styles.buttons}>
          <Button
            title="Get Started"
            onPress={() => router.push('/(auth)/onboarding')}
            variant="primary"
            size="lg"
          />

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.push('/(auth)/login')}
            accessibilityRole="button"
          >
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.black },
  bgPlaceholder:  {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1A0A00',   // fallback until real image is added
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  content: {
    flex:            1,
    justifyContent:  'flex-end',
    paddingHorizontal: Spacing[6],
  },
  logoContainer: {
    alignItems:   'center',
    marginBottom: Spacing[12],
  },
  logoIcon: {
    width:           72,
    height:          72,
    borderRadius:    BorderRadius['2xl'],
    backgroundColor: Colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    Spacing[3],
  },
  logoEmoji:  { fontSize: 36 },
  logoText: {
    fontSize:   24,
    fontWeight: '800',
    color:      Colors.white,
    letterSpacing: 0.5,
  },
  headline:  { marginBottom: Spacing[8] },
  title: {
    fontSize:   48,
    fontWeight: '900',
    color:      Colors.white,
    lineHeight: 52,
  },
  subtitle: {
    fontSize:  17,
    color:     'rgba(255,255,255,0.8)',
    lineHeight: 26,
    marginTop:  Spacing[2],
  },
  buttons: { gap: Spacing[4] },
  loginLink: {
    alignItems: 'center',
    paddingVertical: Spacing[2],
  },
  loginText: { fontSize: 15, color: 'rgba(255,255,255,0.75)' },
  loginBold: { color: Colors.white, fontWeight: '700' },
});
