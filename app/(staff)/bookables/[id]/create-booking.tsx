import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AvailabilityWindow, DateSlotPicker } from '../../../../components/booking/DateSlotPicker';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useCreateBooking } from '../../../../hooks/useCreateBooking';
import { useTenantBookables } from '../../../../hooks/useTenantBookables';

type BookerType = 'self' | 'customer';

function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

export default function ProOwnerCreateBookingScreen() {
  const { id }                               = useLocalSearchParams<{ id: string }>();
  const { tokens }                           = useTheme();
  const { data: bookables }                  = useTenantBookables();
  const bookable                             = bookables?.find((b) => b.id === id);

  const [bookerType, setBookerType]          = useState<BookerType>('self');
  const [customerName, setCustomerName]      = useState('');
  const [customerEmail, setCustomerEmail]    = useState('');
  const [selectedDate, setSelectedDate]      = useState<string>(todayIso());
  const [selectedSlot, setSelectedSlot]      = useState<AvailabilityWindow | null>(null);
  const [attendeeCount, setAttendeeCount]    = useState(1);
  const [notes, setNotes]                    = useState('');
  const [error, setError]                    = useState<string | null>(null);
  const [success, setSuccess]                = useState(false);
  const { mutate: createBooking, isPending } = useCreateBooking();

  function handleConfirm() {
    if (!selectedSlot) return;
    if (bookerType === 'customer' && !customerName.trim()) {
      setError('Customer name is required.');
      return;
    }
    setError(null);

    createBooking(
      {
        bookable_uuid:  id,
        start_at:       selectedSlot.start_at,
        end_at:         selectedSlot.end_at,
        attendee_count: attendeeCount,
        notes:          notes.trim() || undefined,
        ...(bookerType === 'customer' && customerName.trim()
          ? { customer_name: customerName.trim(), customer_email: customerEmail.trim() || undefined }
          : {}),
      } as any,
      {
        onSuccess: () => setSuccess(true),
        onError: (e: any) => {
          setError(e?.response?.data?.message ?? 'Failed to create booking. Please try again.');
        },
      },
    );
  }

  if (success) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: tokens.bg[0] }]} edges={['bottom']}>
        <View style={styles.successContainer}>
          <Text style={[styles.successTitle, { color: tokens.textPrimary }]}>Booking Created!</Text>
          <Text style={[styles.successSub, { color: tokens.textSecondary }]}>
            The booking has been added to your service.
          </Text>
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: tokens.accent }]}
            onPress={() => router.back()}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: tokens.bg[0] }]} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {bookable && (
            <Text style={[styles.serviceName, { color: tokens.textPrimary }]}>{bookable.name}</Text>
          )}

          <Text style={[styles.sectionLabel, { color: tokens.textSecondary }]}>
            Who is this booking for?
          </Text>
          <View style={styles.selectorRow}>
            {(['self', 'customer'] as BookerType[]).map((type) => (
              <Pressable
                key={type}
                onPress={() => setBookerType(type)}
                style={[
                  styles.selectorCard,
                  { borderColor: tokens.surfaceBorder, backgroundColor: tokens.surface },
                  bookerType === type && { borderColor: tokens.accent, backgroundColor: tokens.accent + '15' },
                ]}
              >
                <Text style={[styles.selectorTitle, { color: tokens.textPrimary }]}>
                  {type === 'self' ? 'For myself' : 'For a customer'}
                </Text>
                <Text style={[styles.selectorSub, { color: tokens.textMuted }]}>
                  {type === 'self' ? 'Book under your account' : 'Enter customer details'}
                </Text>
              </Pressable>
            ))}
          </View>

          {bookerType === 'customer' && (
            <View style={styles.customerFields}>
              <Text style={[styles.sectionLabel, { color: tokens.textSecondary }]}>Customer name *</Text>
              <TextInput
                style={[styles.input, { borderColor: tokens.surfaceBorder, color: tokens.textPrimary, backgroundColor: tokens.surface }]}
                placeholder="Full name"
                placeholderTextColor={tokens.textMuted}
                value={customerName}
                onChangeText={setCustomerName}
                returnKeyType="next"
              />
              <Text style={[styles.sectionLabel, { color: tokens.textSecondary }]}>
                Customer email (optional)
              </Text>
              <TextInput
                style={[styles.input, { borderColor: tokens.surfaceBorder, color: tokens.textPrimary, backgroundColor: tokens.surface }]}
                placeholder="email@example.com"
                placeholderTextColor={tokens.textMuted}
                value={customerEmail}
                onChangeText={setCustomerEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="done"
              />
            </View>
          )}

          <View style={{ marginTop: 20 }}>
            <DateSlotPicker
              bookableUuid={id}
              attendeeCount={attendeeCount}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              onDateChange={(d) => { setSelectedDate(d); setSelectedSlot(null); }}
              onSlotSelect={setSelectedSlot}
            />
          </View>

          <Text style={[styles.sectionLabel, { color: tokens.textSecondary, marginTop: 20 }]}>
            Number of people
          </Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={[styles.stepBtn, { borderColor: tokens.surfaceBorder }]}
              onPress={() => setAttendeeCount((c) => Math.max(1, c - 1))}
            >
              <Text style={[styles.stepBtnText, { color: tokens.textPrimary }]}>−</Text>
            </TouchableOpacity>
            <Text style={[styles.stepCount, { color: tokens.textPrimary }]}>{attendeeCount}</Text>
            <TouchableOpacity
              style={[styles.stepBtn, { borderColor: tokens.surfaceBorder }]}
              onPress={() => setAttendeeCount((c) => c + 1)}
            >
              <Text style={[styles.stepBtnText, { color: tokens.textPrimary }]}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionLabel, { color: tokens.textSecondary, marginTop: 20 }]}>
            Notes (optional)
          </Text>
          <TextInput
            style={[styles.notesInput, { borderColor: tokens.surfaceBorder, color: tokens.textPrimary, backgroundColor: tokens.surface }]}
            placeholder="Internal notes or customer requests…"
            placeholderTextColor={tokens.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[
              styles.confirmBtn,
              { backgroundColor: tokens.accent },
              (!selectedSlot || isPending) && styles.btnDisabled,
            ]}
            onPress={handleConfirm}
            disabled={!selectedSlot || isPending}
          >
            <Text style={styles.confirmBtnText}>
              {isPending ? 'Creating booking…' : 'Confirm Booking'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:             { flex: 1 },
  container:        { padding: 16, paddingBottom: 48 },
  serviceName:      { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  sectionLabel:     { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 4 },
  selectorRow:      { gap: 10, marginBottom: 4 },
  selectorCard:     { borderWidth: 1.5, borderRadius: 12, padding: 14 },
  selectorTitle:    { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  selectorSub:      { fontSize: 12 },
  customerFields:   { marginTop: 12, gap: 4 },
  input:            { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14 },
  stepper:          { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn:          { width: 38, height: 38, borderWidth: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepBtnText:      { fontSize: 20 },
  stepCount:        { minWidth: 40, textAlign: 'center', fontSize: 18, fontWeight: '700' },
  notesInput:       { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, minHeight: 80, textAlignVertical: 'top' },
  errorText:        { color: '#dc2626', fontSize: 13, marginTop: 8 },
  confirmBtn:       { borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 24 },
  btnDisabled:      { opacity: 0.5 },
  confirmBtnText:   { color: '#fff', fontSize: 16, fontWeight: '700' },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  successTitle:     { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  successSub:       { fontSize: 15, textAlign: 'center', marginBottom: 32 },
  doneBtn:          { borderRadius: 14, paddingVertical: 15, paddingHorizontal: 48, alignItems: 'center' },
  doneBtnText:      { color: '#fff', fontSize: 16, fontWeight: '700' },
});
