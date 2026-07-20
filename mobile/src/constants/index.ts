export * from './colors';
export * from './typography';
export * from './spacing';

export const APP_NAME = 'FoodDelivery';

export const ORDER_STATUS_LABELS: Record<string, string> = {
  Pending:        'Order Placed',
  Confirmed:      'Confirmed',
  Preparing:      'Being Prepared',
  ReadyForPickup: 'Ready for Pickup',
  OutForDelivery: 'On the Way',
  Delivered:      'Delivered',
  Cancelled:      'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  Pending:        '#F59E0B',
  Confirmed:      '#3B82F6',
  Preparing:      '#8B5CF6',
  ReadyForPickup: '#10B981',
  OutForDelivery: '#2D9CDB',
  Delivered:      '#27AE60',
  Cancelled:      '#EB5757',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CashOnDelivery: 'Cash on Delivery',
  Card:           'Credit / Debit Card',
  Wallet:         'Wallet',
};

export const VEHICLE_TYPE_LABELS: Record<string, string> = {
  Bicycle:    'Bicycle',
  Motorcycle: 'Motorcycle',
  Car:        'Car',
};
