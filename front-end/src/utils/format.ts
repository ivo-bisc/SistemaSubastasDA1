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

export type FormatTimeRemainingOptions = {
  variant?: 'compact' | 'detailed';
};

export function formatTimeRemaining(
  endDate: string,
  options: FormatTimeRemainingOptions = {}
): string {
  if (!endDate) return '';

  const endMs = new Date(endDate).getTime();
  if (Number.isNaN(endMs)) return '';

  const diffMs = endMs - Date.now();
  if (diffMs <= 0) return '00H 00M';

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (options.variant === 'detailed' && totalSeconds < 3600) {
    const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    return `${mm}: ${ss}s restantes`;
  }

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}
