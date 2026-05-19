import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
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
        <Pressable
          style={styles.addBtn}
          onPress={() => router.push('/(staff)/setup/first-service')}
        >
          <Text style={styles.addBtnText}>+ Add service</Text>
        </Pressable>
      }
      ListEmptyComponent={<Text style={styles.empty}>No bookables found.</Text>}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push(`/(staff)/bookables/${item.uuid}`)}
        >
          <View style={styles.cardRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardMeta}>
                {item.duration_minutes} min · {item.price === 0 ? 'Free' : `${(item.price / 100).toFixed(2)} ${item.currency}`}
              </Text>
            </View>
            <Switch
              value={item.is_active}
              onValueChange={(val) => toggle.mutate({ uuid: item.uuid, isActive: val })}
              trackColor={{ false: '#d1d5db', true: '#2563eb' }}
            />
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list:        { padding: 16 },
  addBtn:      { backgroundColor: '#5B6CFF', borderRadius: 10, paddingVertical: 12,
                 alignItems: 'center', marginBottom: 16 },
  addBtnText:  { color: '#fff', fontWeight: '700', fontSize: 15 },
  empty:       { color: '#9ca3af', textAlign: 'center', marginTop: 32 },
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
  cardRow:     { flexDirection: 'row', alignItems: 'center' },
  cardName:    { fontSize: 16, fontWeight: '600', color: '#111' },
  cardMeta:    { color: '#6b7280', fontSize: 13, marginTop: 2 },
  chevron:     { position: 'absolute', right: 16, top: '50%', color: '#d1d5db', fontSize: 20 },
});
