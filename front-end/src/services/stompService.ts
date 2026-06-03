import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { Platform } from 'react-native';

const WS_HOST = Platform.OS === 'web' ? 'localhost:8080' : '10.0.2.2:8080';
const WS_URL = (process.env.EXPO_PUBLIC_WS_URL ?? `ws://${WS_HOST}/ws/websocket`);

let client: Client | null = null;

export const stompService = {
  connect(token: string, onConnect: () => void): void {
    if (client?.active) {
      if (client.connected) onConnect();
      return;
    }

    client = new Client({
      webSocketFactory: () => new WebSocket(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => onConnect(),
      onStompError: (frame) => {
        console.warn('[STOMP] error:', frame.headers['message']);
      },
    });
    client.activate();
  },

  subscribe(destination: string, callback: (msg: IMessage) => void): StompSubscription | null {
    if (!client?.connected) return null;
    return client.subscribe(destination, callback);
  },

  send(destination: string, body: object): void {
    if (!client?.connected) return;
    client.publish({ destination, body: JSON.stringify(body) });
  },

  disconnect(): void {
    client?.deactivate();
    client = null;
  },
};
