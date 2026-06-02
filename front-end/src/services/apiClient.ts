import axios from 'axios';
import { Platform } from 'react-native';
import { useAuthStore } from '../stores/authStore';

const DEFAULT_URL =
  Platform.OS === 'web'
    ? 'http://localhost:8080/api/v1'
    : 'http://10.0.2.2:8080/api/v1';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_URL;

/**
 * Cliente Axios centralizado para BidUp
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de request: inyecta el JWT del authStore
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Interceptor de response: manejo global de errores 401
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido → forzar logout
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
