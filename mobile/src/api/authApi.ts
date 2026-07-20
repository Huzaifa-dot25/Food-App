import { apiGet, apiPost, apiPut, apiPatch, apiDelete, apiClient } from './client';
import type { AuthResponse, LoginRequest, RegisterRequest, User, Address, CreateAddressRequest } from '@/types/auth.types';

export const authApi = {
  register:             (data: RegisterRequest)         => apiPost<AuthResponse>('/auth/register', data),
  login:                (data: LoginRequest)            => apiPost<AuthResponse>('/auth/login', data),
  refresh:              (refreshToken: string)          => apiPost<AuthResponse>('/auth/refresh', { refreshToken }),
  logout:               ()                             => apiPost<void>('/auth/logout'),
  sendOtp:              (email: string)                 => apiPost<void>('/auth/send-otp', { email }),
  verifyOtp:            (email: string, otpCode: string)=> apiPost<void>('/auth/verify-otp', { email, otpCode }),
  forgotPassword:       (email: string)                 => apiPost<void>('/auth/forgot-password', { email }),
  resetPassword:        (data: object)                  => apiPost<void>('/auth/reset-password', data),
  getProfile:           ()                             => apiGet<User>('/auth/profile'),
  updateProfile:        (data: Partial<User>)           => apiPut<User>('/auth/profile', data),
  uploadProfileImage:   (formData: FormData)            => apiClient.post('/auth/profile/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAddresses:         ()                             => apiGet<Address[]>('/auth/addresses'),
  addAddress:           (data: CreateAddressRequest)    => apiPost<Address>('/auth/addresses', data),
  updateAddress:        (id: number, data: CreateAddressRequest) => apiPut<Address>(`/auth/addresses/${id}`, data),
  deleteAddress:        (id: number)                   => apiDelete(`/auth/addresses/${id}`),
  setDefaultAddress:    (id: number)                   => apiPatch(`/auth/addresses/${id}/set-default`),
};
