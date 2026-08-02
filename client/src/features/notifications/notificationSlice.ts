import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getNotifications } from "@/services/notification.service";
import type { AppNotification } from "@/types/realtime";
export interface NotificationState { items: AppNotification[]; unreadCount: number; isLoading: boolean }
const initialState: NotificationState = { items: [], unreadCount: 0, isLoading: false };
export const fetchNotifications = createAsyncThunk("notifications/fetch", getNotifications);
const notificationSlice = createSlice({ name: "notifications", initialState, reducers: {
  receivedNotification(state, action: PayloadAction<AppNotification>) { if (state.items.some((item) => item.id === action.payload.id)) return; state.items.unshift(action.payload); state.unreadCount += 1; },
  markNotificationsLocallyRead(state, action: PayloadAction<string[]>) { const ids = new Set(action.payload); state.items.forEach((item) => { if (ids.has(item.id) && !item.read) item.read = true; }); state.unreadCount = state.items.filter((item) => !item.read).length; },
  clearNotifications(state) { state.items = []; state.unreadCount = 0; },
}, extraReducers: (builder) => { builder.addCase(fetchNotifications.pending, (state) => { state.isLoading = true; }).addCase(fetchNotifications.fulfilled, (state, action) => { state.items = action.payload.items; state.unreadCount = action.payload.unreadCount; state.isLoading = false; }).addCase(fetchNotifications.rejected, (state) => { state.isLoading = false; }); } });
export const { receivedNotification, markNotificationsLocallyRead, clearNotifications } = notificationSlice.actions;
export const notificationReducer = notificationSlice.reducer;
