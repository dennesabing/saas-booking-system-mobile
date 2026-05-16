import { LinearGradient } from 'expo-linear-gradient';
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
import UpgradeCtaCard from '../../../components/upgrade/UpgradeCtaCard';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCurrentUser } from '../../../hooks/useAuth';
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
  const { tokens } = useTheme();
  const { data: currentUser } = useCurrentUser();
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
      <LinearGradient colors={tokens.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={tokens.accent} />
        </View>
      </LinearGradient>
    );
  }

  if (isError) {
    return (
      <LinearGradient colors={tokens.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: '#dc2626' }]}>Failed to load bookings.</Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text style={{ color: tokens.accent, fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={tokens.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={bookings}
        keyExtractor={(b) => b.uuid}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={tokens.accent}
          />
        }
        ListHeaderComponent={
          <>
            <UpgradeCtaCard currentOrganizationId={currentUser?.current_organization_id ?? null} />
            <Text style={[styles.heading, { color: tokens.textPrimary }]}>My Bookings</Text>
          </>
        }
        ListEmptyComponent={
          <Text style={[styles.empty, { color: tokens.textMuted }]}>
            No bookings yet. Scan a QR code to book.
          </Text>
        }
        renderItem={({ item }) => {
          const expanded = expandedId === item.uuid;
          const cancellable = !TERMINAL.includes(item.status);
          return (
            <TouchableOpacity
              style={[
                styles.card,
                {
                  backgroundColor: tokens.surface,
                  borderColor: tokens.surfaceBorder,
                  borderWidth: 1,
                  ...tokens.cardShadow,
                },
              ]}
              onPress={() => setExpandedId(expanded ? null : item.uuid)}
            >
              <View style={styles.cardRow}>
                <Text style={[styles.cardName, { color: tokens.textPrimary }]}>{item.bookable.name}</Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={[styles.cardDate, { color: tokens.textSecondary }]}>{formatDate(item.start_at)}</Text>
              <Text style={[styles.cardCode, { color: tokens.textMuted }]}>#{item.booking_code}</Text>

              {expanded && (
                <View style={[styles.expanded, { borderTopColor: tokens.surfaceBorder }]}>
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { marginBottom: 12 },
  list: { flex: 1, backgroundColor: 'transparent' },
  listContent: { padding: 16 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  empty: { textAlign: 'center', marginTop: 32, fontSize: 15 },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardName: { fontSize: 15, fontWeight: '600', flex: 1, marginRight: 8 },
  cardDate: { fontSize: 13, marginBottom: 2 },
  cardCode: { fontSize: 12 },
  expanded: { marginTop: 12, borderTopWidth: 1, paddingTop: 12 },
});
