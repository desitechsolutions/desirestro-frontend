import React, { useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoadingBtn] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoadingBtn(true);

    try {
      const res = await API.post('/api/auth/login', { username, password });
      
      // Redirect based on role
      // After successful login
        login(res.data.token, res.data.role, res.data.fullName);
        navigate(
        res.data.role === 'ADMIN' ? '/admin' :
        res.data.role === 'CAPTAIN' ? '/tables' :
        res.data.role === 'KITCHEN' ? '/kot' :
        res.data.role === 'CASHIER' ? '/billing' :
        '/login'
        );
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoadingBtn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-amber-700 mb-8">
          DesiRestro POS
        </h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
            />
          </div>
          {error && <p className="text-red-600 text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-amber-700 transition disabled:opacity-70"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;