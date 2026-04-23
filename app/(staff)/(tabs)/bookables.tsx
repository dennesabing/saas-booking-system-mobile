import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTenantBookables, useToggleBookable } from '../../../hooks/useTenantBookables';

export default function StaffBookablesScreen() {
  const { data: bookables, isLoading, isRefetching, isError, refetch } = useTenantBookables();
  const toggle = useToggleBookable();

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
        <Text style={{ color: '#dc2626', marginBottom: 12 }}>Failed to load bookables.</Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={{ color: '#2563eb', fontWeight: '600' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={bookables}
      keyExtractor={(b) => b.uuid}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      ListHeaderComponent={
        <View style={styles.headerRow}>
          <Text style={styles.heading}>Bookables</Text>
          <Text style={styles.subheading}>Manage from the web portal</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>No bookables found.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardMeta}>
                {item.kind} · {(item.price / 100).toFixed(2)} {item.currency}
              </Text>
            </View>
            <Switch
              value={item.is_active}
              onValueChange={(val) => toggle.mutate({ uuid: item.uuid, isActive: val })}
              trackColor={{ false: '#d1d5db', true: '#2563eb' }}
            />
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  headerRow: { marginBottom: 16 },
  heading: { fontSize: 22, fontWeight: '700', color: '#111' },
  subheading: { color: '#9ca3af', fontSize: 13, marginTop: 2 },
  empty: { color: '#9ca3af', textAlign: 'center', marginTop: 32 },
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
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardName: { fontSize: 16, fontWeight: '600', color: '#111' },
  cardMeta: { color: '#6b7280', fontSize: 13, marginTop: 2 },
});
