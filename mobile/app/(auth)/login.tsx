import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Input }   from '@/components/common/Input';
import { Button }  from '@/components/common/Button';
import { Colors }  from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { loginSchema, type LoginForm } from '@/utils/validators';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { login, isLoading, error, clearError, isAuthenticated, isCustomer, isOwner, isRider, isAdmin } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Redirect after successful login
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin)    { router.replace('/(admin)/dashboard');   return; }
      if (isOwner)    { router.replace('/(owner)/dashboard');   return; }
      if (isRider)    { router.replace('/(rider)/dashboard');   return; }
      if (isCustomer) { router.replace('/(customer)/(tabs)/home'); }
    }
  }, [isAuthenticated]);

  // Show API error
  useEffect(() => {
    if (error) {
      Toast.show({ type: 'error', text1: 'Login Failed', text2: error });
      clearError();
    }
  }, [error]);

  const onSubmit = async (data: LoginForm) => {
    await login({ email: data.email, password: data.password });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing[6], paddingBottom: insets.bottom + Spacing[8] },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoEmoji}>🍔</Text>
          <Text style={styles.title}>Welcome back!</Text>
          <Text style={styles.subtitle}>Sign in to continue ordering</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email Address"
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                leftIcon="mail-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                placeholder="Enter your password"
                isPassword
                leftIcon="lock-closed-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />

          {/* Forgot password */}
          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => router.push('/(auth)/forgot-password')}
            accessibilityRole="button"
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            title="Sign In"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            size="lg"
            style={styles.submitBtn}
          />
        </View>

        {/* Register link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            accessibilityRole="button"
          >
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content:   { paddingHorizontal: Spacing[6] },
  header: {
    alignItems:   'center',
    marginBottom: Spacing[8],
  },
  logoEmoji: { fontSize: 48, marginBottom: Spacing[4] },
  title: {
    fontSize:     28,
    fontWeight:   '800',
    color:        Colors.textPrimary,
    marginBottom: Spacing[1],
  },
  subtitle: {
    fontSize: 15,
    color:    Colors.textSecondary,
  },
  form:       { gap: Spacing[1] },
  forgotBtn: {
    alignSelf:    'flex-end',
    marginTop:    -Spacing[2],
    marginBottom: Spacing[4],
    paddingVertical: Spacing[1],
  },
  forgotText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  submitBtn:  { marginTop: Spacing[2] },
  footer: {
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
    marginTop:      Spacing[6],
  },
  footerText: { fontSize: 15, color: Colors.textSecondary },
  footerLink: { fontSize: 15, color: Colors.primary, fontWeight: '700' },
});
