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

// ── CUSTOMER MANAGEMENT ──────────────────────────────────────────────────
export const getCustomers = (restaurantId) =>
  API.get(`/api/restaurants/${restaurantId}/customers`);

export const getCustomer = (restaurantId, customerId) =>
  API.get(`/api/restaurants/${restaurantId}/customers/${customerId}`);

export const createCustomer = (restaurantId, data) =>
  API.post(`/api/restaurants/${restaurantId}/customers`, data);

export const updateCustomer = (restaurantId, customerId, data) =>
  API.put(`/api/restaurants/${restaurantId}/customers/${customerId}`, data);

export const deleteCustomer = (restaurantId, customerId) =>
  API.delete(`/api/restaurants/${restaurantId}/customers/${customerId}`);

export const searchCustomers = (restaurantId, query) =>
  API.get(`/api/restaurants/${restaurantId}/customers/search`, { params: { query } });

// ── BILLING (NEW ENDPOINTS) ──────────────────────────────────────────────
export const createBill = (restaurantId, data) =>
  API.post(`/api/restaurants/${restaurantId}/billing`, data);

export const getBill = (restaurantId, billId) =>
  API.get(`/api/restaurants/${restaurantId}/billing/${billId}`);

export const getBills = (restaurantId, params) =>
  API.get(`/api/restaurants/${restaurantId}/billing`, { params });

export const settleBillPayment = (restaurantId, billId, data) =>
  API.post(`/api/restaurants/${restaurantId}/billing/${billId}/settle`, data);

// ── DAILY SALES SUMMARY ──────────────────────────────────────────────────
export const getDailySalesSummary = (restaurantId, date) =>
  API.get(`/api/restaurants/${restaurantId}/daily-sales-summary/${date}`);

export const getDailySalesSummaryRange = (restaurantId, startDate, endDate) =>
  API.get(`/api/restaurants/${restaurantId}/daily-sales-summary/range`, {
    params: { startDate, endDate }
  });

export const generateDailySalesSummary = (restaurantId, date) =>
  API.post(`/api/restaurants/${restaurantId}/daily-sales-summary/generate/${date}`);

// ── REPORTS & ANALYTICS ──────────────────────────────────────────────────
export const getDailySalesReport = (restaurantId, date) =>
  API.get(`/api/restaurants/${restaurantId}/reports/daily-sales/${date}`);

export const getMonthlySalesReport = (restaurantId, month, year) =>
  API.get(`/api/restaurants/${restaurantId}/reports/monthly-sales/${month}/${year}`);

export const getItemSalesReport = (restaurantId, startDate, endDate) =>
  API.get(`/api/restaurants/${restaurantId}/reports/item-sales`, {
    params: { startDate, endDate }
  });

export const getCategorySalesReport = (restaurantId, startDate, endDate) =>
  API.get(`/api/restaurants/${restaurantId}/reports/category-sales`, {
    params: { startDate, endDate }
  });

export const getPaymentMethodReport = (restaurantId, startDate, endDate) =>
  API.get(`/api/restaurants/${restaurantId}/reports/payment-methods`, {
    params: { startDate, endDate }
  });

export const getGSTReport = (restaurantId, month, year) =>
  API.get(`/api/restaurants/${restaurantId}/reports/gst/${month}/${year}`);

export const getTopCustomersReport = (restaurantId, startDate, endDate, limit = 10) =>
  API.get(`/api/restaurants/${restaurantId}/reports/top-customers`, {
    params: { startDate, endDate, limit }
  });

export const getHourlyAnalysisReport = (restaurantId, date) =>
  API.get(`/api/restaurants/${restaurantId}/reports/hourly-analysis/${date}`);

export const getComparativeReport = (restaurantId, period, startDate, endDate) =>
  API.get(`/api/restaurants/${restaurantId}/reports/comparative/${period}`, {
    params: { startDate, endDate }
  });

export const exportReportPDF = (restaurantId, reportType, params) =>
  API.get(`/api/restaurants/${restaurantId}/reports/export/pdf`, {
    params: { reportType, ...params },
    responseType: 'blob'
  });

