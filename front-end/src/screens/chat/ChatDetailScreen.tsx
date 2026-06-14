import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors, FontSize, Fonts, Layout } from '../../constants';
import { chatService } from '../../services/chatService';
import { notify } from '../../utils/confirm';
import { ModalidadEntrega } from '../../types';

const formatTime = (ts: string) => {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

export default function ChatDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const purchaseId: string | undefined = route.params?.purchaseId;
  const itemDescripcion: string = route.params?.itemDescripcion ?? 'Artículo';
  const vendedorNombre: string = route.params?.vendedorNombre ?? 'Carlos Martini';
  const initialDeliveryMode: ModalidadEntrega | null = route.params?.modalidadEntrega ?? null;

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [deliveryMode, setDeliveryMode] = useState<ModalidadEntrega | null>(initialDeliveryMode);
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);

  const scrollRef = useRef<any>(null);

  useEffect(() => {
    if (!purchaseId) return;
    setLoading(true);
    chatService
      .getMessages(purchaseId)
      .then((res) => {
        const data: any[] = res.data ?? [];
        setMessages(
          data.map((m) => ({
            id: String(m.mensajeId),
            type: m.remitente === 'USUARIO' ? 'out' : 'in',
            text: m.contenido,
            time: formatTime(m.timestamp),
          }))
        );
      })
      .catch(() => setLoadError('No se pudieron cargar los mensajes.'))
      .finally(() => setLoading(false));
  }, [purchaseId]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 0);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSelectDelivery = (modalidad: ModalidadEntrega) => {
    if (!purchaseId || confirmingDelivery) return;
    setConfirmingDelivery(true);
    chatService
      .confirmDelivery(purchaseId, modalidad)
      .then(() => setDeliveryMode(modalidad))
      .catch(() => notify('Error', 'No se pudo confirmar la modalidad de entrega. Intentá de nuevo.'))
      .finally(() => setConfirmingDelivery(false));
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.white} />
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Colors.white, fontFamily: Fonts.sora }}>{loadError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </Pressable>
        <View style={styles.headerInfo}>
          <View style={styles.headerAvatar}><Text style={styles.headerAvatarInitial}>{vendedorNombre.charAt(0).toUpperCase()}</Text></View>
          <View>
            <Text style={styles.headerTitle}>{vendedorNombre}</Text>
            <Text style={styles.headerSubtitle}>De: {itemDescripcion}</Text>
          </View>
        </View>
      </View>

      {deliveryMode === null ? (
        <View style={styles.deliveryCard}>
          <Text style={styles.deliveryTitle}>Confirmá cómo querés recibir tu compra</Text>
          <View style={styles.deliveryButtonsRow}>
            <Pressable
              style={({ pressed }) => [styles.deliveryBtn, pressed && styles.deliveryBtnPressed]}
              onPress={() => handleSelectDelivery('ENVIO_DOMICILIO')}
              disabled={confirmingDelivery}
            >
              <Text style={styles.deliveryBtnText}>Envío a domicilio</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.deliveryBtn, pressed && styles.deliveryBtnPressed]}
              onPress={() => handleSelectDelivery('RETIRO_PERSONAL')}
              disabled={confirmingDelivery}
            >
              <Text style={styles.deliveryBtnText}>Retiro personal</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.deliveryChip}>
          <Text style={styles.deliveryChipText}>
            Entrega: {deliveryMode === 'ENVIO_DOMICILIO' ? 'Envío a domicilio' : 'Retiro personal'}
          </Text>
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((m) => (
          <View key={m.id} style={[styles.messageRow, m.type === 'out' ? styles.messageOutRow : styles.messageInRow]}>
            {m.type === 'in' ? (
              <View style={styles.bubbleIn}>
                <Text style={styles.bubbleText}>{m.text}</Text>
                <Text style={styles.msgTime}>{m.time}</Text>
              </View>
            ) : (
              <View style={styles.bubbleOut}>
                <Text style={styles.bubbleTextOut}>{m.text}</Text>
                <Text style={styles.msgTimeOut}>{m.time}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputArea}>
        {sendError ? <Text style={styles.sendError}>{sendError}</Text> : null}
        <View style={styles.inputBar}>
          <TextInput
            placeholder="Escribí tu mensaje..."
            placeholderTextColor="#9A9A9A"
            style={styles.input}
            value={inputText}
            onChangeText={(text) => {
              setInputText(text);
              if (sendError) setSendError(null);
            }}
          />
          <Pressable
            style={styles.sendBtn}
            onPress={() => {
              const text = inputText.trim();
              if (!text) return;
              const now = new Date();
              const h = now.getHours().toString().padStart(2, '0');
              const m = now.getMinutes().toString().padStart(2, '0');
              const time = `${h}:${m}`;
              const msgId = `m${Date.now()}`;
              const newMsg = { id: msgId, type: 'out', text, time };
              setSendError(null);
              setMessages((prev) => [...prev, newMsg]);
              setInputText('');
              if (purchaseId) {
                chatService.sendMessage(purchaseId, text).catch(() => {
                  setMessages((prev) => prev.filter((msg) => msg.id !== msgId));
                  setSendError('No se pudo enviar el mensaje. Intentá de nuevo.');
                });
              }
            }}
          >
            <Ionicons name="send" size={20} color={Colors.white} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.auctionViolet,
  },
  back: {
    marginRight: 8,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerAvatarInitial: {
    color: Colors.auctionViolet,
    fontWeight: '700',
  },
  headerTitle: {
    color: Colors.white,
    fontFamily: Fonts.soraBold,
    fontSize: FontSize.lg,
  },
  headerSubtitle: {
    color: '#E6E6F0',
    fontSize: FontSize.sm,
  },
  deliveryCard: {
    backgroundColor: Colors.white,
    borderRadius: Layout.profileRowRadius,
    marginHorizontal: 12,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  deliveryTitle: {
    fontFamily: Fonts.soraBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  deliveryButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  deliveryBtn: {
    flex: 1,
    height: Layout.buttonHeight,
    borderRadius: Layout.buttonBorderRadius,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  deliveryBtnPressed: {
    opacity: 0.85,
  },
  deliveryBtnText: {
    fontFamily: Fonts.soraBold,
    fontSize: FontSize.sm,
    color: Colors.white,
    textAlign: 'center',
  },
  deliveryChip: {
    alignSelf: 'center',
    backgroundColor: Layout.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 12,
  },
  deliveryChipText: {
    fontFamily: Fonts.soraBold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  messages: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 120,
  },
  messageRow: {
    marginBottom: 12,
  },
  messageInRow: {
    alignItems: 'flex-start',
  },
  messageOutRow: {
    alignItems: 'flex-end',
  },
  bubbleIn: {
    backgroundColor: '#F2F2F6',
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  bubbleOut: {
    backgroundColor: '#F7B65A',
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  bubbleText: {
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  bubbleTextOut: {
    color: Colors.white,
    lineHeight: 20,
  },
  msgTime: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    marginTop: 6,
  },
  msgTimeOut: {
    color: Colors.white,
    fontSize: FontSize.xs,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  inputArea: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 16,
  },
  sendError: {
    color: Colors.error,
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    marginBottom: 8,
    textAlign: 'center',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F4',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    paddingVertical: 6,
    color: Colors.textPrimary,
  },
  sendBtn: {
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
});
