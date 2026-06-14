import apiClient from './apiClient';
import { Endpoints } from '../constants';

export const metricsService = {
  getMyBids: async () => {
    return apiClient.get(Endpoints.METRICS.MY_BIDS);
  },

  getFines: async () => {
    return apiClient.get(Endpoints.METRICS.FINES);
  },

  payFine: async (id: string, medioPagoId: string) => {
    return apiClient.post(Endpoints.METRICS.PAY_FINE(id), { medioPagoId });
  },
};