export const exportReportExcel = (restaurantId, reportType, params) =>
  API.get(`/api/restaurants/${restaurantId}/reports/export/excel`, {
    params: { reportType, ...params },
    responseType: 'blob'
  });

// ── AUDIT LOGS ───────────────────────────────────────────────────────────
export const getAuditLogs = (restaurantId, params) =>
  API.get(`/api/restaurants/${restaurantId}/audit-logs`, { params });

export const getAuditLogsByEntity = (restaurantId, entityType, entityId) =>
  API.get(`/api/restaurants/${restaurantId}/audit-logs/entity/${entityType}/${entityId}`);

// ── ADMIN REPORTS ─────────────────────────────────────────────────────────────
export const getTodayStats = () =>
  API.get('/api/admin/today-stats');

export const getTopItems = (limit = 10) =>
  API.get(`/api/admin/top-items?limit=${limit}`);

export const getWeeklyRevenue = () =>
  API.get('/api/admin/weekly-revenue');

export const getRevenueByRange = (from, to) =>
  API.get(`/api/admin/revenue?from=${from}&to=${to}`);

// ── (ADDED) Client helpers, extra endpoints and WebSocket factory ──────────────

// Set auth token programmatically (useful after login/registration)
export const setAuthToken = (token) => {
  if (token) {
    sessionStorage.setItem('token', token);
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
};

// Clear auth token (logout helper)
export const clearAuthToken = () => {
  sessionStorage.removeItem('token');
  delete API.defaults.headers.common.Authorization;
};

// Simple retry wrapper for transient network errors
export const requestWithRetry = async (fn, retries = 2, backoffMs = 300) => {
  try {
    return await fn();
  } catch (err) {
    const shouldRetry = !err.response; // network errors only
    if (!shouldRetry || retries <= 0) throw err;
    await new Promise((res) => setTimeout(res, backoffMs));
    return requestWithRetry(fn, retries - 1, backoffMs * 2);
  }
};

// ── RESERVATIONS ───────────────────────────────────────────────────────────────
export const getReservations = (params) =>
  API.get('/api/reservations', { params });

export const getReservation = (id) =>
  API.get(`/api/reservations/${id}`);

export const createReservation = (data) =>
  API.post('/api/reservations', data);

export const updateReservation = (id, data) =>
  API.put(`/api/reservations/${id}`, data);

export const cancelReservation = (id) =>
  API.post(`/api/reservations/${id}/cancel`);

// ── SPLIT BILL ─────────────────────────────────────────────────────────────────
export const splitBill = (restaurantId, billId, data) =>
  API.post(`/api/restaurants/${restaurantId}/billing/${billId}/split`, data);

export const getSplitBill = (restaurantId, splitId) =>
  API.get(`/api/restaurants/${restaurantId}/billing/splits/${splitId}`);

export const listSplitBills = (restaurantId, params) =>
  API.get(`/api/restaurants/${restaurantId}/billing/splits`, { params });

// ── SETTINGS / TAX CONFIG ─────────────────────────────────────────────────────
export const getTaxConfig = (restaurantId) =>
  API.get(`/api/restaurants/${restaurantId}/settings/tax`);

export const updateTaxConfig = (restaurantId, data) =>
  API.put(`/api/restaurants/${restaurantId}/settings/tax`, data);

// ── WEBSOCKET FACTORY ─────────────────────────────────────────────────────────
export const createWebSocket = (path = '') => {
  const rawWs = process.env.REACT_APP_WS_URL || `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`;
  try {
    const token = sessionStorage.getItem('token');
    const url = new URL(rawWs);
    if (path) url.pathname = (url.pathname.replace(/\/$/, '') + '/' + path.replace(/^\//, ''));
    if (token) url.searchParams.set('token', token);
    return new WebSocket(url.toString());
  } catch (e) {
    // Fallback: return a WebSocket that will error (caller should handle)
    return new WebSocket(rawWs);
  }
};

// ── BLOB DOWNLOAD HELPER ──────────────────────────────────────────────────────
export const downloadBlob = (blob, filename = 'download.bin') => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

// Default export kept for backward-compatibility with existing pages
export default API;