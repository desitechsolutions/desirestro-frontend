import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ToastProvider } from './components/common/Toast';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import CaptainHome from './pages/CaptainHome';
import KitchenKOT from './pages/KitchenKOT';
import CashierBilling from './pages/CashierBilling';
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Admin Report Pages
import ItemReportsPage from './pages/admin/ItemReportsPage';
import GSTReportPage from './pages/admin/GSTReportPage';
import CustomerAnalyticsPage from './pages/admin/CustomerAnalyticsPage';
import SalesDashboard from './pages/admin/SalesDashboard';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Regular Login */}
              <Route path="/login" element={<Login />} />
              
              {/* Super Admin Routes */}
              <Route path="/superadmin/login" element={<SuperAdminLogin />} />
              <Route
                path="/superadmin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Restaurant Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'OWNER']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin Report Routes */}
              <Route
                path="/admin/reports/sales"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'OWNER']}>
                    <SalesDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports/items"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'OWNER']}>
                    <ItemReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports/gst"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'OWNER']}>
                    <GSTReportPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports/customers"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'OWNER']}>
                    <CustomerAnalyticsPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Captain Routes */}
              <Route
                path="/tables"
                element={
                  <ProtectedRoute allowedRoles={['CAPTAIN']}>
                    <CaptainHome />
                  </ProtectedRoute>
                }
              />
              
              {/* Kitchen Routes */}
              <Route
                path="/kot"
                element={
                  <ProtectedRoute allowedRoles={['KITCHEN']}>
                    <KitchenKOT />
                  </ProtectedRoute>
                }
              />
              
              {/* Cashier Routes */}
              <Route
                path="/billing"
                element={
                  <ProtectedRoute allowedRoles={['CASHIER']}>
                    <CashierBilling />
                  </ProtectedRoute>
                }
              />

              {/* Default Route */}
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;