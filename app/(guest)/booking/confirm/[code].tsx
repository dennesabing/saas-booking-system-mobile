import { Link, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import QrCodeImage from '../../../../components/QrCodeImage';
import StatusBadge from '../../../../components/StatusBadge';
import { useCurrentUser } from '../../../../hooks/useAuth';
import { useMyBookingDetail } from '../../../../hooks/useMyBookingDetail';

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function BookingConfirmScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { data: booking, isLoading, isError } = useMyBookingDetail(code);
  const { data: user } = useCurrentUser();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !booking) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Booking not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Booking Confirmed!</Text>
      <Text style={styles.code}>Code: {booking.booking_code}</Text>

      <StatusBadge status={booking.status} />

      <View style={styles.card}>
        <Row label="Service" value={booking.bookable.name} />
        <Row label="From" value={formatDateTime(booking.start_at)} />
        <Row label="To" value={formatDateTime(booking.end_at)} />
        <Row
          label="Price"
          value={`${(booking.price_snapshot / 100).toFixed(2)} ${booking.currency}`}
        />
        {booking.notes && <Row label="Notes" value={booking.notes} />}
      </View>

      {booking.qr_code && (
        <View style={styles.qrSection}>
          <Text style={styles.qrLabel}>Your Check-In QR Code</Text>
          <QrCodeImage base64Svg={booking.qr_code} size={200} />
        </View>
      )}

      {!user && (
        <Link href="/(auth)/login" style={styles.loginLink}>
          Sign in to manage your bookings
        </Link>
      )}
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 20 },
  heading: { fontSize: 26, fontWeight: '700', color: '#166534', marginBottom: 4 },
  code: { fontSize: 14, color: '#6b7280', marginBottom: 12 },
  card: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  rowLabel: { color: '#6b7280', fontSize: 14 },
  rowValue: { color: '#111', fontSize: 14, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
  qrSection: { alignItems: 'center', marginTop: 16, marginBottom: 16 },
  qrLabel: { fontSize: 15, fontWeight: '600', marginBottom: 12, color: '#374151' },
  error: { color: '#dc2626', fontSize: 16 },
  loginLink: { textAlign: 'center', color: '#2563eb', fontSize: 14, marginTop: 24 },
});
