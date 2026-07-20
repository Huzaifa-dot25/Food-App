export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profileImageUrl: string | null;
  isEmailVerified: boolean;
  roles: string[];
  createdAt: string;
}

export interface AuthResponse {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl: string | null;
  roles: string[];
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  fcmToken?: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  role: 'Customer' | 'Owner' | 'Rider';
}

export interface Address {
  id: number;
  label: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface CreateAddressRequest {
  label: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}
