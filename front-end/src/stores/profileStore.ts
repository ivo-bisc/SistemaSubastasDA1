import { create } from 'zustand';
import { MockCard, MockCheck } from '../data/mockProfile';
import { userService } from '../services/userService';
import { paymentService } from '../services/paymentService';

interface ProfileStore {
  name: string;
  username: string;
  email: string;
  category: string;
  avatarColor: string;
  address: string;
  cards: MockCard[];
  checks: MockCheck[];
  isLoading: boolean;
  error: string | null;

  loadProfile: () => Promise<void>;
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
  updateAddress: (domicilioLegal: string) => Promise<void>;
  addCard: (card: Omit<MockCard, 'id'>) => void;
  addCheck: (check: Omit<MockCheck, 'id'>) => void;
}

let idCounter = 100;

function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  name: '',
  username: '',
  email: '',
  category: '',
  avatarColor: '#FC9905',
  address: '',
  cards: [],
  checks: [],
  isLoading: false,
  error: null,

  loadProfile: async () => {
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
          last4: '****',
          brand: 'visa' as const,
          holderName: mp.alias,
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

      set({
        name: `${u.firstName} ${u.lastName}`,
        username: u.firstName,
        email: u.email,
        category: u.category,
        address: u.address ?? '',
        cards,
        checks,
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

  addCard: (card) =>
    set((s) => ({
      cards: [...s.cards, { ...card, id: nextId('card') }],
    })),
  addCheck: (check) =>
    set((s) => ({
      checks: [...s.checks, { ...check, id: nextId('chk') }],
    })),
}));
