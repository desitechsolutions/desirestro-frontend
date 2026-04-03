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
  LOYALTY_PROGRAM: true,
  QR_ORDERING: false,
  DARK_MODE: false,
  MULTI_LANGUAGE: true,
  AUDIT_LOGGING: true,
  WEBSOCKET: true,
};

// Spice Levels
export const SPICE_LEVELS = {
  MILD: { value: 'MILD', label: '🌶️ Mild', level: 1 },
  MEDIUM: { value: 'MEDIUM', label: '🌶️🌶️ Medium', level: 2 },
  HOT: { value: 'HOT', label: '🌶️🌶️🌶️ Hot', level: 3 },
  EXTRA_HOT: { value: 'EXTRA_HOT', label: '🌶️🌶️🌶️🌶️ Extra Hot', level: 4 },
};

// Dietary Options
export const DIETARY_OPTIONS = {
  JAIN: { value: 'JAIN', label: '🌱 Jain', icon: '🌾' },
  SWAMINARAYAN: { value: 'SWAMINARAYAN', label: '📿 Swaminarayan', icon: '🙏' },
  VEG: { value: 'VEG', label: '🥬 Vegetarian', icon: '🥦' },
  NON_VEG: { value: 'NON_VEG', label: '🍗 Non-Vegetarian', icon: '🍖' },
};

// Reservation Status
export const RESERVATION_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CHECKED_IN: 'CHECKED_IN',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

// Discount Types
export const DISCOUNT_TYPES = {
  PERCENTAGE: 'PERCENTAGE',
  FLAT_AMOUNT: 'FLAT_AMOUNT',
  ITEM_LEVEL: 'ITEM_LEVEL',
  COUPON: 'COUPON',
};

// Order Status Extended
export const ORDER_STATUS_EXTENDED = {
  ...ORDER_STATUS,
  HOLD: 'HOLD',
  URGENT: 'URGENT',
  PAUSED: 'PAUSED',
};

// Audit Actions
export const AUDIT_ACTIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  VIEW: 'VIEW',
  EXPORT: 'EXPORT',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  PAY_BILL: 'PAY_BILL',
  VOID_BILL: 'VOID_BILL',
  MODIFY_ORDER: 'MODIFY_ORDER',
};

// Audit Entity Types
export const AUDIT_ENTITY_TYPES = {
  CUSTOMER: 'CUSTOMER',
  BILL: 'BILL',
  KOT: 'KOT',
  ORDER: 'ORDER',
  MENU_ITEM: 'MENU_ITEM',
  STAFF: 'STAFF',
  TABLE: 'TABLE',
  PARTY: 'PARTY',
  PAYMENT: 'PAYMENT',
  RESERVATION: 'RESERVATION',
};

// Order Types
export const ORDER_TYPES = {
  DINE_IN: { value: 'DINE_IN', label: 'Dine In', icon: '🪑' },
  TAKEAWAY: { value: 'TAKEAWAY', label: 'Takeaway', icon: '🛍️' },
  DELIVERY: { value: 'DELIVERY', label: 'Delivery', icon: '🚗' },
  PARCEL: { value: 'PARCEL', label: 'Parcel', icon: '📦' },
};

// Ticket Status
export const TICKET_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REOPEN: 'REOPEN',
};

// Ticket Priority
export const TICKET_PRIORITY = {
  LOW: { value: 'LOW', label: 'Low', color: 'bg-blue-500' },
  MEDIUM: { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-500' },
  HIGH: { value: 'HIGH', label: 'High', color: 'bg-orange-500' },
  CRITICAL: { value: 'CRITICAL', label: 'Critical', color: 'bg-red-500' },
};

// Loyalty Redemption Options
export const LOYALTY_REDEMPTION = {
  CASH_DISCOUNT: 1, // 1 point = ₹1 discount
  COMPLIMENTARY_ITEM: 100, // 100 points for 1 item
  COMBO_DISCOUNT: 50, // 50 points for combo discount
};

// GST Configuration per State
export const GST_BY_STATE = {
  // Default rates
  DEFAULT: {
    CGST_RATE: 0.09,
    SGST_RATE: 0.09,
    IGST_RATE: 0.18,
  },
  // Can be extended for specific states
};

// Service Charge Configuration
export const SERVICE_CHARGE_CONFIG = {
  DEFAULT_RATE: 0.10, // 10%
  APPLICABLE_BILL_VALUE: 500, // Min bill value to apply
  APPLICABLE_FOR_DINE_IN: true,
  NOT_APPLICABLE_FOR_TAKEAWAY: true,
};

// Packaging Charge
export const PACKAGING_CHARGE_CONFIG = {
  SMALL: 10, // ₹ for small items
  MEDIUM: 20, // ₹ for medium items
  LARGE: 30, // ₹ for large items
};

// Delivery Charge
export const DELIVERY_CHARGE_CONFIG = {
  WITHIN_2KM: 40,
  WITHIN_5KM: 80,
  BEYOND_5KM: 100,
  FREE_DELIVERY_ABOVE: 500, // Free delivery above this amount
};

// API Endpoint Timeouts
export const API_TIMEOUTS = {
  DEFAULT: 30000,
  FILE_UPLOAD: 60000,
  REPORT_EXPORT: 120000,
  SEARCH: 10000,
  POLLING: 5000,
};

// Pagination
export const PAGINATION = {
  ITEMS_PER_PAGE: 20,
  ITEMS_PER_PAGE_SMALL: 10,
  ITEMS_PER_PAGE_LARGE: 50,
};

// Report Types
export const REPORT_TYPES = {
  DAILY_SALES: 'DAILY_SALES',
  MONTHLY_SALES: 'MONTHLY_SALES',
  ITEM_WISE: 'ITEM_WISE',
  CATEGORY_WISE: 'CATEGORY_WISE',
  PAYMENT_METHOD: 'PAYMENT_METHOD',
  GST_REPORT: 'GST_REPORT',
  CUSTOMER_ANALYTICS: 'CUSTOMER_ANALYTICS',
  STAFF_PERFORMANCE: 'STAFF_PERFORMANCE',
};

// Export Formats
export const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'xlsx',
  CSV: 'csv',
  JSON: 'json',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  KOT_READY: 'KOT_READY',
  BILL_PAYMENT: 'BILL_PAYMENT',
  CUSTOMER_ARRIVED: 'CUSTOMER_ARRIVED',
  RESERVATION_REMINDER: 'RESERVATION_REMINDER',
  STOCK_LOW: 'STOCK_LOW',
  SUPPORT_TICKET: 'SUPPORT_TICKET',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
};

const constants = {
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
  SPICE_LEVELS,
  DIETARY_OPTIONS,
  RESERVATION_STATUS,
  DISCOUNT_TYPES,
  ORDER_STATUS_EXTENDED,
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
  ORDER_TYPES,
  TICKET_STATUS,
  TICKET_PRIORITY,
  LOYALTY_REDEMPTION,
  GST_BY_STATE,
  SERVICE_CHARGE_CONFIG,
  PACKAGING_CHARGE_CONFIG,
  DELIVERY_CHARGE_CONFIG,
  API_TIMEOUTS,
  PAGINATION,
  REPORT_TYPES,
  EXPORT_FORMATS,
  NOTIFICATION_TYPES,
};

export default constants;

// Made with Bob
