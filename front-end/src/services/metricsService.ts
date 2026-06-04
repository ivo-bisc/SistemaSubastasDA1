import apiClient from './apiClient';
import { Endpoints } from '../constants';

export const metricsService = {
  getMyBids: async () => {
    return apiClient.get(Endpoints.METRICS.MY_BIDS);
  },
};
