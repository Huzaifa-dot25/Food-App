import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { cartApi } from '@/api/cartApi';
import type { Cart } from '@/types/order.types';

interface CartState {
  cart:      Cart | null;
  isLoading: boolean;
  error:     string | null;
}

const initialState: CartState = { cart: null, isLoading: false, error: null };

export const fetchCart       = createAsyncThunk('cart/fetch',        () => cartApi.getCart());
export const addCartItem     = createAsyncThunk('cart/addItem',      ({ foodId, quantity }: { foodId: number; quantity: number }) => cartApi.addItem(foodId, quantity));
export const updateCartItem  = createAsyncThunk('cart/updateItem',   ({ itemId, quantity }: { itemId: number; quantity: number }) => cartApi.updateItem(itemId, quantity));
export const removeCartItem  = createAsyncThunk('cart/removeItem',   (itemId: number) => cartApi.removeItem(itemId));
export const applyCartCoupon = createAsyncThunk('cart/applyCoupon',  (code: string) => cartApi.applyCoupon(code));
export const removeCartCoupon= createAsyncThunk('cart/removeCoupon', () => cartApi.removeCoupon());
export const clearCartThunk  = createAsyncThunk('cart/clear',        () => cartApi.clearCart());

const setCart = (state: CartState, action: { payload: Cart }) => {
  state.isLoading = false;
  state.cart      = action.payload;
  state.error     = null;
};
const setLoading = (state: CartState) => { state.isLoading = true; state.error = null; };
const setError   = (state: CartState, action: { payload?: unknown }) => {
  state.isLoading = false;
  state.error     = String(action.payload ?? 'Something went wrong');
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartState: (state) => { state.cart = null; },
  },
  extraReducers: (builder) => {
    [fetchCart, addCartItem, updateCartItem, removeCartItem, applyCartCoupon, removeCartCoupon].forEach((thunk) => {
      builder
        .addCase(thunk.pending,   setLoading)
        .addCase(thunk.fulfilled, setCart)
        .addCase(thunk.rejected,  setError);
    });
    builder.addCase(clearCartThunk.fulfilled, (state) => { state.cart = null; });
  },
});

export const { clearCartState } = cartSlice.actions;
export default cartSlice.reducer;

export const selectCart      = (s: { cart: CartState }) => s.cart.cart;
export const selectCartCount = (s: { cart: CartState }) => s.cart.cart?.itemCount ?? 0;
export const selectCartTotal = (s: { cart: CartState }) => s.cart.cart?.total ?? 0;
export const selectCartLoading = (s: { cart: CartState }) => s.cart.isLoading;
