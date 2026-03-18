import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const requestUrl = err.config?.url || '';
    const isLoginRequest = requestUrl.includes('/api/auth/login');
    const isOnLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';

    if (status === 401 && !isLoginRequest) {
      Cookies.remove('token');

      if (!isOnLoginPage) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(err);
  }
);

export default api;
