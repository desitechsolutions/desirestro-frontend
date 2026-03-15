import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  withCredentials: true, // send HTTP-only refresh-token cookie automatically
});

// ── REQUEST INTERCEPTOR: attach Bearer token ─────────────────────────────────
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── RESPONSE INTERCEPTOR: 401 → try refresh, else redirect ───────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/auth/refresh') &&
      !originalRequest.url?.includes('/api/auth/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return API(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await API.post('/api/auth/refresh');
        const newToken = res.data?.data?.token;
        if (newToken) {
          sessionStorage.setItem('token', newToken);
          API.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return API(originalRequest);
        }
        throw new Error('No token in refresh response');
      } catch (refreshError) {
        processQueue(refreshError, null);
        sessionStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Named API helpers — all API calls are centralised here so pages can import
// individual functions instead of calling the axios instance directly.
// ─────────────────────────────────────────────────────────────────────────────

// ── AUTH ─────────────────────────────────────────────────────────────────────
export const authLogin = (payload) =>
  API.post('/api/auth/login', payload);

export const authRegister = (payload) =>
  API.post('/api/auth/register', payload);

export const authRefresh = () =>
  API.post('/api/auth/refresh');

export const authLogout = () =>
  API.post('/api/auth/logout');

export const authChangePassword = (payload) =>
  API.post('/api/auth/change-password', payload);

// ── RESTAURANT PROFILE ───────────────────────────────────────────────────────
export const getRestaurantProfile = () =>
  API.get('/api/restaurant');

export const updateRestaurantProfile = (data) =>
  API.put('/api/restaurant', data);

// ── MENU ─────────────────────────────────────────────────────────────────────
export const getMenuCategories = () =>
  API.get('/api/menu/categories');

export const getMenuItems = () =>
  API.get('/api/menu/items');

export const createMenuCategory = (data) =>
  API.post('/api/menu/categories', data);

export const updateMenuCategory = (id, data) =>
  API.put(`/api/menu/categories/${id}`, data);

export const deleteMenuCategory = (id) =>
  API.delete(`/api/menu/categories/${id}`);

export const createMenuItem = (data) =>
  API.post('/api/menu/items', data);

export const updateMenuItem = (id, data) =>
  API.put(`/api/menu/items/${id}`, data);

export const deleteMenuItem = (id) =>
  API.delete(`/api/menu/items/${id}`);

// ── INGREDIENTS / INVENTORY ──────────────────────────────────────────────────
export const getIngredients = () =>
  API.get('/api/ingredients');

export const createIngredient = (data) =>
  API.post('/api/ingredients', data);

export const updateIngredient = (id, data) =>
  API.put(`/api/ingredients/${id}`, data);

export const deleteIngredient = (id) =>
  API.delete(`/api/ingredients/${id}`);

// ── TABLES ───────────────────────────────────────────────────────────────────
export const getTables = () =>
  API.get('/api/tables');

export const createTable = (data) =>
  API.post('/api/tables', data);

export const updateTable = (id, data) =>
  API.put(`/api/tables/${id}`, data);

export const deleteTable = (id) =>
  API.delete(`/api/tables/${id}`);

// ── PARTIES ──────────────────────────────────────────────────────────────────
export const getActiveParties = () =>
  API.get('/api/parties/active');

export const createParty = (data) =>
  API.post('/api/parties', data);

export const closeParty = (id) =>
  API.post(`/api/parties/${id}/close`);

// ── KOT (Kitchen Order Tickets) ──────────────────────────────────────────────
export const getReadyKOTs = () =>
  API.get('/api/kot/ready');

export const createKOT = (data) =>
  API.post('/api/kot', data);

export const markKOTReady = (id) =>
  API.post(`/api/kot/${id}/ready`);

export const getKOTsByParty = (partyId) =>
  API.get(`/api/kot/party/${partyId}`);

// ── BILLING ───────────────────────────────────────────────────────────────────
export const getPendingBills = () =>
  API.get('/api/bills/pending');

export const getBillDetails = (id) =>
  API.get(`/api/bills/${id}`);

export const generateBill = (partyId) =>
  API.post(`/api/bills/generate/${partyId}`);

export const settleBill = (billId, data) =>
  API.post(`/api/bills/${billId}/settle`, data);

// ── STAFF ─────────────────────────────────────────────────────────────────────
export const getStaff = () =>
  API.get('/api/staff');

export const createStaff = (data) =>
  API.post('/api/staff', data);

export const updateStaff = (id, data) =>
  API.put(`/api/staff/${id}`, data);

export const deleteStaff = (id) =>
  API.delete(`/api/staff/${id}`);

export const getTodayAttendance = () =>
  API.get('/api/staff/attendance/today');

export const getPendingLeaves = () =>
  API.get('/api/staff/leaves/pending');

export const applyLeave = (data) =>
  API.post('/api/staff/leaves', data);

export const approveLeave = (id) =>
  API.patch(`/api/staff/leaves/${id}/approve`);

export const rejectLeave = (id) =>
  API.patch(`/api/staff/leaves/${id}/reject`);

// ── ADMIN REPORTS ─────────────────────────────────────────────────────────────
export const getTodayStats = () =>
  API.get('/api/admin/today-stats');

export const getTopItems = (limit = 10) =>
  API.get(`/api/admin/top-items?limit=${limit}`);

export const getWeeklyRevenue = () =>
  API.get('/api/admin/weekly-revenue');

export const getRevenueByRange = (from, to) =>
  API.get(`/api/admin/revenue?from=${from}&to=${to}`);

// ─────────────────────────────────────────────────────────────────────────────
// Default export kept for backward-compatibility with existing pages
// that do: import API from '../services/api';
// ─────────────────────────────────────────────────────────────────────────────
export default API;