import { Platform } from 'react-native';

const DEFAULT_HOST =
  Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

function getMediaBaseUrl(): string {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || `${DEFAULT_HOST}/api/v1`;
  return apiUrl.replace(/\/api\/v1\/?$/, '');
}

export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;

  const base = getMediaBaseUrl();
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
}

export function hasImageUrl(url: string | null | undefined): boolean {
  return resolveImageUrl(url).length > 0;
}
