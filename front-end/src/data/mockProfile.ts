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

export type MockAddress = {
  id: string;
  province: string;
  city: string;
  street1: string;
  street2?: string;
  number: string;
  bell?: string;
  zipCode: string;
};

export const MOCK_ADDRESSES: MockAddress[] = [
  {
    id: 'addr_01',
    province: 'Buenos Aires',
    city: 'CABA',
    street1: 'Av. Rivadavia',
    number: '9542',
    bell: "8 'C'",
    zipCode: '1406',
  },
  {
    id: 'addr_02',
    province: 'Buenos Aires',
    city: 'CABA',
    street1: 'Av. Córdoba',
    number: '1486',
    zipCode: '1055',
  },
];

export type MockCard = {
  id: string;
  last4: string;
  brand: 'visa' | 'mastercard';
  holderName: string;
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
  { id: 'card_01', last4: '4187', brand: 'mastercard', holderName: 'Jane Doe' },
  { id: 'card_02', last4: '9387', brand: 'mastercard', holderName: 'Jane Doe' },
];

export const MOCK_CHECKS: MockCheck[] = [];

export function formatAddressLine(addr: MockAddress): string {
  const parts = [`${addr.street1} ${addr.number}`];
  if (addr.bell) parts.push(addr.bell);
  return parts.join(' ');
}
