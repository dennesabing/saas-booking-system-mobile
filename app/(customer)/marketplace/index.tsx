import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { MarketplaceBookable, MarketplaceParams, useMarketplaceBookables } from '../../../hooks/useMarketplaceBookables';

const RADIUS_OPTIONS = [5, 25, 50];
const KIND_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'All', value: '' },
  { label: 'Slot', value: 'slot' },
  { label: 'Resource', value: 'resource' },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function formatPrice(cents: number, currency: string): string {
  if (cents === 0) return 'Free';
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(cents / 100);
}

export default function MarketplaceIndexScreen() {
  const { tokens } = useTheme();
  const [coords, setCoords]         = useState<{ lat: number; lng: number } | null>(null);
  const [manualAddr, setManualAddr] = useState('');
  const [geoError, setGeoError]     = useState(false);
  const [search, setSearch]         = useState('');
  const [radius, setRadius]         = useState(25);
  const [kind, setKind]             = useState('');
  const debouncedSearch             = useDebounce(search, 400);

  const params: MarketplaceParams | null = coords
    ? { lat: coords.lat, lng: coords.lng, radius, search: debouncedSearch || undefined, kind: kind || undefined }
    : null;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useMarketplaceBookables(params);

  const items: MarketplaceBookable[] = data?.pages.flatMap((p) => p.data) ?? [];

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      } else {
        setGeoError(true);
      }
    })();
  }, []);

  const geocodeManual = useCallback(async () => {
    if (!manualAddr.trim()) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualAddr)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } },
      );
      const json = await res.json();
      if (json[0]) {
        setCoords({ lat: parseFloat(json[0].lat), lng: parseFloat(json[0].lon) });
        setGeoError(false);
      }
    } catch {
      // user can retry
    }
  }, [manualAddr]);

  const renderCard = ({ item }: { item: MarketplaceBookable }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: tokens.surface, borderColor: tokens.surfaceBorder }]}
      onPress={() => router.push(`/(customer)/marketplace/${item.id}`)}
    >
      <View style={styles.cardRow}>
        <Text style={[styles.cardName, { color: tokens.textPrimary }]} numberOfLines={1}>{item.name}</Text>
        <View style={styles.distanceBadge}>
          <Text style={styles.distanceBadgeText}>{item.distance_km} km</Text>
        </View>
      </View>
      {item.org_name ? (
        <Text style={[styles.cardOrg, { color: tokens.textMuted }]}>{item.org_name}</Text>
      ) : null}
      <View style={styles.cardMeta}>
        <Text style={[styles.cardMetaText, { color: tokens.textSecondary }]}>{item.duration_minutes} min</Text>
        <Text style={[styles.cardMetaText, { color: tokens.accent }]}>{formatPrice(item.price, item.currency)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg[0] }]}>
      {geoError && (
        <View style={styles.manualRow}>
          <TextInput
            style={[styles.manualInput, { borderColor: tokens.surfaceBorder, color: tokens.textPrimary, backgroundColor: tokens.surface }]}
            placeholder="Enter your location…"
            placeholderTextColor={tokens.textMuted}
            value={manualAddr}
            onChangeText={setManualAddr}
            onSubmitEditing={geocodeManual}
            returnKeyType="search"
          />
          <TouchableOpacity style={[styles.manualBtn, { backgroundColor: tokens.accent }]} onPress={geocodeManual}>
            <Text style={styles.manualBtnText}>Go</Text>
          </TouchableOpacity>
        </View>
      )}

      <TextInput
        style={[styles.searchInput, { borderColor: tokens.surfaceBorder, color: tokens.textPrimary, backgroundColor: tokens.surface }]}
        placeholder="Search services…"
        placeholderTextColor={tokens.textMuted}
        value={search}
        onChangeText={setSearch}
        returnKeyType="search"
      />

      <View style={styles.filterRow}>
        {RADIUS_OPTIONS.map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => setRadius(r)}
            style={[styles.chip, { borderColor: tokens.surfaceBorder }, radius === r && { backgroundColor: tokens.accent, borderColor: tokens.accent }]}
          >
            <Text style={[styles.chipText, { color: radius === r ? '#fff' : tokens.textSecondary }]}>{r} km</Text>
          </TouchableOpacity>
        ))}
        {KIND_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setKind(opt.value)}
            style={[styles.chip, { borderColor: tokens.surfaceBorder }, kind === opt.value && { backgroundColor: tokens.accent, borderColor: tokens.accent }]}
          >
            <Text style={[styles.chipText, { color: kind === opt.value ? '#fff' : tokens.textSecondary }]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {!coords && !geoError && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={tokens.accent} />
          <Text style={[styles.loadingText, { color: tokens.textMuted }]}>Detecting location…</Text>
        </View>
      )}

      {coords && (
        isError ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>Failed to load services.</Text>
            <TouchableOpacity onPress={() => refetch()}>
              <Text style={[styles.retryText, { color: tokens.accent }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(b) => b.id}
            renderItem={renderCard}
            ListEmptyComponent={
              isLoading ? (
                <View style={styles.center}><ActivityIndicator color={tokens.accent} /></View>
              ) : (
                <Text style={[styles.emptyText, { color: tokens.textMuted }]}>No services found nearby.</Text>
              )
            }
            onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
            onEndReachedThreshold={0.3}
            ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ margin: 16 }} color={tokens.accent} /> : null}
            contentContainerStyle={styles.list}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  manualRow:         { flexDirection: 'row', marginBottom: 10, gap: 8 },
  manualInput:       { flex: 1, borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 14 },
  manualBtn:         { paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center' },
  manualBtnText:     { color: '#fff', fontWeight: '700' },
  searchInput:       { borderWidth: 1, borderRadius: 10, padding: 11, fontSize: 14, marginBottom: 10 },
  filterRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  chip:              { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText:          { fontSize: 13, fontWeight: '600' },
  center:            { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 32 },
  loadingText:       { marginTop: 8, fontSize: 13 },
  errorText:         { color: '#dc2626', marginBottom: 8 },
  retryText:         { fontWeight: '700' },
  emptyText:         { textAlign: 'center', marginTop: 32, fontSize: 14 },
  list:              { paddingBottom: 24 },
  card:              { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  cardRow:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  cardName:          { fontSize: 16, fontWeight: '700', flex: 1 },
  cardOrg:           { fontSize: 13, marginBottom: 6 },
  cardMeta:          { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  cardMetaText:      { fontSize: 13, fontWeight: '600' },
  distanceBadge:     { backgroundColor: '#f0fdf4', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 },
  distanceBadgeText: { color: '#15803d', fontSize: 12, fontWeight: '600' },
});
