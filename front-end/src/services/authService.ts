import apiClient from './apiClient';
import { Endpoints } from '../constants';

/**
 * Servicio de autenticación
 */
export const authService = {
  login: async (email: string, password: string) => {
    // TODO: implementar
    return apiClient.post(Endpoints.AUTH.LOGIN, { email, password });
  },

  logout: async () => {
    // TODO: implementar
    return apiClient.post(Endpoints.AUTH.LOGOUT);
  },

  registerStep1: async (formData: FormData) => {
    return apiClient.post(Endpoints.AUTH.REGISTER_STEP1, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  registerStep2: async (data: { tokenEmail: string; email: string; password: string }) => {
    return apiClient.post(Endpoints.AUTH.REGISTER_STEP2, data);
  },
};
