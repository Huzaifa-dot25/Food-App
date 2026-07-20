import { apiGet, apiPost, apiPut, apiDelete, apiPatch, apiClient } from './client';
import type { Food, FoodSummary, FoodCategory } from '@/types/food.types';
import type { PagedResult } from '@/types/api.types';

export const foodApi = {
  search:           (params: object)                   => apiGet<PagedResult<FoodSummary>>('/foods', params as Record<string, unknown>),
  getById:          (id: number)                       => apiGet<Food>(`/foods/${id}`),
  getByRestaurant:  (restaurantId: number, categoryId?: number) =>
    apiGet<FoodSummary[]>(`/foods/restaurant/${restaurantId}`, categoryId ? { categoryId } : undefined),
  getBestSellers:   (restaurantId: number)             => apiGet<FoodSummary[]>(`/foods/restaurant/${restaurantId}/bestsellers`),
  getPopular:       (restaurantId: number)             => apiGet<FoodSummary[]>(`/foods/restaurant/${restaurantId}/popular`),
  getRecommended:   (restaurantId: number)             => apiGet<FoodSummary[]>(`/foods/restaurant/${restaurantId}/recommended`),
  getCategories:    (restaurantId: number)             => apiGet<FoodCategory[]>(`/foods/categories/restaurant/${restaurantId}`),
  create:           (restaurantId: number, data: object) => apiPost<Food>(`/foods/restaurant/${restaurantId}`, data),
  update:           (restaurantId: number, foodId: number, data: object) =>
    apiPut<Food>(`/foods/restaurant/${restaurantId}/${foodId}`, data),
  delete:           (restaurantId: number, foodId: number) =>
    apiDelete(`/foods/restaurant/${restaurantId}/${foodId}`),
  toggleAvailability: (restaurantId: number, foodId: number) =>
    apiPatch(`/foods/restaurant/${restaurantId}/${foodId}/toggle`),
  uploadImage:      (restaurantId: number, foodId: number, formData: FormData, isPrimary = false) =>
    apiClient.post(`/foods/restaurant/${restaurantId}/${foodId}/images?isPrimary=${isPrimary}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteImage:      (restaurantId: number, foodId: number, imageId: number) =>
    apiDelete(`/foods/restaurant/${restaurantId}/${foodId}/images/${imageId}`),
  createCategory:   (restaurantId: number, data: object) =>
    apiPost<FoodCategory>(`/foods/categories/restaurant/${restaurantId}`, data),
  updateCategory:   (restaurantId: number, categoryId: number, data: object) =>
    apiPut<FoodCategory>(`/foods/categories/restaurant/${restaurantId}/${categoryId}`, data),
  deleteCategory:   (restaurantId: number, categoryId: number) =>
    apiDelete(`/foods/categories/restaurant/${restaurantId}/${categoryId}`),
};
