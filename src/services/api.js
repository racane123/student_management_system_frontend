/**
 * MILESTONE 1: The Axios Brain
 * Central Axios instance with JWT injection and global 401 handling.
 * Place in: src/services/api.js
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/** Callback invoked on 401 - override by app (e.g. clear user + redirect to login) */
let onUnauthorized = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

/**
 * Register a custom handler for 401 (e.g. from AuthContext).
 * Call this once in your app bootstrap (e.g. main.jsx or AuthProvider).
 */
export const setUnauthorizedHandler = (handler) => {
  if (typeof handler === 'function') onUnauthorized = handler;
};

// ----- Request Interceptor: inject JWT from localStorage -----
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ----- Response Interceptor: global 401 handling -----
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default api;
