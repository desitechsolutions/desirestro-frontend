# Phase 4 Priority 2: Frontend Implementation Plan

## Overview
This document outlines the frontend changes needed to integrate with the new ReportService backend.

## Current Status Analysis

### ✅ What's Already Working
1. **SalesDashboard.js** - Basic sales dashboard with:
   - Today's stats (revenue, bills, avg bill, orders)
   - Weekly revenue trend chart
   - Top selling items chart
   - Date range revenue report
   - Uses old API endpoints: `/api/admin/today-stats`, `/api/admin/top-items`, `/api/admin/weekly-revenue`

2. **API Service** - Has basic report endpoints but needs enhancement for new ReportService

3. **Charts** - Already using Recharts library (LineChart, BarChart)

### 🔄 What Needs to Change

#### 1. Update API Service (src/services/api.js)
Add new report endpoints to match backend ReportService:

```javascript
// ── REPORTS & ANALYTICS (NEW) ────────────────────────────────────────────
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

// ── DAILY SALES SUMMARY (EXISTING) ───────────────────────────────────────
export const getDailySalesSummary = (restaurantId, date) =>
  API.get(`/api/restaurants/${restaurantId}/daily-sales-summary/${date}`);

export const getDailySalesSummaryRange = (restaurantId, startDate, endDate) =>
  API.get(`/api/restaurants/${restaurantId}/daily-sales-summary/range`, {
    params: { startDate, endDate }
  });
```

#### 2. Enhance SalesDashboard.js
**Location**: `src/pages/admin/SalesDashboard.js`

**Changes Needed**:
1. Add restaurantId from AuthContext
2. Replace old API calls with new report endpoints
3. Add more comprehensive report sections:
   - GST Summary
   - Payment Method Breakdown
   - Customer Analytics
   - Hourly Sales Pattern
4. Add export functionality (PDF/Excel)
5. Add date range filters for all reports

**New Structure**:
```javascript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getDailySalesReport,
  getMonthlySalesReport,
  getItemSalesReport,
  getPaymentMethodReport,
  getGSTReport,
  exportReportPDF,
  exportReportExcel
} from '../../services/api';

const SalesDashboard = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurantId;
  
  // State for different reports
  const [dailyReport, setDailyReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [itemReport, setItemReport] = useState(null);
  const [gstReport, setGSTReport] = useState(null);
  const [paymentReport, setPaymentReport] = useState(null);
  
  // ... rest of implementation
};
```

#### 3. Create New Report Components

##### a) GSTReportCard.js
**Location**: `src/components/reports/GSTReportCard.js`
**Purpose**: Display GST summary with CGST/SGST/IGST breakdown
**Size**: ~150 lines

```javascript
import React from 'react';

const GSTReportCard = ({ gstReport }) => {
  if (!gstReport) return null;
  
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg">
      <h3 className="text-2xl font-bold mb-6">GST Summary</h3>
      
      {/* Total Tax Liability */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">CGST</p>
          <p className="text-2xl font-bold text-blue-600">
            ₹{gstReport.totalCGST?.toLocaleString()}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">SGST</p>
          <p className="text-2xl font-bold text-green-600">
            ₹{gstReport.totalSGST?.toLocaleString()}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">IGST</p>
          <p className="text-2xl font-bold text-purple-600">
            ₹{gstReport.totalIGST?.toLocaleString()}
          </p>
        </div>
      </div>
      
      {/* B2B vs B2C */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2">B2B Invoices</h4>
          <p className="text-lg">{gstReport.b2bInvoices?.length || 0} invoices</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">B2C Invoices</h4>
          <p className="text-lg">{gstReport.b2cInvoices?.length || 0} invoices</p>
        </div>
      </div>
    </div>
  );
};

export default GSTReportCard;
```

##### b) PaymentMethodChart.js
**Location**: `src/components/reports/PaymentMethodChart.js`
**Purpose**: Display payment method breakdown
**Size**: ~100 lines

```javascript
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

const PaymentMethodChart = ({ paymentReport }) => {
  if (!paymentReport?.paymentMethods) return null;
  
  const data = paymentReport.paymentMethods.map(pm => ({
    name: pm.method,
    value: pm.amount,
    count: pm.count
  }));
  
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg">
      <h3 className="text-2xl font-bold mb-6">Payment Methods</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PaymentMethodChart;
```

##### c) ExportButtons.js
**Location**: `src/components/reports/ExportButtons.js`
**Purpose**: Export reports to PDF/Excel
**Size**: ~80 lines

```javascript
import React, { useState } from 'react';
import { exportReportPDF, exportReportExcel } from '../../services/api';

const ExportButtons = ({ restaurantId, reportType, params }) => {
  const [loading, setLoading] = useState(false);
  
  const handleExport = async (format) => {
    setLoading(true);
    try {
      const exportFn = format === 'pdf' ? exportReportPDF : exportReportExcel;
      const response = await exportFn(restaurantId, reportType, params);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export report');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex gap-4">
      <button
        onClick={() => handleExport('pdf')}
        disabled={loading}
        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
      >
        📄 Export PDF
      </button>
      <button
        onClick={() => handleExport('excel')}
        disabled={loading}
        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        📊 Export Excel
      </button>
    </div>
  );
};

export default ExportButtons;
```

#### 4. Create New Report Pages

##### a) ItemReportsPage.js
**Location**: `src/pages/admin/ItemReportsPage.js`
**Purpose**: Detailed item-wise sales analysis
**Size**: ~250 lines
**Features**:
- Top selling items
- Slow moving items
- Category-wise breakdown
- Date range filter
- Export functionality

