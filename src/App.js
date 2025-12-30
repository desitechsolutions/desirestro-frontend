import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import CaptainHome from './pages/CaptainHome';
import KitchenKOT from './pages/KitchenKOT';
import CashierBilling from './pages/CashierBilling';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tables"
            element={
              <ProtectedRoute allowedRoles={['CAPTAIN']}>
                <CaptainHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kot"
            element={
              <ProtectedRoute allowedRoles={['KITCHEN']}>
                <KitchenKOT />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <ProtectedRoute allowedRoles={['CASHIER']}>
                <CashierBilling />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;