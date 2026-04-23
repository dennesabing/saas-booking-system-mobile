import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ActionButton from '../../../components/ActionButton';
import StatusBadge from '../../../components/StatusBadge';
import { useCancelMyBooking, useMyBookings } from '../../../hooks/useMyBookings';

const TERMINAL = ['completed', 'cancelled', 'no_show', 'pending_payment'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MyBookingsScreen() {
  const { data: bookings, isLoading, isError, refetch } = useMyBookings();
  const cancel = useCancelMyBooking();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = (uuid: string, code: string) => {
    Alert.alert(
      'Cancel Booking',
      `Cancel booking ${code}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, cancel',
          style: 'destructive',
          onPress: () => {
            setCancellingId(uuid);
            cancel.mutate(uuid, { onSettled: () => setCancellingId(null) });
          },
        },
      ]
    );
  };

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
        <Text style={{ color: '#dc2626', marginBottom: 12 }}>Failed to load bookings.</Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={{ color: '#2563eb', fontWeight: '600' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={bookings}
      keyExtractor={(b) => b.uuid}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      ListHeaderComponent={<Text style={styles.heading}>My Bookings</Text>}
      ListEmptyComponent={
        <Text style={styles.empty}>No bookings yet. Scan a QR code to book.</Text>
      }
      renderItem={({ item }) => {
        const expanded = expandedId === item.uuid;
        const cancellable = !TERMINAL.includes(item.status);
        return (
          <TouchableOpacity
            style={styles.card}
            onPress={() => setExpandedId(expanded ? null : item.uuid)}
          >
            <View style={styles.cardRow}>
              <Text style={styles.cardName}>{item.bookable.name}</Text>
              <StatusBadge status={item.status} />
            </View>
            <Text style={styles.cardDate}>{formatDate(item.start_at)}</Text>
            <Text style={styles.cardCode}>#{item.booking_code}</Text>

            {expanded && (
              <View style={styles.expanded}>
                {item.qr_code && (
                  <ActionButton
                    label="View Details"
                    onPress={() => router.push(`/(guest)/booking/confirm/${item.uuid}`)}
                    variant="secondary"
                  />
                )}
                {cancellable && (
                  <ActionButton
                    label="Cancel Booking"
                    onPress={() => handleCancel(item.uuid, item.booking_code)}
                    variant="danger"
                    loading={cancellingId === item.uuid && cancel.isPending}
                  />
                )}
              </View>
            )}
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 16, color: '#111' },
  empty: { color: '#9ca3af', textAlign: 'center', marginTop: 32, fontSize: 15 },
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
  cardName: { fontSize: 16, fontWeight: '600', color: '#111', flex: 1, marginRight: 8 },
  cardDate: { color: '#6b7280', fontSize: 13, marginBottom: 2 },
  cardCode: { color: '#9ca3af', fontSize: 12 },
  expanded: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12 },
});
