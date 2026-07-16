import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AvailabilityWindow, DateSlotPicker } from '../../../components/booking/DateSlotPicker';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCreateBooking } from '../../../hooks/useCreateBooking';

function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

export default function MarketplaceDetailScreen() {
  const { uuid }                             = useLocalSearchParams<{ uuid: string }>();
  const { tokens }                           = useTheme();
  const [selectedDate, setSelectedDate]      = useState<string>(todayIso());
  const [selectedSlot, setSelectedSlot]      = useState<AvailabilityWindow | null>(null);
  const [attendeeCount, setAttendeeCount]    = useState(1);
  const [notes, setNotes]                    = useState('');
  const [bookingError, setBookingError]      = useState<string | null>(null);
  const { mutate: createBooking, isPending } = useCreateBooking();

  function handleBook() {
    if (!selectedSlot) return;
    setBookingError(null);
    createBooking(
      {
        bookable_uuid:  uuid,
        start_at:       selectedSlot.start_at,
        end_at:         selectedSlot.end_at,
        attendee_count: attendeeCount,
        notes:          notes.trim() || undefined,
      },
      {
        onSuccess: (result) => {
          router.replace(`/(guest)/booking/confirm/${result.booking_code}`);
        },
        onError: (e: any) => {
          setBookingError(
            e?.response?.data?.message ?? 'This slot is no longer available. Please choose another time.',
          );
        },
      },
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
          <DateSlotPicker
            bookableUuid={uuid}
            attendeeCount={attendeeCount}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            onDateChange={(d) => { setSelectedDate(d); setSelectedSlot(null); }}
            onSlotSelect={setSelectedSlot}
          />

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
            placeholder="Any special requests?"
            placeholderTextColor={tokens.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          {bookingError && <Text style={styles.errorText}>{bookingError}</Text>}

          <TouchableOpacity
            style={[
              styles.bookBtn,
              { backgroundColor: tokens.accent },
              (!selectedSlot || isPending) && styles.bookBtnDisabled,
            ]}
            onPress={handleBook}
            disabled={!selectedSlot || isPending}
          >
            <Text style={styles.bookBtnText}>
              {isPending
                ? 'Booking…'
                : selectedSlot
                  ? `Book for ${attendeeCount} ${attendeeCount === 1 ? 'person' : 'people'}`
                  : 'Select a time to book'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:            { flex: 1 },
  container:       { padding: 16, paddingBottom: 40 },
  sectionLabel:    { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  stepper:         { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn:         { width: 38, height: 38, borderWidth: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepBtnText:     { fontSize: 20 },
  stepCount:       { minWidth: 40, textAlign: 'center', fontSize: 18, fontWeight: '700' },
  notesInput:      { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, minHeight: 80, textAlignVertical: 'top' },
  errorText:       { color: '#dc2626', fontSize: 13, marginTop: 8 },
  bookBtn:         { borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 24 },
  bookBtnDisabled: { opacity: 0.5 },
  bookBtnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
});
