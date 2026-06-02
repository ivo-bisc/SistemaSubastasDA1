import { create } from 'zustand';
import {
  MOCK_ADDRESSES,
  MOCK_CARDS,
  MOCK_CHECKS,
  MOCK_USER,
  MockAddress,
  MockCard,
  MockCheck,
} from '../data/mockProfile';

interface ProfileStore {
  name: string;
  username: string;
  email: string;
  category: string;
  avatarColor: string;
  addresses: MockAddress[];
  cards: MockCard[];
  checks: MockCheck[];

  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
  addAddress: (address: Omit<MockAddress, 'id'>) => void;
  updateAddress: (id: string, address: Omit<MockAddress, 'id'>) => void;
  addCard: (card: Omit<MockCard, 'id'>) => void;
  addCheck: (check: Omit<MockCheck, 'id'>) => void;
}

let idCounter = 100;

function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  name: MOCK_USER.name,
  username: MOCK_USER.username,
  email: MOCK_USER.email,
  category: MOCK_USER.category,
  avatarColor: MOCK_USER.avatarColor,
  addresses: [...MOCK_ADDRESSES],
  cards: [...MOCK_CARDS],
  checks: [...MOCK_CHECKS],

  setUsername: (username) => set({ username }),
  setPassword: () => {
    /* mock: sin backend */
  },
  addAddress: (address) =>
    set((s) => ({
      addresses: [...s.addresses, { ...address, id: nextId('addr') }],
    })),
  updateAddress: (id, address) =>
    set((s) => ({
      addresses: s.addresses.map((a) => (a.id === id ? { ...address, id } : a)),
    })),
  addCard: (card) =>
    set((s) => ({
      cards: [...s.cards, { ...card, id: nextId('card') }],
    })),
  addCheck: (check) =>
    set((s) => ({
      checks: [...s.checks, { ...check, id: nextId('chk') }],
    })),
}));
