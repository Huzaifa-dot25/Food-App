export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: Record<string, string[]> | null;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginationRequest {
  pageNumber?: number;
  pageSize?: number;
}

export interface Notification {
  id: number;
  title: string;
  body: string;
  type: string;
  referenceId: number | null;
  isRead: boolean;
  createdAt: string;
}

export interface Review {
  id: number;
  orderId: number;
  orderNumber: string;
  restaurantId: number;
  customerName: string;
  customerPhoto: string | null;
  rating: number;
  comment: string | null;
  ownerReply: string | null;
  ownerRepliedAt: string | null;
  createdAt: string;
}
