package com.subastas.service;

import com.subastas.model.dto.websocket.AuctionClosedMessage;
import com.subastas.model.dto.websocket.BidConfirmedMessage;
import com.subastas.model.dto.websocket.BidRejectedMessage;
import com.subastas.model.dto.websocket.BidUpdatedMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    // Broadcast a todos los conectados a la subasta
    public void broadcastBidUpdated(Long subastaId, BidUpdatedMessage message) {
        String destination = "/topic/subastas/" + subastaId;
        log.debug("Broadcasting BID_UPDATED a {}", destination);
        messagingTemplate.convertAndSend(destination, message);
    }

    // Solo al postor que realizó la puja
    public void sendBidConfirmed(String emailPostor, BidConfirmedMessage message) {
        log.debug("Enviando BID_CONFIRMED a {}", emailPostor);
        messagingTemplate.convertAndSendToUser(emailPostor, "/queue/pujas", message);
    }

    // Solo al postor cuya puja fue rechazada
    public void sendBidRejected(String emailPostor, BidRejectedMessage message) {
        log.debug("Enviando BID_REJECTED a {}", emailPostor);
        messagingTemplate.convertAndSendToUser(emailPostor, "/queue/pujas", message);
    }

    // Broadcast cierre de subasta a todos los conectados
    public void broadcastAuctionClosed(Long subastaId, AuctionClosedMessage message) {
        String destination = "/topic/subastas/" + subastaId;
        log.debug("Broadcasting AUCTION_CLOSED a {}", destination);
        messagingTemplate.convertAndSend(destination, message);
    }
}
