/**
 * BidUp — Tipografía (Figma)
 * Títulos: Sora Bold 32 | Inputs: Inter Bold 16
 */
export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
  category: 24,
  cardTitle: 11.52,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Fonts = {
  title: 'Sora_700Bold',
  input: 'Inter_700Bold',
  body: 'Inter_400Regular',
  bodyBold: 'Inter_700Bold',
} as const;
