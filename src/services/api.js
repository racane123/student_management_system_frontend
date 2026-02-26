/**
 * Central Axios instance: JWT injection, 401 → refresh token + retry, logout on refresh fail.
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/** Callback invoked when session is truly invalid (e.g. after failed refresh or no refresh token). */
let onUnauthorized = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const setUnauthorizedHandler = (handler) => {
  if (typeof handler === 'function') onUnauthorized = handler;
};

/** In-flight refresh promise so multiple 401s trigger a single refresh. */
let refreshPromise = null;

function clearStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('user');
}

/**
 * Call POST /auth/refresh with current refreshToken (no auth header).
 * Resolves with new access token; rejects on failure.
 */
async function doRefresh() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) throw new Error('No refresh token');

  const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken }, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
  });

  const newToken = data.token;
  const newRefreshToken = data.refreshToken;
  if (newToken) localStorage.setItem(TOKEN_KEY, newToken);
  if (newRefreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
  return newToken;
}

// ----- Request: inject JWT -----
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ----- Response: on 401 try refresh then retry; else onUnauthorized -----
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
      onUnauthorized();
      return Promise.reject(error);
    }

    if (!refreshPromise) {
      refreshPromise = doRefresh()
        .finally(() => { refreshPromise = null; });
    }

    try {
      const newToken = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch {
      clearStorage();
      onUnauthorized();
      return Promise.reject(error);
    }
  }
);

export default api;
