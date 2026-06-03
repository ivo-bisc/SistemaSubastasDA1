import { useCallback, useEffect, useState } from 'react';
import { stompService } from '../services/stompService';
import { useAuthStore } from '../stores/authStore';
import type { BidConfirmedMessage, BidRejectedMessage, BidUpdatedMessage } from '../types';

export function useAuctionSocket(subastaId: string) {
  const token = useAuthStore((s) => s.token);
  const [liveBid, setLiveBid] = useState<BidUpdatedMessage | null>(null);
  const [confirmation, setConfirmation] = useState<BidConfirmedMessage | null>(null);
  const [rejection, setRejection] = useState<BidRejectedMessage | null>(null);

  useEffect(() => {
    if (!token || !subastaId) return;

    stompService.connect(token, () => {
      stompService.subscribe(`/topic/subastas/${subastaId}`, (msg) => {
        const data = JSON.parse(msg.body);
        if (data.tipo === 'BID_UPDATED') setLiveBid(data as BidUpdatedMessage);
      });
      stompService.subscribe('/user/queue/pujas', (msg) => {
        const data = JSON.parse(msg.body);
        if (data.tipo === 'BID_CONFIRMED') setConfirmation(data as BidConfirmedMessage);
        else if (data.tipo === 'BID_REJECTED') setRejection(data as BidRejectedMessage);
      });
    });

    return () => {
      stompService.disconnect();
    };
  }, [token, subastaId]);

  const sendBid = useCallback(
    (payload: { itemId: number; monto: number; medioPagoId: number }) => {
      stompService.send(`/app/subastas/${subastaId}/pujar`, payload);
    },
    [subastaId]
  );

  return { liveBid, confirmation, rejection, sendBid };
}
