/**
 * Auth slice – stores user and permissions for Redux selectors.
 * Synced from AuthContext on login; cleared on logout.
 */

import { createSlice } from '@reduxjs/toolkit';

const USER_KEY = 'user';

const initialState = {
  user: (() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, { payload }) {
      state.user = payload?.user ?? payload;
    },
    clearAuth(state) {
      state.user = null;
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
