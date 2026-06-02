import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSize, Layout } from '../../constants';
import { formatCurrency } from '../../utils/format';

type Props = {
  visible: boolean;
  amount: number;
  currency: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmBidModal({
  visible,
  amount,
  currency,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="cash-outline" size={28} color={Colors.success} />
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={12} color={Colors.white} />
            </View>
          </View>

          <Text style={styles.title}>Confirma la puja</Text>
          <Text style={styles.message}>
            Pujaste por {formatCurrency(amount, currency)}. ¿Querés confirmar la
            oferta?
          </Text>

          <Pressable
            style={({ pressed }) => [styles.confirmBtn, pressed && styles.pressed]}
            onPress={onConfirm}
          >
            <Text style={styles.confirmText}>Sí, confirmar mi puja</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
            onPress={onCancel}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F8EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  checkBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  title: {
    fontFamily: Fonts.soraBold,
    fontSize: FontSize.xl,
    color: Colors.black,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontFamily: Fonts.sora,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  confirmBtn: {
    width: '100%',
    height: Layout.buttonHeight,
    borderRadius: Layout.buttonBorderRadius,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  confirmText: {
    fontFamily: Fonts.soraBold,
    fontSize: FontSize.base,
    color: Colors.white,
  },
  cancelBtn: {
    width: '100%',
    height: Layout.buttonHeight,
    borderRadius: Layout.buttonBorderRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: Fonts.soraBold,
    fontSize: FontSize.base,
    color: Colors.black,
  },
  pressed: {
    opacity: 0.9,
  },
});
