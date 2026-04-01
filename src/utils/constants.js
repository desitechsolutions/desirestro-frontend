// src/utils/constants.js

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Polling Intervals (in milliseconds)
export const POLLING_INTERVALS = {
  TABLES: 10000,        // 10 seconds
  READY_KOTS: 10000,    // 10 seconds
  ACTIVE_KOTS: 5000,    // 5 seconds
  PENDING_BILLS: 10000, // 10 seconds
};

// Tax Configuration
export const TAX_CONFIG = {
  GST_RATE: 0.18,
  CGST_RATE: 0.09,
  SGST_RATE: 0.09,
  SERVICE_CHARGE_RATE: 0.10,
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  OWNER: 'OWNER',
  CAPTAIN: 'CAPTAIN',
  KITCHEN: 'KITCHEN',
  CASHIER: 'CASHIER',
  STAFF: 'STAFF',
};

// Role Routes Mapping
export const ROLE_ROUTES = {
  [USER_ROLES.ADMIN]: '/admin',
  [USER_ROLES.OWNER]: '/admin',
  [USER_ROLES.CAPTAIN]: '/tables',
  [USER_ROLES.KITCHEN]: '/kot',
  [USER_ROLES.CASHIER]: '/billing',
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: { value: 'CASH', label: '💵 Cash', color: 'bg-green-600 hover:bg-green-700' },
  UPI: { value: 'UPI', label: '📱 UPI', color: 'bg-purple-600 hover:bg-purple-700' },
  CARD: { value: 'CARD', label: '💳 Card', color: 'bg-blue-600 hover:bg-blue-700' },
  WALLET: { value: 'WALLET', label: '👛 Wallet', color: 'bg-orange-600 hover:bg-orange-700' },
};

// Table Status
export const TABLE_STATUS = {
  EMPTY: 'EMPTY',
  PARTIALLY_OCCUPIED: 'PARTIALLY_OCCUPIED',
  FULL: 'FULL',
  RESERVED: 'RESERVED',
};

// Order Status
export const ORDER_STATUS = {
  NEW: 'NEW',
  PREPARING: 'PREPARING',
  READY: 'READY',
  SERVED: 'SERVED',
  CANCELLED: 'CANCELLED',
};

// Party Status
export const PARTY_STATUS = {
  ACTIVE: 'ACTIVE',
  BILLED: 'BILLED',
  CLOSED: 'CLOSED',
};

// Bill Status
export const BILL_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
};

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  PHONE_REGEX: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  GSTIN_REGEX: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
};

// UI Constants
export const UI = {
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 300,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ITEMS_PER_PAGE: 20,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  LOGOUT: 'Logged out successfully.',
  CREATED: 'Created successfully!',
  UPDATED: 'Updated successfully!',
  DELETED: 'Deleted successfully!',
  SAVED: 'Saved successfully!',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  FULL_NAME: 'fullName',
  RESTAURANT_NAME: 'restaurantName',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  DATETIME: 'DD/MM/YYYY HH:mm',
  TIME: 'HH:mm',
};

// Feature Flags (for gradual rollout)
export const FEATURES = {
  SPLIT_BILLS: true,
  RESERVATIONS: false,
  LOYALTY_PROGRAM: false,
  QR_ORDERING: false,
  DARK_MODE: false,
  MULTI_LANGUAGE: false,
};

export default {
  API_CONFIG,
  POLLING_INTERVALS,
  TAX_CONFIG,
  USER_ROLES,
  ROLE_ROUTES,
  PAYMENT_METHODS,
  TABLE_STATUS,
  ORDER_STATUS,
  PARTY_STATUS,
  BILL_STATUS,
  VALIDATION,
  UI,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  DATE_FORMATS,
  FEATURES,
};

// Made with Bob
