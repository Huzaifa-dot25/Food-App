export interface RestaurantCategory {
  id: number;
  name: string;
  iconUrl: string | null;
  sortOrder: number;
}

export interface BusinessHour {
  dayOfWeek: number;
  dayName: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface Restaurant {
  id: number;
  name: string;
  description: string;
  logoImageUrl: string | null;
  coverImageUrl: string | null;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  email: string | null;
  averageRating: number;
  totalRatings: number;
  minOrderAmount: number;
  deliveryFee: number;
  estimatedDeliveryTimeMinutes: number;
  isCurrentlyOpen: boolean;
  status: string;
  categoryName: string;
  categoryIcon: string | null;
  distanceKm: number | null;
  businessHours: BusinessHour[];
}

export interface RestaurantSummary {
  id: number;
  name: string;
  logoImageUrl: string | null;
  coverImageUrl: string | null;
  city: string;
  averageRating: number;
  totalRatings: number;
  deliveryFee: number;
  estimatedDeliveryTimeMinutes: number;
  isCurrentlyOpen: boolean;
  categoryName: string;
  distanceKm: number | null;
  isFavorite: boolean;
}

export interface RestaurantSearchRequest {
  keyword?: string;
  categoryId?: number;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  minRating?: number;
  sortBy?: 'rating' | 'distance' | 'deliveryFee';
  isOpen?: boolean;
  pageNumber?: number;
  pageSize?: number;
}
