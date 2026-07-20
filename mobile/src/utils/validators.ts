import { z } from 'zod';

export const loginSchema = z.object({
  email:    z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  firstName:       z.string().min(1, 'First name is required').max(100),
  lastName:        z.string().min(1, 'Last name is required').max(100),
  email:           z.string().min(1, 'Email is required').email('Enter a valid email'),
  phoneNumber:     z.string().min(7, 'Enter a valid phone number').max(20),
  password:        z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/,          'Must contain an uppercase letter')
    .regex(/[a-z]/,          'Must contain a lowercase letter')
    .regex(/[0-9]/,          'Must contain a digit')
    .regex(/[^a-zA-Z0-9]/,  'Must contain a special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  role:            z.enum(['Customer', 'Owner', 'Rider']),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

export const resetPasswordSchema = z.object({
  email:           z.string().min(1).email(),
  otpCode:         z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/),
  newPassword:     z
    .string()
    .min(8)
    .regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[^a-zA-Z0-9]/),
  confirmPassword: z.string().min(1),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
});

export const otpSchema = z.object({
  email:   z.string().email(),
  otpCode: z.string().length(6, 'Enter the 6-digit code').regex(/^\d{6}$/),
});

export const addressSchema = z.object({
  label:     z.string().min(1, 'Label is required').max(50),
  street:    z.string().min(1, 'Street is required').max(300),
  apartment: z.string().optional(),
  city:      z.string().min(1, 'City is required').max(100),
  state:     z.string().min(1, 'State is required').max(100),
  zipCode:   z.string().min(1, 'ZIP code is required').max(20),
});

export const reviewSchema = z.object({
  rating:  z.number().min(1, 'Rating is required').max(5),
  comment: z.string().max(1000).optional(),
});

export type LoginForm          = z.infer<typeof loginSchema>;
export type RegisterForm       = z.infer<typeof registerSchema>;
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordForm  = z.infer<typeof resetPasswordSchema>;
export type OtpForm            = z.infer<typeof otpSchema>;
export type AddressForm        = z.infer<typeof addressSchema>;
export type ReviewForm         = z.infer<typeof reviewSchema>;
