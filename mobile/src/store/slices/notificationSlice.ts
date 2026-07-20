import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { notificationApi } from '@/api/notificationApi';
import type { Notification } from '@/types/api.types';

interface NotificationState {
  items:       Notification[];
  unreadCount: number;
  isLoading:   boolean;
}

const initialState: NotificationState = { items: [], unreadCount: 0, isLoading: false };

export const fetchNotifications  = createAsyncThunk('notifications/fetch',  () => notificationApi.getAll());
export const fetchUnreadCount    = createAsyncThunk('notifications/unread', () => notificationApi.getUnreadCount());
export const markNotificationRead = createAsyncThunk('notifications/read',  (id: number) => notificationApi.markRead(id));
export const markAllRead         = createAsyncThunk('notifications/readAll',() => notificationApi.markAllRead());

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: { payload: Notification }) => {
      state.items.unshift(action.payload);
      state.unreadCount++;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled,  (s, a) => { s.items = a.payload.items; })
      .addCase(fetchUnreadCount.fulfilled,    (s, a) => { s.unreadCount = a.payload.count; })
      .addCase(markNotificationRead.fulfilled,(s, a) => {
        const n = s.items.find(i => i.id === a.meta.arg);
        if (n && !n.isRead) { n.isRead = true; s.unreadCount = Math.max(0, s.unreadCount - 1); }
      })
      .addCase(markAllRead.fulfilled, (s) => {
        s.items.forEach(i => i.isRead = true);
        s.unreadCount = 0;
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;

export const selectNotifications = (s: { notifications: NotificationState }) => s.notifications.items;
export const selectUnreadCount   = (s: { notifications: NotificationState }) => s.notifications.unreadCount;
