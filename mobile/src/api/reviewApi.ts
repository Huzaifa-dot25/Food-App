import { apiGet, apiPost, apiDelete } from './client';
import type { Review } from '@/types/api.types';
import type { PagedResult } from '@/types/api.types';

export const reviewApi = {
  getRestaurantReviews: (restaurantId: number, page = 1, size = 10) =>
    apiGet<PagedResult<Review>>(`/reviews/restaurant/${restaurantId}`, { pageNumber: page, pageSize: size }),
  create:  (data: { orderId: number; rating: number; comment?: string }) =>
    apiPost<Review>('/reviews', data),
  reply:   (id: number, reply: string) =>
    apiPost<Review>(`/reviews/${id}/reply`, { reply }),
  delete:  (id: number) => apiDelete(`/reviews/${id}`),
};
