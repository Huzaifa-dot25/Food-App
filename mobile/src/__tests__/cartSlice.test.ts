import cartReducer, {
  clearCartState,
  selectCart,
  selectCartCount,
  selectCartTotal,
} from '../store/slices/cartSlice';
import type { Cart } from '../types/order.types';

const mockCart: Cart = {
  id:                1,
  restaurantId:      5,
  restaurantName:    'Test Restaurant',
  restaurantLogoUrl: null,
  couponCode:        null,
  discountAmount:    null,
  items: [
    {
      id: 1, foodId: 10, foodName: 'Burger',
      foodImageUrl: null, unitPrice: 10.00,
      quantity: 2, totalPrice: 20.00, isAvailable: true,
    },
    {
      id: 2, foodId: 11, foodName: 'Fries',
      foodImageUrl: null, unitPrice: 3.50,
      quantity: 1, totalPrice: 3.50, isAvailable: true,
    },
  ],
  subtotal:    23.50,
  deliveryFee: 2.00,
  total:       25.50,
  itemCount:   3,
};

describe('cartSlice reducers', () => {
  it('returns initial state', () => {
    const state = cartReducer(undefined, { type: '@@INIT' });
    expect(state.cart).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('clearCartState sets cart to null', () => {
    const initial = { cart: mockCart, isLoading: false, error: null };
    const state   = cartReducer(initial, clearCartState());
    expect(state.cart).toBeNull();
  });
});

describe('cartSlice selectors', () => {
  const makeState = (cart: Cart | null) => ({
    cart: { cart, isLoading: false, error: null },
  });

  it('selectCart returns the cart', () => {
    expect(selectCart(makeState(mockCart))).toBe(mockCart);
  });

  it('selectCart returns null when no cart', () => {
    expect(selectCart(makeState(null))).toBeNull();
  });

  it('selectCartCount returns total item count', () => {
    expect(selectCartCount(makeState(mockCart))).toBe(3);
  });

  it('selectCartCount returns 0 when no cart', () => {
    expect(selectCartCount(makeState(null))).toBe(0);
  });

  it('selectCartTotal returns cart total', () => {
    expect(selectCartTotal(makeState(mockCart))).toBe(25.50);
  });

  it('selectCartTotal returns 0 when no cart', () => {
    expect(selectCartTotal(makeState(null))).toBe(0);
  });
});
