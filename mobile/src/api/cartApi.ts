import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './client';
import type { Cart } from '@/types/order.types';

export const cartApi = {
  getCart:        ()                                         => apiGet<Cart>('/cart'),
  addItem:        (foodId: number, quantity: number)         => apiPost<Cart>('/cart/items', { foodId, quantity }),
  updateItem:     (itemId: number, quantity: number)         => apiPut<Cart>(`/cart/items/${itemId}`, { quantity }),
  removeItem:     (itemId: number)                           => apiDelete<Cart>(`/cart/items/${itemId}`),
  applyCoupon:    (couponCode: string)                       => apiPost<Cart>('/cart/coupon', { couponCode }),
  removeCoupon:   ()                                         => apiDelete<Cart>('/cart/coupon'),
  clearCart:      ()                                         => apiDelete('/cart'),
};
