import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ActionButton from '../../../components/ActionButton';
import StatusBadge from '../../../components/StatusBadge';
import { useBookingAction } from '../../../hooks/useBookingActions';
import api from '../../../lib/api';

type ScannedBooking = {
  uuid: string;
  booking_code: string;
  status: string;
  start_at: string;
  end_at: string;
  bookable: { name: string };
  user: { name: string; email: string } | null;
};

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [booking, setBooking] = useState<ScannedBooking | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const complete = useBookingAction('complete');

  const handleBarcodeScan = useCallback(
    async ({ data }: { data: string }) => {
      if (scanned || loading) return;
      setScanned(true);
      setLoading(true);
      setScanError(null);
      setBooking(null);

      // QR value may be full deep link or just a UUID/code — extract the last segment
      const code = data.replace(/.*\//, '');

      try {
        const response = await api.get(`/api/v1/tenant/bookings/${code}`);
        setBooking(response.data.data ?? response.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setScanError('Booking not found. Ensure this is a valid QR code.');
        } else {
          setScanError('Failed to look up booking. Check your connection.');
        }
      } finally {
        setLoading(false);
      }
    },
    [scanned, loading]
  );

  const handleCheckIn = async () => {
    if (!booking) return;
    try {
      await complete.mutateAsync(booking.uuid);
      Alert.alert('Checked In!', `${booking.user?.name ?? 'Guest'} has been checked in.`);
      resetScanner();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message ?? 'Check-in failed.');
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setBooking(null);
    setScanError(null);
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permText}>Camera access is required to scan QR codes.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (booking || scanError) {
    return (
      <View style={styles.resultContainer}>
        {scanError ? (
          <>
            <Text style={styles.errorText}>{scanError}</Text>
            <ActionButton label="Scan Again" onPress={resetScanner} variant="secondary" />
          </>
        ) : booking ? (
          <>
            <Text style={styles.resultHeading}>Booking Found</Text>
            <Text style={styles.resultCode}>#{booking.booking_code}</Text>
            <StatusBadge status={booking.status} />
            <Text style={styles.resultName}>{booking.bookable.name}</Text>
            <Text style={styles.resultMeta}>
              {booking.user?.name ?? 'Guest'}{booking.user ? ` · ${booking.user.email}` : ''}
            </Text>
            <Text style={styles.resultTime}>
              {new Date(booking.start_at).toLocaleString([], {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </Text>

            {booking.status === 'confirmed' && (
              <ActionButton
                label="Check In"
                onPress={handleCheckIn}
                loading={complete.isPending}
                style={{ marginTop: 24 }}
              />
            )}
            {booking.status !== 'confirmed' && (
              <Text style={styles.statusNote}>
                {booking.status === 'completed'
                  ? 'Already checked in.'
                  : 'Cannot check in — booking is not confirmed.'}
              </Text>
            )}

            <ActionButton
              label="Scan Another"
              onPress={resetScanner}
              variant="secondary"
              style={{ marginTop: 8 }}
            />
          </>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.scanContainer}>
      <CameraView
        style={StyleSheet.absoluteFill}
        onBarcodeScanned={handleBarcodeScan}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />
      {loading && (
        <View style={styles.scanOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.scanText}>Looking up booking…</Text>
        </View>
      )}
      {!loading && (
        <View style={styles.scanGuide}>
          <View style={styles.scanFrame} />
          <Text style={styles.scanInstruction}>Point camera at a booking QR code</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  permText: { textAlign: 'center', color: '#374151', marginBottom: 16, fontSize: 15 },
  permBtn: { backgroundColor: '#2563eb', borderRadius: 8, padding: 14 },
  permBtnText: { color: '#fff', fontWeight: '600' },
  scanContainer: { flex: 1 },
  scanOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  scanText: { color: '#fff', marginTop: 12, fontSize: 15 },
  scanGuide: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 80 },
  scanFrame: { width: 240, height: 240, borderWidth: 3, borderColor: '#fff', borderRadius: 16, position: 'absolute', top: '25%' },
  scanInstruction: { color: '#fff', fontSize: 14, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  resultContainer: { flex: 1, padding: 24, justifyContent: 'center' },
  resultHeading: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 4 },
  resultCode: { color: '#9ca3af', fontSize: 13, marginBottom: 8 },
  resultName: { fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 12 },
  resultMeta: { color: '#6b7280', fontSize: 13, marginTop: 4 },
  resultTime: { color: '#6b7280', fontSize: 13, marginTop: 2, marginBottom: 8 },
  statusNote: { color: '#6b7280', textAlign: 'center', marginTop: 16, fontSize: 14 },
  errorText: { color: '#dc2626', fontSize: 16, textAlign: 'center', marginBottom: 16 },
});
