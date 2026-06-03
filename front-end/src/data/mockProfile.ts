/**
 * Mock data for Profile screens.
 * Replace with API / store when backend is ready.
 */

export const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === 'true';

export const MOCK_USER = {
  id: 'usr_001',
  name: 'Jane Doe',
  username: 'janedoe',
  email: 'janedoe@gmail.com',
  avatarColor: '#FC9905',
  category: 'Común',
};


export type MockCard = {
  id: string;
  alias: string;
  tipo: string;
  moneda: string;
  verificado?: boolean;
  /** Present when added locally from the card form */
  last4?: string;
  brand?: 'visa' | 'mastercard';
  holderName?: string;
};

export type MockCheck = {
  id: string;
  checkNumber: string;
  bankName: string;
  issueDate: string;
  cuit: string;
  drawer: string;
};

export const MOCK_CARDS: MockCard[] = [
  {
    id: 'card_01',
    alias: 'Jane Doe',
    tipo: 'TARJETA_CREDITO',
    moneda: 'ARS',
    last4: '4187',
    brand: 'mastercard',
    holderName: 'Jane Doe',
  },
  {
    id: 'card_02',
    alias: 'Jane Doe',
    tipo: 'TARJETA_CREDITO',
    moneda: 'ARS',
    last4: '9387',
    brand: 'mastercard',
    holderName: 'Jane Doe',
  },
];

export const MOCK_CHECKS: MockCheck[] = [];

