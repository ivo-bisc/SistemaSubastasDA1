/**
 * Mock data for Profile screens.
 * Replace with API / store when backend is ready.
 */

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


