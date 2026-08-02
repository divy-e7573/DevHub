// Redux Toolkit store.
//
// The store is assembled from feature slices. It starts empty; each feature
// registers its reducer here as it is implemented. Keeping the store
// definition separate from the provider lets us reuse it in tests.

import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "@/features/auth/authSlice";
import { profileReducer } from "@/features/profile/profileSlice";
import { feedReducer } from "@/features/feed/feedSlice";
import { notificationReducer } from "@/features/notifications/notificationSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      profile: profileReducer,
      feed: feedReducer,
      notifications: notificationReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
