import { apiGet, apiPost, apiPut, apiDelete, apiPatch, apiClient } from './client';
import type { Restaurant, RestaurantSummary, RestaurantSearchRequest, BusinessHour } from '@/types/restaurant.types';
import type { PagedResult } from '@/types/api.types';

export const restaurantApi = {
  search:           (params: RestaurantSearchRequest)  => apiGet<PagedResult<RestaurantSummary>>('/restaurants', params as Record<string, unknown>),
  getById:          (id: number)                       => apiGet<Restaurant>(`/restaurants/${id}`),
  getFeatured:      ()                                 => apiGet<RestaurantSummary[]>('/restaurants/featured'),
  getNearby:        (lat: number, lng: number, radiusKm = 10) =>
    apiGet<RestaurantSummary[]>('/restaurants/nearby', { lat, lng, radiusKm }),
  getMine:          ()                                 => apiGet<Restaurant>('/restaurants/my'),
  getFavorites:     (page = 1, size = 20)              => apiGet<PagedResult<RestaurantSummary>>('/restaurants/favorites', { pageNumber: page, pageSize: size }),
  create:           (data: object)                     => apiPost<Restaurant>('/restaurants', data),
  update:           (id: number, data: object)         => apiPut<Restaurant>(`/restaurants/${id}`, data),
  delete:           (id: number)                       => apiDelete(`/restaurants/${id}`),
  uploadLogo:       (id: number, formData: FormData)   => apiClient.post(`/restaurants/${id}/logo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadCover:      (id: number, formData: FormData)   => apiClient.post(`/restaurants/${id}/cover`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateHours:      (id: number, hours: object[])      => apiPut(`/restaurants/${id}/hours`, hours),
  addFavorite:      (id: number)                       => apiPost(`/restaurants/${id}/favorites`),
  removeFavorite:   (id: number)                       => apiDelete(`/restaurants/${id}/favorites`),
};
