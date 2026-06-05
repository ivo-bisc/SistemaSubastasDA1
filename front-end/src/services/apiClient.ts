import axios from 'axios';
import { NativeModules, Platform } from 'react-native';
import { useAuthStore } from '../stores/authStore';

function resolveBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (Platform.OS === 'web') return 'http://localhost:8080/api/v1';

  // En dev nativo (emulador o celu físico), Metro incluye la IP real del host
  // en la URL del bundle. La extraemos para apuntar al backend en el mismo host.
  if (__DEV__) {
    const scriptURL: string | undefined = NativeModules.SourceCode?.scriptURL;
    if (scriptURL) {
      const host = scriptURL.split('//')[1]?.split(':')[0];
      if (host) return `http://${host}:8080/api/v1`;
    }
  }

  return 'http://10.0.2.2:8080/api/v1';
}

const BASE_URL = resolveBaseUrl();

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
      // Solo forzar logout si había un token activo (sesión expirada)
      // Los guests no tienen token, así que no corresponde hacer logout
      if (useAuthStore.getState().token) {
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
