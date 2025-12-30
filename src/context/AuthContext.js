import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';  // ← Named import, not default

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);  // ← Use directly
        setCurrentUser({
          username: decoded.sub,
          role: decoded.role,
          fullName: decoded.fullName || 'User'
        });
      } catch (error) {
        console.error('Invalid token', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = (token, role, fullName) => {
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token);  // ← Use directly
    setCurrentUser({
      username: decoded.sub,
      role,
      fullName
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};