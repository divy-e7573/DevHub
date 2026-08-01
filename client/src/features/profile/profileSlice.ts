import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Profile } from "@/types/profile";

interface ProfileState {
  byUsername: Record<string, Profile>;
}

const initialState: ProfileState = { byUsername: {} };

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    upsertProfile(state, action: PayloadAction<Profile>) {
      state.byUsername[action.payload.user.username] = action.payload;
    },
  },
});

export const { upsertProfile } = profileSlice.actions;
export const profileReducer = profileSlice.reducer;
