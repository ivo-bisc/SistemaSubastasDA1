export function formatCurrency(amount: number, currency = 'USD', compact = false): string {
  if (compact) {
    if (amount >= 1000) {
      const k = amount / 1000;
      const formatted = Number.isInteger(k) ? `${k}` : k.toFixed(1).replace(/\.0$/, '');
      return `$${formatted}k`;
    }
    return `$${amount.toLocaleString('es-AR')}`;
  }
  return `$${amount.toLocaleString('es-AR')} ${currency}`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}