##### b) GSTReportPage.js
**Location**: `src/pages/admin/GSTReportPage.js`
**Purpose**: Complete GST compliance report
**Size**: ~300 lines
**Features**:
- GSTR-1 format display
- B2B invoice list
- B2C invoice summary
- HSN-wise summary
- Month/Year selector
- Export to Excel for filing

##### c) CustomerAnalyticsPage.js
**Location**: `src/pages/admin/CustomerAnalyticsPage.js`
**Purpose**: Customer behavior analysis
**Size**: ~200 lines
**Features**:
- Top customers by revenue
- Repeat customer rate
- Average order value by customer
- Customer segmentation
- Loyalty program insights

#### 5. Update App.js Routes
Add new report routes:

```javascript
import ItemReportsPage from './pages/admin/ItemReportsPage';
import GSTReportPage from './pages/admin/GSTReportPage';
import CustomerAnalyticsPage from './pages/admin/CustomerAnalyticsPage';

// Inside Routes:
<Route path="/admin/reports/items" element={
  <ProtectedRoute allowedRoles={['ADMIN', 'OWNER']}>
    <ItemReportsPage />
  </ProtectedRoute>
} />
<Route path="/admin/reports/gst" element={
  <ProtectedRoute allowedRoles={['ADMIN', 'OWNER']}>
    <GSTReportPage />
  </ProtectedRoute>
} />
<Route path="/admin/reports/customers" element={
  <ProtectedRoute allowedRoles={['ADMIN', 'OWNER']}>
    <CustomerAnalyticsPage />
  </ProtectedRoute>
} />
```

#### 6. Update AdminDashboard.js
Add navigation links to new report pages:

```javascript
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <Link to="/admin/reports/sales" className="report-card">
    <h3>📊 Sales Reports</h3>
    <p>Daily, monthly, and comparative analysis</p>
  </Link>
  <Link to="/admin/reports/items" className="report-card">
    <h3>🍽️ Item Reports</h3>
    <p>Top sellers, slow movers, category analysis</p>
  </Link>
  <Link to="/admin/reports/gst" className="report-card">
    <h3>📋 GST Reports</h3>
    <p>GSTR-1 format, tax liability, HSN summary</p>
  </Link>
  <Link to="/admin/reports/customers" className="report-card">
    <h3>👥 Customer Analytics</h3>
    <p>Top customers, retention, behavior analysis</p>
  </Link>
</div>
```

## Implementation Priority

### Phase 1: Core Updates (2-3 hours)
1. ✅ Update API service with new endpoints
2. ✅ Enhance SalesDashboard.js with restaurantId
3. ✅ Create GSTReportCard component
4. ✅ Create PaymentMethodChart component
5. ✅ Create ExportButtons component

### Phase 2: New Pages (3-4 hours)
1. Create ItemReportsPage.js
2. Create GSTReportPage.js
3. Create CustomerAnalyticsPage.js
4. Update App.js with new routes
5. Update AdminDashboard.js with navigation

### Phase 3: Testing & Polish (1-2 hours)
1. Test all report endpoints
2. Test export functionality
3. Verify GST calculations
4. Check mobile responsiveness
5. Add loading states and error handling

## Dependencies Required

### Already Installed
- ✅ recharts (for charts)
- ✅ react-router-dom (for routing)
- ✅ axios (for API calls)

### May Need to Install
```bash
npm install date-fns  # For date formatting
npm install file-saver  # For file downloads (if needed)
```

## File Structure
```
src/
├── components/
│   └── reports/
│       ├── GSTReportCard.js (NEW)
│       ├── PaymentMethodChart.js (NEW)
│       └── ExportButtons.js (NEW)
├── pages/
│   └── admin/
│       ├── SalesDashboard.js (UPDATE)
│       ├── ItemReportsPage.js (NEW)
│       ├── GSTReportPage.js (NEW)
│       └── CustomerAnalyticsPage.js (NEW)
├── services/
│   └── api.js (UPDATE)
└── App.js (UPDATE)
```

## Testing Checklist

### API Integration
- [ ] Daily sales report loads correctly
- [ ] Monthly sales report loads correctly
- [ ] Item sales report with date range works
- [ ] GST report displays correctly
- [ ] Payment method report shows breakdown
- [ ] Export PDF works
- [ ] Export Excel works

### UI/UX
- [ ] All charts render properly
- [ ] Date pickers work correctly
- [ ] Loading states display
- [ ] Error messages show appropriately
- [ ] Mobile responsive on all pages
- [ ] Navigation between reports works

### Data Accuracy
- [ ] GST calculations match backend
- [ ] Payment totals are correct
- [ ] Item quantities match
- [ ] Customer data is accurate
- [ ] Date ranges filter correctly

## Notes

1. **RestaurantId**: All API calls must include restaurantId from AuthContext
2. **Date Formats**: Use ISO format (YYYY-MM-DD) for all date parameters
3. **Error Handling**: Add try-catch blocks and user-friendly error messages
4. **Loading States**: Show spinners during API calls
5. **Export Files**: Handle blob responses correctly for PDF/Excel downloads
6. **GST Compliance**: Ensure GSTR-1 format matches government requirements
7. **Performance**: Consider pagination for large datasets
8. **Caching**: Consider caching report data to reduce API calls

## Success Criteria

✅ All report endpoints integrated
✅ Charts display data correctly
✅ Export functionality works
✅ GST report matches compliance format
✅ Mobile responsive
✅ Error handling in place
✅ Loading states implemented
✅ Navigation between reports smooth
✅ Data accuracy verified
✅ User-friendly interface

## Estimated Total Time: 6-9 hours

This plan provides a clear roadmap for frontend implementation aligned with the backend ReportService.