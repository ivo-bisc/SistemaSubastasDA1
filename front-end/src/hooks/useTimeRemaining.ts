import { useEffect, useState } from 'react';
import { formatTimeRemaining, FormatTimeRemainingOptions } from '../utils/format';

export function useTimeRemaining(
  endDate: string | undefined,
  intervalMs: number,
  options?: FormatTimeRemainingOptions
): string {
  const variant = options?.variant ?? 'compact';

  const [text, setText] = useState(() =>
    formatTimeRemaining(endDate ?? '', { variant })
  );

  useEffect(() => {
    setText(formatTimeRemaining(endDate ?? '', { variant }));
    if (!endDate) return undefined;

    const id = setInterval(() => {
      setText(formatTimeRemaining(endDate, { variant }));
    }, intervalMs);

    return () => clearInterval(id);
  }, [endDate, intervalMs, variant]);

  return text;
}
