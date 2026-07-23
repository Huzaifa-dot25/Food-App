import React, { useEffect, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { Input }   from '@/components/common/Input';
import { Button }  from '@/components/common/Button';
import { Colors }  from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { registerSchema, type RegisterForm } from '@/utils/validators';
import { useAuth } from '@/hooks/useAuth';

type Role = 'Customer' | 'Owner' | 'Rider';

const ROLES: { key: Role; label: string; icon: string; desc: string }[] = [
  { key: 'Customer', label: 'Customer',  icon: '🛍️', desc: 'Order food' },
  { key: 'Owner',    label: 'Restaurant',icon: '🍽️', desc: 'Sell food' },
  { key: 'Rider',    label: 'Rider',     icon: '🚴', desc: 'Deliver food' },
];

export default function RegisterScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const [selectedRole, setSelectedRole] = useState<Role>('Customer');
  const { register, isLoading, error, clearError, isAuthenticated } = useAuth();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver:      zodResolver(registerSchema),
    defaultValues: {
      firstName: '', lastName: '', email: '',
      phoneNumber: '', password: '', confirmPassword: '',
      role: 'Customer',
    },
  });

  useEffect(() => {
    setValue('role', selectedRole);
  }, [selectedRole]);

  useEffect(() => {
    if (isAuthenticated) {
      // Go to OTP verification
      router.replace('/(auth)/otp');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) {
      Toast.show({ type: 'error', text1: 'Registration Failed', text2: error });
      clearError();
    }
  }, [error]);

  const onSubmit = async (data: RegisterForm) => {
    await register(data);
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
          { paddingTop: insets.top + Spacing[4], paddingBottom: insets.bottom + Spacing[8] },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join thousands of happy users</Text>
        </View>

        {/* Role Selector */}
        <View style={styles.roleSection}>
          <Text style={styles.sectionLabel}>I want to</Text>
          <View style={styles.roleRow}>
            {ROLES.map(role => (
              <TouchableOpacity
                key={role.key}
                style={[
                  styles.roleCard,
                  selectedRole === role.key && styles.roleCardActive,
                ]}
                onPress={() => setSelectedRole(role.key)}
                accessibilityRole="button"
                accessibilityLabel={`Select ${role.label} role`}
                accessibilityState={{ selected: selectedRole === role.key }}
              >
                <Text style={styles.roleEmoji}>{role.icon}</Text>
                <Text style={[
                  styles.roleLabel,
                  selectedRole === role.key && styles.roleLabelActive,
                ]}>
                  {role.label}
                </Text>
                <Text style={styles.roleDesc}>{role.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Name row */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="First Name"
                    placeholder="John"
                    autoCapitalize="words"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.firstName?.message}
                  />
                )}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    autoCapitalize="words"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.lastName?.message}
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email Address"
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
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
            name="phoneNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Phone Number"
                placeholder="+1 234 567 8900"
                keyboardType="phone-pad"
                leftIcon="call-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.phoneNumber?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                placeholder="Min. 8 characters"
                isPassword
                leftIcon="lock-closed-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Confirm Password"
                placeholder="Re-enter your password"
                isPassword
                leftIcon="lock-closed-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
              />
            )}
          />

          {/* Terms */}
          <Text style={styles.terms}>
            By registering you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>

          <Button
            title="Create Account"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            size="lg"
          />
        </View>

        {/* Login link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login')}
            accessibilityRole="button"
          >
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content:   { paddingHorizontal: Spacing[5] },
  backBtn:   { marginBottom: Spacing[4] },
  header: {
    marginBottom: Spacing[5],
  },
  title: {
    fontSize:   28,
    fontWeight: '800',
    color:      Colors.textPrimary,
    marginBottom: Spacing[1],
  },
  subtitle: { fontSize: 15, color: Colors.textSecondary },

  roleSection:  { marginBottom: Spacing[5] },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing[3] },
  roleRow: { flexDirection: 'row', gap: Spacing[3] },
  roleCard: {
    flex:            1,
    borderWidth:     1.5,
    borderColor:     Colors.border,
    borderRadius:    BorderRadius.xl,
    padding:         Spacing[3],
    alignItems:      'center',
    backgroundColor: Colors.white,
  },
  roleCardActive: {
    borderColor:     Colors.primary,
    backgroundColor: '#FFF0EB',
  },
  roleEmoji: { fontSize: 24, marginBottom: Spacing[1] },
  roleLabel: {
    fontSize:   13,
    fontWeight: '700',
    color:      Colors.textSecondary,
  },
  roleLabelActive: { color: Colors.primary },
  roleDesc: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, textAlign: 'center' },

  form:  { gap: Spacing[1] },
  row:   { flexDirection: 'row', gap: Spacing[3] },
  terms: {
    fontSize:  12,
    color:     Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing[4],
  },
  termsLink: { color: Colors.primary, fontWeight: '600' },
  footer: {
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
    marginTop:      Spacing[5],
  },
  footerText: { fontSize: 15, color: Colors.textSecondary },
  footerLink: { fontSize: 15, color: Colors.primary, fontWeight: '700' },
});
