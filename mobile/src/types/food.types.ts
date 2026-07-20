export interface FoodCategory {
  id: number;
  name: string;
  description: string | null;
  sortOrder: number;
  foodCount: number;
}

export interface FoodImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Food {
  id: number;
  restaurantId: number;
  restaurantName: string;
  categoryId: number;
  categoryName: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  effectivePrice: number;
  isBestSeller: boolean;
  isPopular: boolean;
  isRecommended: boolean;
  isAvailable: boolean;
  isVegetarian: boolean;
  isSpicy: boolean;
  averageRating: number;
  totalRatings: number;
  images: FoodImage[];
  primaryImageUrl: string | null;
}

export interface FoodSummary {
  id: number;
  name: string;
  primaryImageUrl: string | null;
  effectivePrice: number;
  discountPrice: number | null;
  price: number;
  isAvailable: boolean;
  isBestSeller: boolean;
  averageRating: number;
  categoryName: string;
}
