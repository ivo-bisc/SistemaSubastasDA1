import apiClient from './apiClient';
import { Endpoints } from '../constants';
import { ModalidadEntrega } from '../types';

export const chatService = {
  getCompras: async () => {
    return apiClient.get(Endpoints.PURCHASES.LIST);
  },

  getMessages: async (purchaseId: string) => {
    return apiClient.get(Endpoints.PURCHASES.CHAT(purchaseId));
  },

  sendMessage: async (purchaseId: string, text: string) => {
    return apiClient.post(Endpoints.PURCHASES.CHAT(purchaseId), { contenido: text });
  },

  confirmDelivery: async (purchaseId: string, modalidadEntrega: ModalidadEntrega) => {
    return apiClient.patch(Endpoints.PURCHASES.DELIVERY(purchaseId), { modalidadEntrega });
  },
};
