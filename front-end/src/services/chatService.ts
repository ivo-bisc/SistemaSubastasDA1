import apiClient from './apiClient';
import { Endpoints } from '../constants';

export const chatService = {
  getMessages: async (purchaseId: string) => {
    return apiClient.get(Endpoints.PURCHASES.CHAT(purchaseId));
  },

  sendMessage: async (purchaseId: string, text: string) => {
    return apiClient.post(Endpoints.PURCHASES.CHAT(purchaseId), { contenido: text });
  },
};
