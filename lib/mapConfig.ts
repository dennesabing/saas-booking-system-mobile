// mobile/lib/mapConfig.ts
// Set EXPO_PUBLIC_MAP_PROVIDER=osm (default) or =google in .env
// For Google Maps, also set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY

export type MapProvider = 'osm' | 'google';

export const MAP_PROVIDER: MapProvider =
  (process.env.EXPO_PUBLIC_MAP_PROVIDER as MapProvider) ?? 'osm';

export const GOOGLE_MAPS_API_KEY: string =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
