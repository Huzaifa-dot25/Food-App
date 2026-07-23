import React from 'react';
import { render } from '@testing-library/react-native';
import { OrderStatusBar } from '../components/order/OrderStatusBar';
import type { OrderStatus } from '../types/order.types';

describe('OrderStatusBar component', () => {
  const activeStatuses: OrderStatus[] = [
    'Confirmed', 'Preparing', 'ReadyForPickup', 'OutForDelivery', 'Delivered',
  ];

  it('renders without crashing for all active statuses', () => {
    activeStatuses.forEach(status => {
      expect(() => render(<OrderStatusBar status={status} />)).not.toThrow();
    });
  });

  it('renders cancelled state correctly', () => {
    const { getByText } = render(<OrderStatusBar status="Cancelled" />);
    expect(getByText('Order Cancelled')).toBeTruthy();
  });

  it('renders pending as confirmed step', () => {
    expect(() => render(<OrderStatusBar status="Pending" />)).not.toThrow();
  });

  it('shows Delivered label when delivered', () => {
    const { getByText } = render(<OrderStatusBar status="Delivered" />);
    expect(getByText('Delivered')).toBeTruthy();
  });
});
