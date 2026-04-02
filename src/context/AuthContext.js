import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // ← Correct named import
import { authLogout } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for token in sessionStorage on mount
  useEffect(() => {
    const token = sessionStorage.getItem('token'); // ← sessionStorage
    if (token) {
      try {
        const decoded = jwtDecode(token); // ← Named import usage
        setCurrentUser({
          username: decoded.sub,
          role: decoded.role,
          fullName: sessionStorage.getItem('fullName') || 'User',
          restaurantId: decoded.restaurantId || null,
          restaurantName: sessionStorage.getItem('restaurantName') || null,
          forcePasswordChange: sessionStorage.getItem('forcePasswordChange') === 'true',
        });
      } catch (error) {
        console.error('Invalid token', error);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('fullName');
        sessionStorage.removeItem('restaurantName');
        sessionStorage.removeItem('forcePasswordChange');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Login user.
   * @param {string} token      - JWT access token
   * @param {string} role       - user role
   * @param {string} fullName   - display name
   * @param {number|null} restaurantId   - tenant restaurant id
   * @param {string|null} restaurantName - tenant restaurant name
   * @param {boolean} forcePasswordChange - whether the user must change password
   */
  const login = (token, role, fullName, restaurantId = null, restaurantName = null, forcePasswordChange = false) => {
    sessionStorage.setItem('token', token); // ← sessionStorage
    sessionStorage.setItem('fullName', fullName || '');
    if (restaurantName) sessionStorage.setItem('restaurantName', restaurantName);
    sessionStorage.setItem('forcePasswordChange', forcePasswordChange ? 'true' : 'false');
    const decoded = jwtDecode(token);
    setCurrentUser({
      username: decoded.sub,
      role,
      fullName,
      restaurantId: restaurantId ?? decoded.restaurantId ?? null,
      restaurantName: restaurantName || null,
      forcePasswordChange: !!forcePasswordChange,
    });
  };

  // Logout user — revoke refresh token on server, then clear local state
  const logout = async () => {
    try {
      await authLogout();
    } catch (_) {
      // Ignore errors — we still clear local state
    } finally {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('fullName');
      sessionStorage.removeItem('restaurantName');
      sessionStorage.removeItem('forcePasswordChange');
      setCurrentUser(null);
    }
  };

  // Clear the force-password-change flag after the user has changed their password
  const clearForcePasswordChange = () => {
    sessionStorage.setItem('forcePasswordChange', 'false');
    setCurrentUser((prev) => prev && { ...prev, forcePasswordChange: false });
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, clearForcePasswordChange, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
