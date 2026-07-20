import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { orderApi } from '@/api/orderApi';
import type { Order, OrderSummary } from '@/types/order.types';
import type { PagedResult } from '@/types/api.types';

interface OrderState {
  orders:      OrderSummary[];
  currentOrder: Order | null;
  totalCount:  number;
  isLoading:   boolean;
  error:       string | null;
}

const initialState: OrderState = {
  orders:       [],
  currentOrder: null,
  totalCount:   0,
  isLoading:    false,
  error:        null,
};

export const fetchOrderHistory  = createAsyncThunk('orders/history', (params?: object) => orderApi.getHistory(params));
export const fetchOrderById     = createAsyncThunk('orders/byId',    (id: number) => orderApi.getById(id));
export const placeOrder         = createAsyncThunk('orders/place',   (data: object) => orderApi.create(data));
export const cancelOrder        = createAsyncThunk('orders/cancel',  ({ id, reason }: { id: number; reason: string }) => orderApi.cancel(id, reason));

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setCurrentOrder: (state, action: PayloadAction<Order>) => { state.currentOrder = action.payload; },
    clearCurrentOrder: (state) => { state.currentOrder = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderHistory.pending,   (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchOrderHistory.fulfilled, (s, a) => {
        s.isLoading   = false;
        s.orders      = a.payload.items;
        s.totalCount  = a.payload.totalCount;
      })
      .addCase(fetchOrderHistory.rejected, (s, a) => { s.isLoading = false; s.error = String(a.error.message); })

      .addCase(fetchOrderById.pending,   (s) => { s.isLoading = true; })
      .addCase(fetchOrderById.fulfilled, (s, a) => { s.isLoading = false; s.currentOrder = a.payload; })
      .addCase(fetchOrderById.rejected,  (s, a) => { s.isLoading = false; s.error = String(a.error.message); })

      .addCase(placeOrder.pending,   (s) => { s.isLoading = true; s.error = null; })
      .addCase(placeOrder.fulfilled, (s, a) => { s.isLoading = false; s.currentOrder = a.payload; })
      .addCase(placeOrder.rejected,  (s, a) => { s.isLoading = false; s.error = String(a.error.message); })

      .addCase(cancelOrder.fulfilled, (s, a) => { s.currentOrder = a.payload; });
  },
});

export const { setCurrentOrder, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;

export const selectOrders       = (s: { orders: OrderState }) => s.orders.orders;
export const selectCurrentOrder = (s: { orders: OrderState }) => s.orders.currentOrder;
export const selectOrderLoading = (s: { orders: OrderState }) => s.orders.isLoading;
