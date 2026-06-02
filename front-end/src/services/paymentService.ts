import apiClient from './apiClient';
import { Endpoints } from '../constants';

export interface MedioPagoRequest {
  tipo: 'TARJETA_CREDITO' | 'CUENTA_BANCARIA' | 'CHEQUE_CERTIFICADO';
  alias: string;
  moneda: 'ARS' | 'USD';
  // TARJETA_CREDITO
  numeroTarjeta?: string;
  titular?: string;
  vencimiento?: string;
  tipoTarjeta?: string;
  // CUENTA_BANCARIA
  numeroCuenta?: string;
  banco?: string;
  tipoCuenta?: string;
  cbu?: string;
  // CHEQUE_CERTIFICADO
  montoCheque?: number;
}

export const paymentService = {
  getPaymentMethods: async () => {
    return apiClient.get(Endpoints.PAYMENTS.METHODS);
  },

  addPaymentMethod: async (data: MedioPagoRequest) => {
    return apiClient.post(Endpoints.PAYMENTS.METHODS, data);
  },

  deletePaymentMethod: async (id: string) => {
    return apiClient.delete(Endpoints.PAYMENTS.DELETE(id));
  },
};
