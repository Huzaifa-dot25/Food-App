export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Preparing'
  | 'ReadyForPickup'
  | 'OutForDelivery'
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethod = 'CashOnDelivery' | 'Card' | 'Wallet';

export interface OrderItem {
  id: number;
  foodId: number;
  foodName: string;
  foodImageUrl: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface RiderTracking {
  riderId: number;
  riderName: string;
  riderPhone: string | null;
  riderPhoto: string | null;
  vehicleType: string;
  latitude: number | null;
  longitude: number | null;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  restaurantId: number;
  restaurantName: string;
  restaurantLogo: string | null;
  deliveryAddress: string;
  deliveryInstructions: string | null;
  addressLatitude: number;
  addressLongitude: number;
  subTotal: number;
  discountAmount: number;
  deliveryFee: number;
  totalAmount: number;
  couponCode: string | null;
  paymentMethod: string;
  paymentStatus: string;
  estimatedDeliveryMinutes: number;
  createdAt: string;
  confirmedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  items: OrderItem[];
  rider: RiderTracking | null;
  canCancel: boolean;
  canReview: boolean;
}

export interface OrderSummary {
  id: number;
  orderNumber: string;
  restaurantName: string;
  restaurantLogo: string | null;
  status: OrderStatus;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  paymentMethod: string;
}

export interface CartItem {
  id: number;
  foodId: number;
  foodName: string;
  foodImageUrl: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  isAvailable: boolean;
}

export interface Cart {
  id: number;
  restaurantId: number | null;
  restaurantName: string | null;
  restaurantLogoUrl: string | null;
  couponCode: string | null;
  discountAmount: number | null;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}
