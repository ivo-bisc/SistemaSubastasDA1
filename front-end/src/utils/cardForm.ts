import type { MedioPagoRequest } from '../services/paymentService';

export type CreditCardTouched = {
  cardNumber: boolean;
  securityCode: boolean;
  expiration: boolean;
  holderName: boolean;
};

export const EMPTY_CARD_TOUCHED: CreditCardTouched = {
  cardNumber: false,
  securityCode: false,
  expiration: false,
  holderName: false,
};

export const ALL_CARD_TOUCHED: CreditCardTouched = {
  cardNumber: true,
  securityCode: true,
  expiration: true,
  holderName: true,
};

export const onlyDigits = (value: string) => value.replace(/\D/g, '');

export function formatCardNumberInput(value: string): string {
  return onlyDigits(value).slice(0, 16);
}

export function formatSecurityCodeInput(value: string): string {
  return onlyDigits(value).slice(0, 4);
}

export function formatExpirationInput(value: string): string {
  const digits = onlyDigits(value).slice(0, 6);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function isCardNumberValid(cardNumber: string): boolean {
  return onlyDigits(cardNumber).length === 16;
}

export function isSecurityCodeValid(securityCode: string): boolean {
  return /^[0-9]{3,4}$/.test(securityCode);
}

export function isExpirationValid(expiration: string): boolean {
  const match = expiration.match(/^(0[1-9]|1[0-2])\/(\d{4})$/);
  if (!match) return false;

  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10);
  if (year > 2040) return false;

  const now = new Date();
  const expDate = new Date(year, month - 1, 1);
  return expDate >= new Date(now.getFullYear(), now.getMonth(), 1);
}

export function isHolderNameValid(holderName: string): boolean {
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(holderName)) return false;
  return holderName.replace(/\s+/g, '').length >= 6;
}

export function isCreditCardFormValid(
  cardNumber: string,
  securityCode: string,
  expiration: string,
  holderName: string
): boolean {
  return (
    isCardNumberValid(cardNumber) &&
    isSecurityCodeValid(securityCode) &&
    isExpirationValid(expiration) &&
    isHolderNameValid(holderName)
  );
}

export function detectCardBrand(cardNumber: string): 'visa' | 'mastercard' {
  return onlyDigits(cardNumber).startsWith('4') ? 'visa' : 'mastercard';
}

export function inferTipoTarjeta(cardNumber: string): string {
  const digits = onlyDigits(cardNumber);
  if (digits.startsWith('4') || digits.startsWith('5')) return 'internacional';
  return 'nacional';
}

export function buildCardMedioPagoRequest(
  cardNumber: string,
  holderName: string,
  expiration: string,
  moneda: 'ARS' | 'USD' = 'ARS'
): MedioPagoRequest {
  const digits = onlyDigits(cardNumber);
  const titular = holderName.trim();

  return {
    tipo: 'TARJETA_CREDITO',
    alias: titular,
    moneda,
    numeroTarjeta: digits,
    titular,
    vencimiento: expiration,
    tipoTarjeta: inferTipoTarjeta(digits),
  };
}
