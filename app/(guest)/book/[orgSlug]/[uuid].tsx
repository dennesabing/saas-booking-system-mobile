import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAvailability } from '../../../../hooks/useAvailability';
import { useCreateBooking } from '../../../../hooks/useCreateBooking';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function todayIso() {
  return new Date().toISOString().split('T')[0];
}

export default function BookableDetailScreen() {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  const [selectedDate, setSelectedDate] = useState<string>(todayIso());
  const [headcount, setHeadcount] = useState(1);
  const [selectedWindow, setSelectedWindow] = useState<string | null>(null);

  const { data: windows, isLoading, isError } = useAvailability(uuid, selectedDate, headcount);
  const { mutate: createBooking, isPending } = useCreateBooking();

  const selectedWindowData = windows?.find(
    (w) => w.start_at === selectedWindow
  );

  function handleBook() {
    if (!selectedWindowData) return;
    createBooking(
      {
        bookable_uuid: uuid,
        start_at: selectedWindowData.start_at,
        end_at: selectedWindowData.end_at,
        attendee_count: headcount,
      },
      {
        onSuccess: (result) => {
          router.replace(`/(guest)/booking/confirm/${result.booking_code}`);
        },
      }
    );
  }

  return (
    <View style={styles.container}>
      {/* Date picker — simple prev/next day for now */}
      <View style={styles.datePicker}>
        <TouchableOpacity
          style={styles.dateBtn}
          onPress={() => {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() - 1);
            setSelectedDate(d.toISOString().split('T')[0]);
            setSelectedWindow(null);
          }}
        >
          <Text style={styles.dateBtnText}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.dateText}>{selectedDate}</Text>
        <TouchableOpacity
          style={styles.dateBtn}
          onPress={() => {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() + 1);
            setSelectedDate(d.toISOString().split('T')[0]);
            setSelectedWindow(null);
          }}
        >
          <Text style={styles.dateBtnText}>{'›'}</Text>
        </TouchableOpacity>
      </View>

      {/* Headcount stepper */}
      <View style={styles.stepperContainer}>
        <Text style={styles.sectionLabel}>Number of people</Text>
        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => setHeadcount(prev => Math.max(1, prev - 1))}
          >
            <Text style={styles.stepBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.stepCount}>{headcount}</Text>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => setHeadcount(prev => prev + 1)}
          >
            <Text style={styles.stepBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Time slot list */}
      <Text style={styles.sectionLabel}>Available times</Text>

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      )}

      {isError && (
        <Text style={styles.error}>Failed to load availability.</Text>
      )}

      {!isLoading && !isError && (
        <FlatList
          data={windows}
          keyExtractor={(w) => w.start_at}
          ListEmptyComponent={<Text style={styles.empty}>No available slots.</Text>}
          renderItem={({ item }) => {
            const isSelected = selectedWindow === item.start_at;
            return (
              <TouchableOpacity
                style={[
                  styles.slot,
                  !item.is_available && styles.slotUnavailable,
                  isSelected && styles.slotSelected,
                ]}
                onPress={() => item.is_available && setSelectedWindow(item.start_at)}
                disabled={!item.is_available}
              >
                <Text style={[styles.slotTime, isSelected && styles.slotTimeSelected]}>
                  {formatTime(item.start_at)} – {formatTime(item.end_at)}
                </Text>
                {item.capacity !== null && (
                  <Text style={[styles.slotRemaining, isSelected && styles.slotTimeSelected]}>
                    {item.remaining} left
                  </Text>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Book button */}
      {selectedWindowData && (
        <TouchableOpacity
          style={[styles.bookBtn, isPending && styles.bookBtnDisabled]}
          onPress={handleBook}
          disabled={isPending}
        >
          <Text style={styles.bookBtnText}>
            {isPending ? 'Booking…' : `Book for ${headcount} ${headcount === 1 ? 'person' : 'people'}`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 32 },

  datePicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  dateBtn: { padding: 8 },
  dateBtnText: { fontSize: 24, color: '#374151' },
  dateText: { fontSize: 16, fontWeight: '600', color: '#111' },

  stepperContainer: { marginVertical: 12 },
  stepper: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  stepBtn: { width: 36, height: 36, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 20, color: '#374151' },
  stepCount: { minWidth: 48, textAlign: 'center', fontSize: 18, fontWeight: '600', color: '#111' },

  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 4 },

  slot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  slotUnavailable: { opacity: 0.4 },
  slotSelected: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  slotTime: { fontSize: 15, color: '#111' },
  slotTimeSelected: { color: '#2563eb', fontWeight: '600' },
  slotRemaining: { fontSize: 13, color: '#6b7280' },

  bookBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  bookBtnDisabled: { opacity: 0.6 },
  bookBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  error: { color: '#dc2626', marginVertical: 16 },
  empty: { color: '#6b7280', textAlign: 'center', marginTop: 32 },
});
