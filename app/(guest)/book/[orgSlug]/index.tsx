import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { usePublicBookables } from '../../../../hooks/usePublicBookables';

export default function OrgBookablesScreen() {
  const { orgSlug } = useLocalSearchParams<{ orgSlug: string }>();
  const { data: bookables, isLoading, isError, refetch } = usePublicBookables(orgSlug);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Failed to load. Tap to retry.</Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={styles.retry}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={bookables}
      keyExtractor={(b) => b.id}
      ListHeaderComponent={<Text style={styles.heading}>Available Services</Text>}
      ListEmptyComponent={<Text style={styles.empty}>No services available.</Text>}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push(`/(guest)/book/${orgSlug}/${item.id}`)}
        >
          <View style={styles.cardRow}>
            <Text style={styles.cardName}>{item.name}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.kind}</Text>
            </View>
          </View>
          <Text style={styles.cardPrice}>
            {(item.price / 100).toFixed(2)} {item.currency}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 16, color: '#111' },
  empty: { color: '#6b7280', textAlign: 'center', marginTop: 32 },
  error: { color: '#dc2626', marginBottom: 8 },
  retry: { color: '#2563eb', fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardName: { fontSize: 16, fontWeight: '600', color: '#111', flex: 1 },
  badge: { backgroundColor: '#ede9fe', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#6d28d9', fontSize: 12, fontWeight: '600' },
  cardPrice: { color: '#6b7280', fontSize: 14 },
});
