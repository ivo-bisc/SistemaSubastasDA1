import apiClient from './apiClient';
import { Endpoints } from '../constants';
import { Auction, AuctionDetail } from '../types';

const statusMap: Record<string, Auction['status']> = {
  PROXIMA: 'upcoming',
  ABIERTA: 'active',
  CERRADA: 'finished',
};

export const auctionService = {
  getAuctions: async () => {
    // TODO: implementar
    return apiClient.get(Endpoints.AUCTIONS.LIST);
  },

  getAuctionDetail: async (id: string): Promise<AuctionDetail> => {
    const [auctionRes, catalogRes] = await Promise.all([
      apiClient.get(Endpoints.AUCTIONS.DETAIL(id)),
      apiClient.get(Endpoints.AUCTIONS.CATALOG(id)),
    ]);

    const subasta = auctionRes.data;
    const items: any[] = catalogRes.data ?? [];
    const firstItem = items[0];

    return {
      id: String(subasta.id),
      title: subasta.title,
      description: subasta.description ?? '',
      imageUrl: firstItem?.images?.[0]?.url ?? '',
      startDate: subasta.startDate ?? '',
      endDate: '',
      startingPrice: firstItem?.startingPrice ?? 0,
      currentPrice: firstItem?.currentPrice ?? 0,
      status: statusMap[subasta.status] ?? 'upcoming',
      images: firstItem?.images?.map((img: any) => img.url) ?? [],
      category: subasta.category ?? '',
      seller: subasta.rematador
        ? { id: String(subasta.rematador.id), name: `${subasta.rematador.firstName} ${subasta.rematador.lastName}` }
        : { id: '', name: '' },
      totalBids: 0,
    };
  },

  connectToAuction: async (id: string) => {
    // TODO: implementar
    return apiClient.post(Endpoints.AUCTIONS.CONNECT(id));
  },

  disconnectFromAuction: async (id: string) => {
    // TODO: implementar
    return apiClient.post(Endpoints.AUCTIONS.DISCONNECT(id));
  },
};
