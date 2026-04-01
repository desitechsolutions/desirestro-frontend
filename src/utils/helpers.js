// src/utils/helpers.js

import { ERROR_MESSAGES, VALIDATION } from './constants';

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default: ₹)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = '₹') => {
  if (typeof amount !== 'number' || isNaN(amount)) return `${currency}0.00`;
  return `${currency}${amount.toFixed(2)}`;
};

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {boolean} includeTime - Include time in format
 * @returns {string} Formatted date string
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
  
  return d.toLocaleString('en-IN', options);
};

/**
 * Format time for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted time string
 */
export const formatTime = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  return VALIDATION.EMAIL_REGEX.test(email);
};

/**
 * Validate phone number
 * @param {string} phone - Phone to validate
 * @returns {boolean} True if valid
 */
export const isValidPhone = (phone) => {
  return VALIDATION.PHONE_REGEX.test(phone);
};

/**
 * Validate GSTIN
 * @param {string} gstin - GSTIN to validate
 * @returns {boolean} True if valid
 */
export const isValidGSTIN = (gstin) => {
  return VALIDATION.GSTIN_REGEX.test(gstin);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with isValid and message
 */
export const validatePassword = (password) => {
  if (!password || password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      message: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`,
    };
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return {
      isValid: false,
      message: 'Password must contain uppercase, lowercase, and numbers',
    };
  }
  
  return { isValid: true, message: 'Strong password' };
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Get error message from error object
 * @param {Error|object} error - Error object
 * @returns {string} Error message
 */
export const getErrorMessage = (error) => {
  if (!error) return ERROR_MESSAGES.UNKNOWN_ERROR;
  
  // Axios error
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    // Check for custom message in response
    if (data?.message) return data.message;
    if (data?.data?.message) return data.data.message;
    
    // Default messages by status code
    switch (status) {
      case 400:
        return ERROR_MESSAGES.VALIDATION_ERROR;
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.FORBIDDEN;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 500:
      case 502:
      case 503:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }
  
  // Network error
  if (error.request) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  // Other errors
  return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
};

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage (0-100)
 */
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.min(Math.round((value / total) * 100), 100);
};

/**
 * Generate random ID
 * @returns {string} Random ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Deep clone object
 * @param {object} obj - Object to clone
 * @returns {object} Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 * @param {object} obj - Object to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (obj) => {
  if (!obj) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return !obj;
};

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Format table status for display
 * @param {string} status - Table status
 * @returns {string} Formatted status
 */
export const formatTableStatus = (status) => {
  if (!status) return '';
  return status.replace(/_/g, ' ');
};

/**
 * Calculate GST breakdown
 * @param {number} subtotal - Subtotal amount
 * @param {number} gstRate - GST rate (default: 0.18)
 * @returns {object} GST breakdown
 */
export const calculateGST = (subtotal, gstRate = 0.18) => {
  const gstAmount = subtotal * gstRate;
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;
  const total = subtotal + gstAmount;
  
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    cgst: parseFloat(cgst.toFixed(2)),
    sgst: parseFloat(sgst.toFixed(2)),
    gstAmount: parseFloat(gstAmount.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };
};

/**
 * Calculate bill with taxes and service charge
 * @param {number} subtotal - Subtotal amount
 * @param {object} options - Tax options
 * @returns {object} Bill breakdown
 */
export const calculateBill = (subtotal, options = {}) => {
  const {
    gstRate = 0.18,
    serviceChargeRate = 0,
    discount = 0,
    discountType = 'AMOUNT', // 'AMOUNT' or 'PERCENTAGE'
  } = options;
  
  // Calculate discount
  let discountAmount = 0;
  if (discountType === 'PERCENTAGE') {
    discountAmount = subtotal * (discount / 100);
  } else {
    discountAmount = discount;
  }
  
  const afterDiscount = subtotal - discountAmount;
  
  // Calculate service charge
  const serviceCharge = afterDiscount * serviceChargeRate;
  const afterServiceCharge = afterDiscount + serviceCharge;
  
  // Calculate GST
  const gstAmount = afterServiceCharge * gstRate;
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;
  
  const total = afterServiceCharge + gstAmount;
  
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    discount: parseFloat(discountAmount.toFixed(2)),
    afterDiscount: parseFloat(afterDiscount.toFixed(2)),
    serviceCharge: parseFloat(serviceCharge.toFixed(2)),
    cgst: parseFloat(cgst.toFixed(2)),
    sgst: parseFloat(sgst.toFixed(2)),
    gstAmount: parseFloat(gstAmount.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    roundedTotal: Math.round(total),
  };
};

/**
 * Group array by key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {object} Grouped object
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

/**
 * Sort array by key
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted array
 */
export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Retry async function
 * @param {Function} fn - Async function to retry
 * @param {number} retries - Number of retries
 * @param {number} delay - Delay between retries (ms)
 * @returns {Promise} Result of function
 */
export const retryAsync = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryAsync(fn, retries - 1, delay * 2); // Exponential backoff
  }
};

/**
 * Safe JSON parse
 * @param {string} str - String to parse
 * @param {any} fallback - Fallback value
 * @returns {any} Parsed value or fallback
 */
export const safeJsonParse = (str, fallback = null) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

/**
 * Download data as file
 * @param {string} data - Data to download
 * @param {string} filename - Filename
 * @param {string} type - MIME type
 */
export const downloadFile = (data, filename, type = 'text/plain') => {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
};

export default {
  formatCurrency,
  formatDate,
  formatTime,
  isValidEmail,
  isValidPhone,
  isValidGSTIN,
  validatePassword,
  debounce,
  throttle,
  getErrorMessage,
  calculatePercentage,
  generateId,
  deepClone,
  isEmpty,
  capitalize,
  formatTableStatus,
  calculateGST,
  calculateBill,
  groupBy,
  sortBy,
  retryAsync,
  safeJsonParse,
  downloadFile,
  copyToClipboard,
};

// Made with Bob
