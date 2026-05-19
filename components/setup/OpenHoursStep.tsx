import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

const ALL_DAYS = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

type DayState = {
  day: string;
  open: boolean;
  open_time: string;
  close_time: string;
};

const DEFAULT_DAYS: DayState[] = ALL_DAYS.map(d => ({
  day:        d.key,
  open:       ['mon', 'tue', 'wed', 'thu', 'fri'].includes(d.key),
  open_time:  '09:00',
  close_time: '17:00',
}));

type PickerTarget = { day: string; field: 'open_time' | 'close_time' };

function timeStringToDate(t: string): Date {
  const [h, m] = t.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function dateToTimeString(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

type Props = {
  onFinish: (days: DayState[]) => void;
  onBack: () => void;
  onSkip: () => void;
};

export function OpenHoursStep({ onFinish, onBack, onSkip }: Props) {
  const [days, setDays]               = useState<DayState[]>(DEFAULT_DAYS);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);
  const hasOpen = days.some(d => d.open);

  function toggleDay(key: string, val: boolean) {
    setDays(prev => prev.map(d => d.day === key ? { ...d, open: val } : d));
  }

  function openPicker(day: string, field: 'open_time' | 'close_time') {
    setPickerTarget({ day, field });
  }

  function handlePickerChange(_: unknown, selected?: Date) {
    if (Platform.OS === 'android') setPickerTarget(null); // Android auto-dismisses
    if (!selected || !pickerTarget) return;
    const time = dateToTimeString(selected);
    setDays(prev => prev.map(d =>
      d.day === pickerTarget.day ? { ...d, [pickerTarget.field]: time } : d
    ));
  }

  const pickerDay = pickerTarget
    ? days.find(d => d.day === pickerTarget.day)
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back">
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Pressable onPress={onSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <Text style={styles.heading}>When are you open?</Text>
      <Text style={styles.sub}>Tap the times to change them.</Text>

      <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
        {ALL_DAYS.map(({ key, label }) => {
          const dayState = days.find(d => d.day === key)!;
          return (
            <View testID={`day-row-${key}`} key={key} style={styles.dayRow}>
              <Text style={styles.dayLabel}>{label}</Text>
              <Switch
                testID={`toggle-${key}`}
                value={dayState.open}
                onValueChange={val => toggleDay(key, val)}
                trackColor={{ false: '#d1d5db', true: '#5B6CFF' }}
                thumbColor="#fff"
              />
              {dayState.open ? (
                <View style={styles.timePair}>
                  <Pressable
                    onPress={() => openPicker(key, 'open_time')}
                    style={styles.timeChip}
                  >
                    <Text style={styles.timeText}>{dayState.open_time}</Text>
                  </Pressable>
                  <Text style={styles.timeSep}>–</Text>
                  <Pressable
                    onPress={() => openPicker(key, 'close_time')}
                    style={styles.timeChip}
                  >
                    <Text style={styles.timeText}>{dayState.close_time}</Text>
                  </Pressable>
                </View>
              ) : (
                <Text style={styles.closed}>Closed</Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Inline picker for iOS; dialog for Android (auto-shown when pickerTarget is set) */}
      {pickerTarget && pickerDay && (
        <View style={Platform.OS === 'ios' ? styles.iosPickerSheet : undefined}>
          {Platform.OS === 'ios' && (
            <Pressable onPress={() => setPickerTarget(null)} style={styles.iosDone}>
              <Text style={styles.iosDoneText}>Done</Text>
            </Pressable>
          )}
          <DateTimePicker
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            value={timeStringToDate(
              pickerTarget.field === 'open_time' ? pickerDay.open_time : pickerDay.close_time
            )}
            onChange={handlePickerChange}
            minuteInterval={15}
          />
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Finish setup"
        onPress={() => hasOpen && onFinish(days)}
        style={[styles.cta, !hasOpen && styles.ctaDisabled]}
      >
        <Text style={styles.ctaText}>Finish setup</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, padding: 24 },
  header:         { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  back:           { fontSize: 22, color: '#374151' },
  skipText:       { color: '#6b7280', fontSize: 14 },
  heading:        { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 4 },
  sub:            { color: '#6b7280', fontSize: 13, marginBottom: 16 },
  list:           { flex: 1 },
  dayRow:         { flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
                    borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: 10 },
  dayLabel:       { width: 36, fontSize: 14, fontWeight: '600', color: '#374151' },
  timePair:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
  timeChip:       { backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  timeText:       { fontSize: 13, color: '#374151', fontWeight: '600' },
  timeSep:        { color: '#9ca3af', fontSize: 13 },
  closed:         { flex: 1, fontSize: 13, color: '#9ca3af', textAlign: 'right' },
  iosPickerSheet: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb',
                    borderRadius: 16, overflow: 'hidden' },
  iosDone:        { alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 12 },
  iosDoneText:    { color: '#5B6CFF', fontSize: 16, fontWeight: '600' },
  cta:            { backgroundColor: '#5B6CFF', borderRadius: 12, paddingVertical: 14,
                    alignItems: 'center', marginTop: 16 },
  ctaDisabled:    { backgroundColor: '#c7d2fe' },
  ctaText:        { color: 'white', fontWeight: '700', fontSize: 16 },
});
