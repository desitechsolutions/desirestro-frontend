# DesiRestro - Implementation Guide

This guide provides step-by-step instructions for implementing the enhancements to make DesiRestro fully operational.

---

## 📦 Phase 1: Install Required Dependencies

Since PowerShell script execution is disabled, you'll need to install packages manually:

### Option 1: Using Command Prompt (cmd)
```cmd
npm install react-hot-toast dompurify zustand
```

### Option 2: Enable PowerShell Scripts (Run as Administrator)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Then run:
```powershell
npm install react-hot-toast dompurify zustand
```

### Option 3: Use package.json
Add these to your `package.json` dependencies and run `npm install`:
```json
{
  "dependencies": {
    "react-hot-toast": "^2.4.1",
    "dompurify": "^3.0.6",
    "zustand": "^4.4.7"
  }
}
```

---

## ✅ What Has Been Implemented

### 1. Core Utilities & Constants ✓
- **`src/utils/constants.js`** - Centralized configuration
- **`src/utils/helpers.js`** - 30+ utility functions
- **`src/hooks/useConfirm.js`** - Confirmation dialog hook

### 2. Common Components ✓
- **`src/components/common/ErrorBoundary.js`** - Global error handling
- **`src/components/common/Toast.js`** - Toast notification system (no dependencies)
- **`src/components/common/LoadingSpinner.js`** - Loading indicators
- **`src/components/common/ConfirmDialog.js`** - Confirmation dialogs

### 3. Enhanced App Structure ✓
- **`src/App.js`** - Updated with ErrorBoundary and ToastProvider
- **`src/index.css`** - Enhanced with animations and utilities

---

## 🚀 Next Steps to Complete Implementation

### Step 1: Update API Service with Better Error Handling

Create `src/services/enhancedApi.js`:

```javascript
import axios from 'axios';
import { API_CONFIG, ERROR_MESSAGES } from '../utils/constants';
import { getErrorMessage, retryAsync } from '../utils/helpers';

const API = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true,
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with retry logic
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 with refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await API.post('/api/auth/refresh');
        const newToken = res.data?.data?.token;
        if (newToken) {
          sessionStorage.setItem('token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return API(originalRequest);
        }
      } catch (refreshError) {
        sessionStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
```

### Step 2: Create Enhanced Login with Toast Notifications

Update `src/pages/Login.js` to use toast instead of alerts:

```javascript
import { useToast } from '../components/common/Toast';
import { getErrorMessage } from '../utils/helpers';

// Inside component:
const toast = useToast();

// Replace alert() calls:
toast.error(getErrorMessage(err));
toast.success('Login successful!');
```

### Step 3: Add Split Bill Feature

Create `src/components/billing/SplitBillModal.js`:

```javascript
import React, { useState } from 'react';
import { calculateBill } from '../utils/helpers';

const SplitBillModal = ({ bill, onClose, onSplit }) => {
  const [splitType, setSplitType] = useState('EQUAL'); // EQUAL, CUSTOM, ITEMS
  const [splits, setSplits] = useState([]);
  
  // Implementation here
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      {/* Split bill UI */}
    </div>
  );
};

export default SplitBillModal;
```

### Step 4: Add Tax Configuration

Create `src/pages/admin/TaxConfiguration.js`:

```javascript
import React, { useState, useEffect } from 'react';
import { TAX_CONFIG } from '../../utils/constants';

const TaxConfiguration = () => {
  const [taxSettings, setTaxSettings] = useState({
    gstRate: TAX_CONFIG.GST_RATE,
    cgstRate: TAX_CONFIG.CGST_RATE,
    sgstRate: TAX_CONFIG.SGST_RATE,
    serviceChargeRate: TAX_CONFIG.SERVICE_CHARGE_RATE,
  });
  
  // Implementation here
};

export default TaxConfiguration;
```

### Step 5: Implement WebSocket for Real-time Updates

Create `src/services/websocket.js`:

```javascript
import { useEffect, useRef } from 'react';

export const useWebSocket = (url, onMessage) => {
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      // Implement reconnection logic
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url, onMessage]);

  const sendMessage = (message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return { sendMessage };
};
```

### Step 6: Add Input Sanitization

Update components to sanitize user input:

```javascript
import DOMPurify from 'dompurify';

// When rendering user-generated content:
<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(userContent) 
}} />

// Or sanitize before sending to API:
const sanitizedData = {
  ...data,
  description: DOMPurify.sanitize(data.description),
};
```

### Step 7: Replace window.confirm() with ConfirmDialog

Example usage in any component:

```javascript
import { useState } from 'react';
import ConfirmDialog from '../components/common/ConfirmDialog';

const MyComponent = () => {
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  const handleDelete = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item?',
      type: 'danger',
      onConfirm: async () => {
        // Perform delete
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      },
    });
  };

  return (
    <>
      {/* Your component */}
      <ConfirmDialog
        {...confirmDialog}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
    </>
  );
};
```

### Step 8: Add Loading States

Replace loading checks with LoadingSpinner:

