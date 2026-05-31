/**
 * BidUp — Datos de prueba para Mis Pujas y Mis Subastas
 */

export interface MockBidItem {
  id: string;
  title: string;
  imageUrl: string;
  timeRemaining: string;
  currentPrice: string;
  myBid: string;
  status: 'winning' | 'losing' | 'won' | 'lost';
}

export interface MockAuctionItem {
  id: string;
  title: string;
  imageUrl: string;
  timeRemaining: string;
  currentPrice: string;
  status: 'soon' | 'finished' | 'canceled';
}

const WATCH_IMAGE = 'https://images.unsplash.com/photo-1523170335258-f5ed11844cae?w=400&q=80';

export const MOCK_BIDS: MockBidItem[] = [
  {
    id: 'bid-1',
    title: 'Reloj vintage Longines Vintage 366908',
    imageUrl: WATCH_IMAGE,
    timeRemaining: '20H 53M',
    currentPrice: '$350.800',
    myBid: '$300.000',
    status: 'losing',
  },
  {
    id: 'bid-2',
    title: 'Reloj vintage Longines Vintage 366908',
    imageUrl: WATCH_IMAGE,
    timeRemaining: '20H 53M',
    currentPrice: '$350.800',
    myBid: '$350.800',
    status: 'winning',
  },
  {
    id: 'bid-3',
    title: 'Reloj vintage Longines Vintage 366908',
    imageUrl: WATCH_IMAGE,
    timeRemaining: '00H 00M',
    currentPrice: '$350.800',
    myBid: '$350.800',
    status: 'won',
  },
  {
    id: 'bid-4',
    title: 'Reloj vintage Longines Vintage 366908',
    imageUrl: WATCH_IMAGE,
    timeRemaining: '00H 00M',
    currentPrice: '$350.800',
    myBid: '$300.000',
    status: 'lost',
  },
];

export const MOCK_AUCTIONS: MockAuctionItem[] = [
  {
    id: 'auc-1',
    title: 'Reloj vintage Longines Vintage 366908',
    imageUrl: WATCH_IMAGE,
    timeRemaining: '20H 53M',
    currentPrice: '$350.800',
    status: 'soon',
  },
  {
    id: 'auc-2',
    title: 'Reloj vintage Longines Vintage 366908',
    imageUrl: WATCH_IMAGE,
    timeRemaining: '00H 00M',
    currentPrice: '$350.800',
    status: 'finished',
  },
  {
    id: 'auc-3',
    title: 'Reloj vintage Longines Vintage 366908',
    imageUrl: WATCH_IMAGE,
    timeRemaining: '00H 00M',
    currentPrice: '$350.800',
    status: 'canceled',
  },
];
