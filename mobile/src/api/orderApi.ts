import { apiGet, apiPost, apiPatch, apiDelete } from './client';
import type { Order, OrderSummary, RiderTracking } from '@/types/order.types';
import type { PagedResult } from '@/types/api.types';

export const orderApi = {
  // Customer
  create:         (data: object)                           => apiPost<Order>('/orders', data),
  getHistory:     (params?: object)                        => apiGet<PagedResult<OrderSummary>>('/orders', params as Record<string, unknown>),
  getById:        (id: number)                             => apiGet<Order>(`/orders/${id}`),
  cancel:         (id: number, reason: string)             => apiDelete<Order>(`/orders/${id}/cancel`),
  reorder:        (id: number)                             => apiPost<Order>(`/orders/${id}/reorder`),
  track:          (id: number)                             => apiGet<RiderTracking | null>(`/orders/${id}/track`),

  // Owner
  getRestaurantOrders: (restaurantId: number, params?: object) =>
    apiGet<PagedResult<OrderSummary>>(`/orders/restaurant/${restaurantId}`, params as Record<string, unknown>),
  updateStatus:   (id: number, status: string)             => apiPatch<Order>(`/orders/${id}/status`, { status }),
  assignRider:    (id: number, riderId: number)            => apiPost<Order>(`/orders/${id}/assign-rider`, { riderId }),

  // Rider
  getActiveDeliveries: ()                                  => apiGet<any[]>('/orders/rider/active'),
  acceptDelivery:      (assignmentId: number)              => apiPost(`/orders/rider/${assignmentId}/accept`),
  rejectDelivery:      (assignmentId: number)              => apiPost(`/orders/rider/${assignmentId}/reject`),
  confirmPickup:       (assignmentId: number)              => apiPost<Order>(`/orders/rider/${assignmentId}/pickup`),
  confirmDelivery:     (assignmentId: number)              => apiPost<Order>(`/orders/rider/${assignmentId}/deliver`),
  getRiderHistory:     (params?: object)                   => apiGet<PagedResult<any>>('/orders/rider/history', params as Record<string, unknown>),

  // Admin
  getAllOrders:    (params?: object)                        => apiGet<PagedResult<OrderSummary>>('/orders/admin/all', params as Record<string, unknown>),
};
