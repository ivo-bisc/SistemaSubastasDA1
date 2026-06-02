import apiClient from './apiClient';
import { Endpoints } from '../constants';

/**
 * Servicio de pujas (bids)
 */
export const bidService = {
  getCurrentBid: async (auctionId: string) => {
    // TODO: implementar
    return apiClient.get(Endpoints.BIDS.CURRENT(auctionId));
  },

  placeBid: async (
    auctionId: string,
    itemId: number,
    monto: number,
    medioPagoId: number
  ) => {
    return apiClient.post(Endpoints.BIDS.PLACE(auctionId), { itemId, monto, medioPagoId });
  },

  getBidHistory: async (auctionId: string) => {
    // TODO: implementar
    return apiClient.get(Endpoints.BIDS.HISTORY(auctionId));
  },
};
