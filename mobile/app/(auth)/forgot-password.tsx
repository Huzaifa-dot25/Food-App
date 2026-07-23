import React, { useState } from 'react';
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
import { forgotPasswordSchema, type ForgotPasswordForm } from '@/utils/validators';
import { authApi } from '@/api/authApi';

export default function ForgotPasswordScreen() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const [loading, setLoading]   = useState(false);
  const [sent,    setSent]      = useState(false);
  const [email,   setEmailState] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setEmailState(data.email);
      setSent(true);
    } catch {
      // Always show success (prevents email enumeration)
      setEmailState(data.email);
      setSent(true);
    } finally {
      setLoading(false);
    }
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

        {!sent ? (
          <>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconBox}>
                <Ionicons name="lock-open-outline" size={40} color={Colors.primary} />
              </View>
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                Enter your email and we'll send you a reset code.
              </Text>
            </View>

            {/* Form */}
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

            <Button
              title="Send Reset Code"
              onPress={handleSubmit(onSubmit)}
              isLoading={loading}
              size="lg"
              style={styles.btn}
            />

            <TouchableOpacity
              style={styles.backToLogin}
              onPress={() => router.back()}
              accessibilityRole="button"
            >
              <Text style={styles.backToLoginText}>Back to Sign In</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* Sent confirmation */
          <View style={styles.sentContainer}>
            <View style={styles.sentIcon}>
              <Ionicons name="checkmark-circle" size={72} color={Colors.success} />
            </View>
            <Text style={styles.sentTitle}>Check Your Email</Text>
            <Text style={styles.sentSubtitle}>
              We sent a 6-digit code to{'\n'}
              <Text style={styles.sentEmail}>{email}</Text>
            </Text>

            <Button
              title="Enter Reset Code"
              onPress={() =>
                router.push({
                  pathname: '/(auth)/otp',
                  params:   { email, mode: 'reset' },
                })
              }
              size="lg"
              style={styles.btn}
            />

            <TouchableOpacity
              style={styles.resendBtn}
              onPress={handleSubmit(onSubmit)}
              accessibilityRole="button"
            >
              <Text style={styles.resendText}>Didn't receive it? Resend</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content:   { paddingHorizontal: Spacing[6] },
  backBtn:   { marginBottom: Spacing[6] },
  header: {
    alignItems:   'center',
    marginBottom: Spacing[8],
  },
  iconBox: {
    width:           80,
    height:          80,
    borderRadius:    BorderRadius.full,
    backgroundColor: '#FFF0EB',
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    Spacing[5],
  },
  title: {
    fontSize:   26,
    fontWeight: '800',
    color:      Colors.textPrimary,
    marginBottom: Spacing[2],
    textAlign:  'center',
  },
  subtitle: {
    fontSize:  15,
    color:     Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  btn: { marginTop: Spacing[4] },
  backToLogin: { alignItems: 'center', marginTop: Spacing[5] },
  backToLoginText: { fontSize: 15, color: Colors.primary, fontWeight: '600' },

  // Sent state
  sentContainer: { alignItems: 'center', paddingTop: Spacing[8] },
  sentIcon:      { marginBottom: Spacing[5] },
  sentTitle: {
    fontSize:   24,
    fontWeight: '800',
    color:      Colors.textPrimary,
    marginBottom: Spacing[3],
    textAlign:  'center',
  },
  sentSubtitle: {
    fontSize:  15,
    color:     Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing[8],
  },
  sentEmail:   { color: Colors.primary, fontWeight: '600' },
  resendBtn:   { marginTop: Spacing[4] },
  resendText:  { fontSize: 14, color: Colors.primary, fontWeight: '600' },
});
