/**
 * Auth & Role Guard (context)
 * Provides user, login, logout and wires 401 handler.
 * On logout, calls POST /auth/logout with refreshToken then clears storage and Redux.
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api, setUnauthorizedHandler } from '../services/api';
import { store } from '../store';
import { clearAuth } from '../features/auth/authSlice';

const AuthContext = createContext(null);

const USER_STORAGE_KEY = 'user';
const TOKEN_STORAGE_KEY = 'token';
const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((userData, token, refreshToken) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    const clearAll = () => {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
      store.dispatch(clearAuth());
    };
    if (refreshToken) {
      api.post('/auth/logout', { refreshToken }).catch(() => {}).finally(clearAll);
    } else {
      clearAll();
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(() => {});
  }, [logout]);

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    role: user?.role ?? null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
