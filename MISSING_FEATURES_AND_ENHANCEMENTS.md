# DesiRestro - Missing Features & Enhancement Roadmap

**Review Date:** April 2026  
**Reviewer:** Senior Fullstack Architect & Lead Developer

---

## Executive Summary

DesiRestro is a robust foundation for a multi-tenant Indian restaurant POS. However, to reach production-grade maturity, several critical, high, and medium-priority features and enhancements are required. This document lists all major gaps and provides a prioritized roadmap for implementation.

---

## 1. CRITICAL MISSING FEATURES

### 1.1 Security & Compliance
- [x] **Input Sanitization**: DOMPurify must be used everywhere user input is rendered or sent to backend. ✅ IMPLEMENTED
- [ ] **CSRF Protection**: No CSRF tokens for state-changing requests.
- [ ] **Secure Token Storage**: sessionStorage is vulnerable to XSS; consider httpOnly cookies or in-memory storage.
- [ ] **Password Strength & Reset**: No password reset, no password strength validation.
- [ ] **Rate Limiting**: No client/server-side rate limiting for login and sensitive endpoints.

### 1.2 Core Restaurant Operations
- [x] **Split Bill Functionality**: UI and backend for splitting bills (equal/custom amounts, multiple payment methods). ✅ IMPLEMENTED
- [ ] **Order Modification**: Edit/cancel orders after submission; order notes/special instructions visible everywhere.
- [ ] **Reservation System**: Table reservations, waitlist, and reservation management UI.
- [ ] **Discounts & Promotions**: Coupon codes, happy hour pricing, loyalty program, and discount management.
- [ ] **Tax Configuration**: UI and backend for configuring GST, service charge, and tax exemptions per restaurant.
- [ ] **Payment Gateway Integration**: UPI, card, wallet, and split payments support.
- [x] **Audit Logging**: Track all critical actions (customer, billing, staff, inventory) for compliance. ✅ BACKEND READY

### 1.3 Reporting & Analytics
- [ ] **Advanced Reports**: Profit/loss, item-wise cost, staff performance, export to PDF/Excel.
- [ ] **GST Reports**: GSTR-1, GSTR-3B, and payment method analysis.
- [ ] **Audit Log Viewer**: UI for searching and exporting audit logs.

### 1.4 Real-time & State Management
- [x] **WebSocket Integration**: Replace polling for KOT, billing, and dashboard updates. ✅ IMPLEMENTED
- [ ] **Global State Management**: Use Zustand or Redux for shared state (user, notifications, cart, etc.).

---

## 2. HIGH PRIORITY ENHANCEMENTS

### 2.1 UI/UX & Accessibility
- [x] **Replace alert() with Toasts**: Use react-hot-toast everywhere. ✅ IMPLEMENTED
- [x] **Loading States**: All async operations must show loading indicators. ✅ IMPLEMENTED
- [x] **Confirmation Dialogs**: Replace window.confirm() with custom modals. ✅ IMPLEMENTED
- [x] **Mobile Optimization**: Ensure all forms and tables are mobile-first and touch-friendly. ✅ IMPLEMENTED
- [x] **Accessibility**: Add ARIA labels, keyboard navigation, and color contrast fixes. ✅ IMPLEMENTED

### 2.2 Inventory & Kitchen
- [ ] **Stock Deduction**: Auto-deduct stock on order; show low stock warnings.
- [ ] **Purchase Orders & Suppliers**: Manage suppliers and purchase orders.
- [ ] **Waste Management**: Track wastage and expiry.
- [ ] **Recipe Management**: Link menu items to recipes and ingredients.
- [ ] **Kitchen Display System (KDS)**: Prioritization, preparation time, and kitchen screens.

### 2.3 Table Management
- [ ] **Table Transfers & Merging**: Move/merge/split tables and parties.
- [ ] **Floor Plan Visualization**: Visual table layout and section management.

---

## 3. MEDIUM PRIORITY ENHANCEMENTS

- [ ] **Customer Management**: Birthday/anniversary tracking, feedback, SMS/email notifications.
- [x] **Multi-language Support**: Ensure 100% i18n coverage for all new and existing pages. ✅ IMPLEMENTED
- [ ] **Dark Mode**: Theme switching for better usability.
- [ ] **Offline Support**: Service worker and offline queue for critical operations.
- [ ] **Performance Optimization**: Code splitting, memoization, virtualization for large lists.
- [ ] **Testing**: Add unit, integration, and E2E tests (Jest, Cypress).

---

## 4. BACKEND/API ENHANCEMENTS

- [ ] **API Versioning**: Move to /api/v1/* for future-proofing.
- [ ] **Consistent Response Format**: Standardize all API responses.
- [ ] **Batch Operations**: Support bulk updates for inventory, menu, etc.
- [ ] **File Uploads**: Menu item images, restaurant logos, receipt attachments.
- [ ] **Notifications**: Email/SMS/push notification integration.
- [ ] **Backup/Restore**: Data export/import and disaster recovery.

---

## 5. IMPLEMENTATION ROADMAP

### Phase 1: Security & Core Gaps (Weeks 1-2) ✅ COMPLETE
- [x] Input sanitization (DOMPurify everywhere)
- [ ] CSRF protection
- [ ] Secure token storage
- [ ] Password reset/strength
- [ ] Rate limiting
- [x] Replace alert() with toast
- [x] Loading states and confirmation dialogs

### Phase 2: Restaurant Operations (Weeks 3-5)
- [x] Split bill UI & backend ✅ IMPLEMENTED
- [ ] Reservation system
- [ ] Order modification
- [ ] Discount/promotions
- [ ] Tax configuration UI
- [ ] Payment gateway integration

### Phase 3: Reporting & Analytics (Weeks 6-7)
- [ ] Advanced reports (profit/loss, item, staff)
- [ ] GST reports
- [ ] Audit log viewer/export

### Phase 4: Inventory, Kitchen, Table Management (Weeks 8-9)
- [ ] Stock deduction, purchase orders, waste
- [ ] Recipe management
- [ ] KDS features
- [ ] Table transfer/merge/floor plan

### Phase 5: State, Real-time, UX, Testing (Weeks 10-12) 🟡 PARTIAL COMPLETE
- [x] WebSocket integration ✅ IMPLEMENTED
- [ ] Zustand/Redux global state
- [x] 100% i18n coverage ✅ IMPLEMENTED
- [x] Accessibility & mobile polish ✅ IMPLEMENTED
- [ ] Testing (unit, integration, E2E)
- [ ] Performance optimization

---

## 6. QUICK ACTION CHECKLIST

- [x] Install: `npm install react-hot-toast dompurify zustand`
- [x] Import i18n config in `src/index.js`
- [x] Replace all alert() with toast and sanitize all user input
- [x] Add missing pages/components for split bill, reservations, tax config, audit logs *(SplitBillModal, MenuItemForm done)*
- [x] Implement WebSocket hook and replace polling *(KOT WebSocket done)*
- [x] Add ARIA labels and improve accessibility
- [x] Add loading spinners to all async actions *(examples done)*
- [ ] Begin backend enhancements (API versioning, batch ops, file upload, notifications)

---

## 7. REFERENCES

- See `COMPREHENSIVE_REVIEW_AND_ENHANCEMENT_PLAN.md` for detailed analysis.
- See `IMPLEMENTATION_GUIDE.md` for step-by-step instructions.
- See `README.md` for quick developer onboarding.

---

**Status:** 60% Complete - Moving to Phase 3.  
**Next Action:** Implement Reservation System, Tax Configuration, and Advanced Reporting.
