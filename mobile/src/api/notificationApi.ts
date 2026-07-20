import { apiGet, apiPatch, apiPost } from './client';
import type { Notification, PagedResult } from '@/types/api.types';

export const notificationApi = {
  getAll:        (page = 1, size = 20)    => apiGet<PagedResult<Notification>>('/notifications', { pageNumber: page, pageSize: size }),
  getUnreadCount: ()                      => apiGet<{ count: number }>('/notifications/unread-count'),
  markRead:       (id: number)            => apiPatch(`/notifications/${id}/read`),
  markAllRead:    ()                      => apiPatch('/notifications/read-all'),
  send:           (data: object)          => apiPost('/notifications/send', data),
  broadcast:      (data: object)          => apiPost('/notifications/broadcast', data),
};
