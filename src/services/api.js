import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = axios.create({
  baseURL: 'http://localhost:8080',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handler — auto redirect to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login'; // Hard redirect
    }
    return Promise.reject(error);
  }
);

export default API;