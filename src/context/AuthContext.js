import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // ← Correct named import

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
          fullName: decoded.fullName || 'User',
        });
      } catch (error) {
        console.error('Invalid token', error);
        sessionStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // Login user
  const login = (token, role, fullName) => {
    sessionStorage.setItem('token', token); // ← sessionStorage
    const decoded = jwtDecode(token);
    setCurrentUser({
      username: decoded.sub,
      role,
      fullName,
    });
  };

  // Logout user
  const logout = () => {
    sessionStorage.removeItem('token'); // ← sessionStorage
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
