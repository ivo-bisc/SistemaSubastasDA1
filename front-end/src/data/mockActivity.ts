/**
 * BidUp — Datos de prueba para Mis Pujas y Mis Subastas
 */

export interface MockBidItem {
  id: string;
  auctionId: string;
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
  moderationStatus: 'pending' | 'approved_pending_lot' | 'published' | 'rejected';
  rejectionReason?: string;
}

