import apiClient from './apiClient';
import { Endpoints } from '../constants';
import { Auction, AuctionDetail } from '../types';
import { CatalogCardItem, CatalogCategory } from '../types/catalog';
import { formatTimeRemaining } from '../utils/format';
import { resolveImageUrl } from '../utils/media';

function formatItemPrice(value: number | null | undefined): string {
  if (value == null) return 'Consultar';
  return `$${Number(value).toLocaleString('es-AR')}`;
}

function mapCatalogItem(item: any, endDate: string): CatalogCardItem {
  const price =
    item.currentPrice != null
      ? formatItemPrice(item.currentPrice)
      : formatItemPrice(item.startingPrice);

  return {
    id: String(item.id),
    title: item.description ?? item.pieceNumber ?? 'Ítem',
    price,
    timeRemaining: formatTimeRemaining(endDate),
    imageUrl: resolveImageUrl(item.images?.[0]?.url),
  };
}

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

  getLotDetail: async (subastaId: string): Promise<CatalogCategory> => {
    const [auctionRes, catalogRes] = await Promise.all([
      apiClient.get(Endpoints.AUCTIONS.DETAIL(subastaId)),
      apiClient.get(Endpoints.AUCTIONS.CATALOG(subastaId)),
    ]);

    const subasta = auctionRes.data;
    const items: any[] = catalogRes.data ?? [];
    const endDate = subasta.endDate ?? '';

    return {
      id: String(subasta.id),
      name: subasta.title ?? subasta.titulo ?? '',
      description: subasta.description ?? subasta.descripcion ?? '',
      endDate,
      items: items.map((item) => mapCatalogItem(item, endDate)),
    };
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
      itemId: Number(firstItem?.id ?? 0),
      title: subasta.title,
      description: subasta.description ?? '',
      imageUrl: resolveImageUrl(firstItem?.images?.[0]?.url ?? subasta.coverImageUrl),
      startDate: subasta.startDate ?? '',
      endDate: subasta.endDate ?? '',
      startingPrice: firstItem?.startingPrice ?? 0,
      currentPrice: firstItem?.currentPrice ?? 0,
      status: statusMap[subasta.status] ?? 'upcoming',
      images: (firstItem?.images?.map((img: any) => resolveImageUrl(img.url)) ?? [])
        .filter(Boolean),
      category: subasta.category ?? '',
      seller: subasta.rematador
        ? { id: String(subasta.rematador.id), name: `${subasta.rematador.firstName} ${subasta.rematador.lastName}` }
        : { id: '', name: '' },
      totalBids: 0,
    };
  },

  connectToAuction: async (id: string, medioPagoId: number) => {
    return apiClient.post(Endpoints.AUCTIONS.CONNECT(id), { medioPagoId });
  },

  disconnectFromAuction: async (id: string) => {
    // TODO: implementar
    return apiClient.post(Endpoints.AUCTIONS.DISCONNECT(id));
  },
};
