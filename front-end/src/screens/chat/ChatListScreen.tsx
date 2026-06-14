import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, FontSize, Fonts } from '../../constants';
import { chatService } from '../../services/chatService';
import { ModalidadEntrega } from '../../types';

type CompraItem = {
  compraId: number;
  item: { id: number; descripcion: string; numeroPieza: string };
  estadoPago: string;
  total: number;
  moneda: string;
  modalidadEntrega: ModalidadEntrega | null;
};

function ChatItem({ item }: { item: CompraItem }) {
  const navigation = useNavigation<any>();
  const [pressed, setPressed] = useState(false);

  const estadoLabel: Record<string, string> = {
    PENDIENTE: 'Pago pendiente',
    PAGADO: 'Pagado',
    INCUMPLIDO: 'Incumplido',
  };

  return (
    <Pressable
      onPress={() => navigation.navigate('ChatDetail', {
        purchaseId: String(item.compraId),
        itemDescripcion: item.item.descripcion,
        modalidadEntrega: item.modalidadEntrega,
      })}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[styles.chatItem, pressed && styles.chatItemActive]}
    >
      <View style={[styles.avatar, pressed && styles.avatarActive]}>
        <Text style={styles.avatarInitial}>{item.item.numeroPieza[0]}</Text>
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatTopRow}>
          <Text style={[styles.chatName, pressed && styles.chatNameActive]} numberOfLines={1}>
            {item.item.descripcion}
          </Text>
          <Text style={[styles.chatTime, pressed && styles.chatTimeActive]}>
            #{item.item.numeroPieza}
          </Text>
        </View>
        <Text style={[styles.chatSubtitle, pressed && styles.chatSubtitleActive]}>
          {item.moneda} {item.total?.toLocaleString('es-AR')}
        </Text>
        <Text style={[styles.chatPreview, pressed && styles.chatPreviewActive]}>
          {estadoLabel[item.estadoPago] ?? item.estadoPago}
        </Text>
      </View>
    </Pressable>
  );
}

export default function ChatListScreen() {
  const [compras, setCompras] = useState<CompraItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    chatService.getCompras()
      .then((res) => setCompras(res.data))
      .catch(() => setError('No se pudieron cargar los chats'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Chats</Text>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.auctionViolet} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={compras}
          keyExtractor={(i) => String(i.compraId)}
          renderItem={({ item }) => <ChatItem item={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tenés compras con chat activo.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    backgroundColor: Colors.auctionViolet,
  },
  headerTitle: {
    color: Colors.white,
    fontFamily: Fonts.soraBold,
    fontSize: FontSize.xxl,
  },
  list: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    marginTop: 40,
  },
  errorText: {
    color: Colors.error,
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    textAlign: 'center',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: Colors.white,
  },
  chatItemActive: {
    backgroundColor: Colors.auctionViolet,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarActive: {
    backgroundColor: Colors.white,
  },
  avatarInitial: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  chatContent: {
    flex: 1,
  },
  chatTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  chatName: {
    fontFamily: Fonts.soraBold,
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    flex: 1,
    marginRight: 8,
  },
  chatNameActive: {
    color: Colors.white,
  },
  chatTime: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  chatTimeActive: {
    color: '#E6E6F0',
  },
  chatSubtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginBottom: 4,
  },
  chatSubtitleActive: {
    color: '#E6E6F0',
  },
  chatPreview: {
    color: '#B1B1B5',
    fontSize: FontSize.md,
  },
  chatPreviewActive: {
    color: '#F0EFFF',
  },
});