```javascript
import LoadingSpinner from '../components/common/LoadingSpinner';

// In component:
if (loading) {
  return <LoadingSpinner fullScreen message="Loading data..." />;
}
```

---

## 🔧 Configuration Updates Needed

### 1. Environment Variables

Create `.env` file:

```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_WS_URL=ws://localhost:8080/ws
REACT_APP_ENV=development
```

### 2. Update package.json Scripts

Add useful scripts:

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "test:coverage": "react-scripts test --coverage --watchAll=false",
    "lint": "eslint src/**/*.{js,jsx}",
    "format": "prettier --write src/**/*.{js,jsx,css,md}"
  }
}
```

---

## 📝 Usage Examples

### Using Toast Notifications

```javascript
import { useToast } from '../components/common/Toast';

const MyComponent = () => {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Operation completed successfully!');
  };

  const handleError = () => {
    toast.error('Something went wrong!');
  };

  const handleWarning = () => {
    toast.warning('Please review your input.');
  };

  const handleInfo = () => {
    toast.info('New update available.');
  };
};
```

### Using Helper Functions

```javascript
import { 
  formatCurrency, 
  formatDate, 
  calculateBill,
  getErrorMessage 
} from '../utils/helpers';

// Format currency
const price = formatCurrency(1234.56); // ₹1234.56

// Format date
const date = formatDate(new Date()); // 01/04/2026

// Calculate bill with taxes
const bill = calculateBill(1000, {
  gstRate: 0.18,
  serviceChargeRate: 0.10,
  discount: 50,
  discountType: 'AMOUNT'
});
// Returns: { subtotal, discount, cgst, sgst, total, etc. }

// Get error message
try {
  await api.call();
} catch (error) {
  const message = getErrorMessage(error);
  toast.error(message);
}
```

### Using Constants

```javascript
import { 
  PAYMENT_METHODS, 
  TABLE_STATUS, 
  VALIDATION 
} from '../utils/constants';

// Payment methods
Object.values(PAYMENT_METHODS).map(method => (
  <button className={method.color}>
    {method.label}
  </button>
));

// Validation
if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
  toast.error('Password too short');
}
```

---

## 🧪 Testing Checklist

After implementation, test these scenarios:

### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Token refresh on 401
- [ ] Logout functionality
- [ ] Session timeout

### Error Handling
- [ ] Network error handling
- [ ] Server error (500) handling
- [ ] Validation error display
- [ ] Toast notifications appear
- [ ] Error boundary catches errors

### UI/UX
- [ ] Loading spinners show during API calls
- [ ] Confirmation dialogs work
- [ ] Toast notifications are readable
- [ ] Responsive design works
- [ ] Keyboard navigation works

### Features
- [ ] Create/Read/Update/Delete operations
- [ ] Real-time updates (if WebSocket implemented)
- [ ] Bill calculation with taxes
- [ ] Split bill functionality
- [ ] Print functionality

---

## 🐛 Common Issues & Solutions

### Issue 1: Toast not showing
**Solution:** Ensure ToastProvider wraps your app in App.js

### Issue 2: Constants not found
**Solution:** Check import path: `import { CONSTANT } from '../utils/constants'`

### Issue 3: Helpers not working
**Solution:** Verify helper function is exported in helpers.js

### Issue 4: Styles not applying
**Solution:** Ensure Tailwind is configured and index.css is imported

---

## 📚 Additional Resources

### Recommended Reading
- React Error Boundaries: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
- Axios Interceptors: https://axios-http.com/docs/interceptors
- WebSocket API: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

### Tools to Install
- ESLint for code quality
- Prettier for code formatting
- React DevTools browser extension
- Redux DevTools (if using Redux)

---

## 🎯 Priority Implementation Order

1. **Critical (Do First)**
   - Install dependencies
   - Update all components to use Toast instead of alert()
   - Add LoadingSpinner to all async operations
   - Implement ConfirmDialog for destructive actions

2. **High Priority (Do Next)**
   - Add input sanitization with DOMPurify
   - Implement split bill feature
   - Add tax configuration
   - Replace polling with WebSockets

3. **Medium Priority**
   - Add comprehensive error handling
   - Implement audit logging
   - Add advanced reporting
   - Customer management

4. **Low Priority**
   - Dark mode
   - Multi-language support
   - Advanced analytics
   - Mobile app

---

## 💡 Best Practices

1. **Always use constants** instead of magic numbers
2. **Always sanitize user input** before rendering
3. **Always show loading states** during async operations
4. **Always handle errors gracefully** with user-friendly messages
5. **Always confirm destructive actions** with ConfirmDialog
6. **Always use helper functions** for common operations
7. **Always test on multiple browsers** and devices

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Error tracking service integrated (e.g., Sentry)
- [ ] Analytics configured (e.g., Google Analytics)
- [ ] Security audit completed
- [ ] Performance optimization done
- [ ] Cross-browser testing completed
- [ ] Mobile responsiveness verified
- [ ] Accessibility audit passed
- [ ] Documentation updated
- [ ] Backup strategy in place
- [ ] Monitoring and logging configured

---

**Last Updated:** April 1, 2026  
**Version:** 1.0  
**Maintainer:** Development Team