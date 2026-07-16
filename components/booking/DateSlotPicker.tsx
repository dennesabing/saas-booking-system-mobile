import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AvailabilityWindow, useAvailability } from '../../hooks/useAvailability';

export type { AvailabilityWindow };

interface DateSlotPickerProps {
  bookableUuid: string;
  attendeeCount: number;
  selectedDate: string | null;
  selectedSlot: AvailabilityWindow | null;
  onDateChange: (date: string) => void;
  onSlotSelect: (slot: AvailabilityWindow) => void;
}

function buildDateRange(days = 30): string[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

function formatDatePill(iso: string): { day: string; weekday: string } {
  const d = new Date(iso + 'T00:00:00');
  return {
    day: d.getDate().toString(),
    weekday: d.toLocaleDateString(undefined, { weekday: 'short' }),
  };
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const DATES = buildDateRange(30);

export function DateSlotPicker({
  bookableUuid,
  attendeeCount,
  selectedDate,
  selectedSlot,
  onDateChange,
  onSlotSelect,
}: DateSlotPickerProps) {
  const { data: windows, isLoading, isError } = useAvailability(
    bookableUuid,
    selectedDate,
    attendeeCount,
  );

  return (
    <View>
      <Text style={styles.sectionLabel}>Select a date</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateRow}>
        {DATES.map((iso) => {
          const { day, weekday } = formatDatePill(iso);
          const isSelected = selectedDate === iso;
          return (
            <TouchableOpacity
              key={iso}
              onPress={() => onDateChange(iso)}
              style={[styles.datePill, isSelected && styles.datePillSelected]}
            >
              <Text style={[styles.datePillWeekday, isSelected && styles.datePillTextSelected]}>
                {weekday}
              </Text>
              <Text style={[styles.datePillDay, isSelected && styles.datePillTextSelected]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Available times</Text>

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="small" />
        </View>
      )}

      {isError && (
        <Text style={styles.errorText}>Failed to load slots. Try another date.</Text>
      )}

      {!isLoading && !isError && windows && (
        <FlatList
          data={windows}
          keyExtractor={(w) => w.start_at}
          numColumns={3}
          scrollEnabled={false}
          ListEmptyComponent={<Text style={styles.emptyText}>No slots available.</Text>}
          renderItem={({ item }) => {
            const isSelected = selectedSlot?.start_at === item.start_at;
            return (
              <TouchableOpacity
                style={[
                  styles.slotBtn,
                  !item.is_available && styles.slotBtnUnavailable,
                  isSelected && styles.slotBtnSelected,
                ]}
                onPress={() => item.is_available && onSlotSelect(item)}
                disabled={!item.is_available}
              >
                <Text style={[styles.slotBtnText, isSelected && styles.slotBtnTextSelected]}>
                  {formatTime(item.start_at)}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel:         { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  dateRow:              { flexDirection: 'row', marginBottom: 4 },
  datePill:             { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#f9fafb', minWidth: 48 },
  datePillSelected:     { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  datePillWeekday:      { fontSize: 11, color: '#6b7280', fontWeight: '500' },
  datePillDay:          { fontSize: 16, fontWeight: '700', color: '#111' },
  datePillTextSelected: { color: '#fff' },
  center:               { paddingVertical: 16, alignItems: 'center' },
  errorText:            { color: '#dc2626', fontSize: 13, marginTop: 4 },
  emptyText:            { color: '#6b7280', textAlign: 'center', marginTop: 8 },
  slotBtn:              { flex: 1, margin: 4, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#f9fafb', alignItems: 'center' },
  slotBtnUnavailable:   { opacity: 0.35 },
  slotBtnSelected:      { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  slotBtnText:          { fontSize: 13, fontWeight: '600', color: '#111' },
  slotBtnTextSelected:  { color: '#fff' },
});
