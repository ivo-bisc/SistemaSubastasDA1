import { create } from 'zustand';
import { MockCard, MockCheck } from '../data/mockProfile';
import { userService } from '../services/userService';
import { paymentService, type MedioPagoRequest } from '../services/paymentService';
import { detectCardBrand, onlyDigits } from '../utils/cardForm';
import { useAuthStore } from './authStore';
import type { User } from '../types';

export interface PaymentMethod {
  id: string;
  alias: string;
  tipo: string;
  moneda: string;
  verificado: boolean;
}

interface ProfileStore {
  name: string;
  username: string;
  email: string;
  category: string;
  avatarColor: string;
  address: string;
  cards: MockCard[];
  checks: MockCheck[];
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  error: string | null;

  loadProfile: () => Promise<void>;
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
  updateAddress: (domicilioLegal: string) => Promise<void>;
  addCardViaApi: (data: MedioPagoRequest) => Promise<void>;
  addCheck: (check: Omit<MockCheck, 'id'>) => void;
  removeCard: (id: string) => void;
}

let idCounter = 100;

function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  name: '',
  username: '',
  email: '',
  category: '',
  avatarColor: '#FC9905',
  address: '',
  cards: [],
  checks: [],
  paymentMethods: [],
  isLoading: false,
  error: null,

  loadProfile: async () => {
    if (get().isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const [profileRes, paymentsRes] = await Promise.all([
        userService.getProfile(),
        paymentService.getPaymentMethods(),
      ]);

      const u = profileRes.data;
      const payments: any[] = paymentsRes.data;

      const cards: MockCard[] = payments
        .filter((mp) => mp.tipo === 'TARJETA_CREDITO')
        .map((mp) => ({
          id: String(mp.id),
          alias: mp.alias ?? '',
          tipo: mp.tipo ?? 'TARJETA_CREDITO',
          moneda: mp.moneda ?? '',
          verificado: mp.verificado,
        }));

      const checks: MockCheck[] = payments
        .filter((mp) => mp.tipo === 'CHEQUE_CERTIFICADO')
        .map((mp) => ({
          id: String(mp.id),
          checkNumber: mp.alias,
          bankName: '',
          issueDate: '',
          cuit: '',
          drawer: '',
        }));

      const allPaymentMethods: PaymentMethod[] = payments.map((mp) => ({
        id: String(mp.id),
        alias: mp.alias ?? '',
        tipo: mp.tipo ?? '',
        moneda: mp.moneda ?? '',
        verificado: mp.verificado === true,
      }));

      const statusMap: Record<string, User['status']> = {
        APROBADO: 'approved',
        PENDIENTE_VERIFICACION: 'pending',
        BLOQUEADO: 'rejected',
      };
      const translatedStatus = statusMap[u.status] ?? 'pending';
      useAuthStore.getState().updateUserStatus(translatedStatus);
      useAuthStore.getState().updateUserRole(u.role);

      set({
        name: `${u.firstName} ${u.lastName}`,
        username: u.firstName,
        email: u.email,
        category: u.category,
        address: u.address ?? '',
        cards,
        checks,
        paymentMethods: allPaymentMethods,
        isLoading: false,
      });
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Error al cargar el perfil' });
    }
  },

  setUsername: (username) => set({ username }),
  setPassword: () => { /* mock: sin backend */ },

  updateAddress: async (domicilioLegal) => {
    await userService.updateProfile({ domicilioLegal });
    set({ address: domicilioLegal });
  },

  addCardViaApi: async (data) => {
    const response = await paymentService.addPaymentMethod(data);
    const mp = response.data;
    const digits = onlyDigits(data.numeroTarjeta ?? '');

    set((s) => ({
      cards: [
        ...s.cards,
        {
          id: String(mp.id),
          alias: mp.alias ?? data.alias,
          tipo: mp.tipo ?? data.tipo,
          moneda: mp.moneda ?? data.moneda,
          verificado: mp.verificado,
          last4: digits.slice(-4) || '****',
          brand: detectCardBrand(digits),
          holderName: data.titular ?? mp.alias ?? '',
        },
      ],
    }));
  },
  addCheck: (check) =>
    set((s) => ({
      checks: [...s.checks, { ...check, id: nextId('chk') }],
    })),

  removeCard: (id) =>
    set((s) => ({
      cards: s.cards.filter((c) => c.id !== id),
      paymentMethods: s.paymentMethods.filter((m) => m.id !== id),
    })),
}));
