import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { Button }  from '@/components/common/Button';
import { Input }   from '@/components/common/Input';
import { Colors }  from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { resetPasswordSchema, type ResetPasswordForm } from '@/utils/validators';
import { authApi } from '@/api/authApi';

export default function OtpScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const params  = useLocalSearchParams<{ email?: string; mode?: 'verify' | 'reset' }>();

  const isResetMode = params.mode === 'reset';
  const email       = params.email ?? '';

  // OTP digits — 6 separate inputs for better UX
  const [otp,       setOtp]       = useState(['', '', '', '', '', '']);
  const [loading,   setLoading]   = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Reset password form (only shown in reset mode)
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email,
      otpCode:         '',
      newPassword:     '',
      confirmPassword: '',
    },
  });

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // only last char
    setOtp(newOtp);
    // Auto-advance
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (!value && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const getOtpString = () => otp.join('');

  const handleVerify = async () => {
    const code = getOtpString();
    if (code.length < 6) {
      Toast.show({ type: 'error', text1: 'Invalid Code', text2: 'Please enter the 6-digit code.' });
      return;
    }

    setLoading(true);
    try {
      await authApi.verifyOtp(email, code);
      Toast.show({ type: 'success', text1: 'Email Verified!', text2: 'Your account is now active.' });
      router.replace('/(customer)/(tabs)/home');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Invalid Code', text2: e.message ?? 'Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (data: ResetPasswordForm) => {
    const code = getOtpString();
    if (code.length < 6) {
      Toast.show({ type: 'error', text1: 'Invalid Code', text2: 'Please enter the 6-digit code.' });
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({ ...data, otpCode: code });
      Toast.show({ type: 'success', text1: 'Password Reset!', text2: 'Please sign in with your new password.' });
      router.replace('/(auth)/login');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Failed', text2: e.message ?? 'Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      if (isResetMode) {
        await authApi.forgotPassword(email);
      } else {
        await authApi.sendOtp(email);
      }
      setOtp(['', '', '', '', '', '']);
      setCountdown(60);
      setCanResend(false);
      Toast.show({ type: 'success', text1: 'Code Resent', text2: 'Check your email.' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to resend', text2: 'Please try again.' });
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

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <Ionicons name="mail-open-outline" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.title}>
            {isResetMode ? 'Reset Password' : 'Verify Email'}
          </Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={styles.emailText}>{email || 'your email'}</Text>
          </Text>
        </View>

        {/* OTP Input */}
        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => { inputRefs.current[index] = ref; }}
              style={[styles.otpInput, digit && styles.otpInputFilled]}
              value={digit}
              onChangeText={val => handleOtpChange(val, index)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
              accessibilityLabel={`OTP digit ${index + 1}`}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && !digit && index > 0) {
                  inputRefs.current[index - 1]?.focus();
                }
              }}
            />
          ))}
        </View>

        {/* Resend */}
        <View style={styles.resendRow}>
          {canResend ? (
            <TouchableOpacity onPress={handleResend} accessibilityRole="button">
              <Text style={styles.resendActive}>Resend Code</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendTimer}>
              Resend code in <Text style={styles.timerNum}>{countdown}s</Text>
            </Text>
          )}
        </View>

        {/* Password fields in reset mode */}
        {isResetMode && (
          <View style={styles.passwordSection}>
            <Controller
              control={control}
              name="newPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="New Password"
                  placeholder="Min. 8 characters"
                  isPassword
                  leftIcon="lock-closed-outline"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.newPassword?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirm Password"
                  placeholder="Re-enter password"
                  isPassword
                  leftIcon="lock-closed-outline"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                />
              )}
            />
          </View>
        )}

        <Button
          title={isResetMode ? 'Reset Password' : 'Verify Email'}
          onPress={isResetMode ? handleSubmit(handleResetSubmit) : handleVerify}
          isLoading={loading}
          size="lg"
          style={styles.verifyBtn}
        />
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
  emailText: { color: Colors.primary, fontWeight: '600' },

  // OTP boxes
  otpRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginBottom:   Spacing[5],
    gap:            Spacing[2],
  },
  otpInput: {
    flex:            1,
    height:          56,
    borderWidth:     2,
    borderColor:     Colors.border,
    borderRadius:    BorderRadius.xl,
    textAlign:       'center',
    fontSize:        24,
    fontWeight:      '700',
    color:           Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  otpInputFilled: {
    borderColor:     Colors.primary,
    backgroundColor: '#FFF0EB',
    color:           Colors.primary,
  },

  // Resend
  resendRow: { alignItems: 'center', marginBottom: Spacing[6] },
  resendTimer: { fontSize: 14, color: Colors.textSecondary },
  timerNum:    { color: Colors.primary, fontWeight: '700' },
  resendActive:{ fontSize: 14, color: Colors.primary, fontWeight: '700' },

  passwordSection: { marginBottom: Spacing[2] },
  verifyBtn: {},
});
