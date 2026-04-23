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
import { useBookingAction } from '../../../hooks/useBookingActions';
import { useTenantBookings } from '../../../hooks/useTenantBookings';

const TERMINAL = ['completed', 'cancelled', 'no_show', 'pending_payment'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString([], {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

type ActionSpec = {
  label: string;
  action: 'confirm' | 'complete' | 'no-show' | 'cancel';
  variant: 'primary' | 'danger' | 'secondary';
};

const ACTIONS_BY_STATUS: Record<string, ActionSpec[]> = {
  pending: [
    { label: 'Confirm', action: 'confirm', variant: 'primary' },
    { label: 'Cancel', action: 'cancel', variant: 'danger' },
  ],
  confirmed: [
    { label: 'Complete', action: 'complete', variant: 'primary' },
    { label: 'No-show', action: 'no-show', variant: 'secondary' },
    { label: 'Cancel', action: 'cancel', variant: 'danger' },
  ],
};

function BookingActions({ uuid, status }: { uuid: string; status: string }) {
  const actions = ACTIONS_BY_STATUS[status] ?? [];
  const confirm = useBookingAction('confirm');
  const complete = useBookingAction('complete');
  const noShow = useBookingAction('no-show');
  const cancel = useBookingAction('cancel');
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const hooks: Record<string, ReturnType<typeof useBookingAction>> = {
    confirm, complete, 'no-show': noShow, cancel,
  };

  if (actions.length === 0) return null;

  const handleAction = (spec: ActionSpec) => {
    Alert.alert(
      spec.label,
      `${spec.label} this booking?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            setPendingAction(spec.action);
            hooks[spec.action].mutate(uuid, { onSettled: () => setPendingAction(null) });
          },
        },
      ]
    );
  };

  return (
    <View style={{ marginTop: 8 }}>
      {actions.map((spec) => (
        <ActionButton
          key={spec.action}
          label={spec.label}
          variant={spec.variant}
          onPress={() => handleAction(spec)}
          loading={pendingAction === spec.action && hooks[spec.action].isPending}
        />
      ))}
    </View>
  );
}

export default function StaffBookingsScreen() {
  const { data: bookings, isLoading, isError, refetch } = useTenantBookings();
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
      ListHeaderComponent={<Text style={styles.heading}>Bookings</Text>}
      ListEmptyComponent={<Text style={styles.empty}>No bookings.</Text>}
      renderItem={({ item }) => {
        const expanded = expandedId === item.uuid;
        return (
          <TouchableOpacity
            style={styles.card}
            onPress={() => setExpandedId(expanded ? null : item.uuid)}
          >
            <View style={styles.cardRow}>
              <Text style={styles.cardName}>{item.bookable.name}</Text>
              <StatusBadge status={item.status} />
            </View>
            <Text style={styles.cardSub}>
              {item.user?.name ?? 'Guest'} · {formatDate(item.start_at)}
            </Text>
            <Text style={styles.cardCode}>#{item.booking_code}</Text>

            {expanded && (
              <View style={styles.expanded}>
                {item.notes && <Text style={styles.notes}>Notes: {item.notes}</Text>}
                <BookingActions uuid={item.uuid} status={item.status} />
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
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardName: { fontSize: 16, fontWeight: '600', color: '#111', flex: 1, marginRight: 8 },
  cardSub: { color: '#6b7280', fontSize: 13, marginBottom: 2 },
  cardCode: { color: '#9ca3af', fontSize: 12 },
  expanded: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12 },
  notes: { color: '#374151', fontSize: 14, marginBottom: 8 },
});
