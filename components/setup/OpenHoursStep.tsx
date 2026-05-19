import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

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

type Props = {
  onFinish: (days: DayState[]) => void;
  onBack: () => void;
  onSkip: () => void;
};

export function OpenHoursStep({ onFinish, onBack, onSkip }: Props) {
  const [days, setDays] = useState<DayState[]>(DEFAULT_DAYS);
  const hasOpen = days.some(d => d.open);

  function toggleDay(key: string, val: boolean) {
    setDays(prev => prev.map(d => d.day === key ? { ...d, open: val } : d));
  }

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
      <Text style={styles.sub}>You can refine this anytime.</Text>

      <ScrollView style={styles.list}>
        {ALL_DAYS.map(({ key, label }) => {
          const dayState = days.find(d => d.day === key)!;
          return (
            <View testID={`day-row-${key}`} key={key} style={styles.dayRow}>
              <Text style={styles.dayLabel}>{label}</Text>
              <Switch
                testID={`toggle-${key}`}
                value={dayState.open}
                onValueChange={val => toggleDay(key, val)}
              />
              <Text style={dayState.open ? styles.hours : styles.closed}>
                {dayState.open ? `${dayState.open_time} -> ${dayState.close_time}` : 'closed'}
              </Text>
            </View>
          );
        })}
      </ScrollView>

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
  container:   { flex: 1, padding: 24 },
  header:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  back:        { fontSize: 22, color: '#374151' },
  skipText:    { color: '#6b7280', fontSize: 14 },
  heading:     { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 4 },
  sub:         { color: '#6b7280', fontSize: 13, marginBottom: 16 },
  list:        { flex: 1 },
  dayRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
                 borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: 12 },
  dayLabel:    { width: 36, fontSize: 14, fontWeight: '600', color: '#374151' },
  hours:       { flex: 1, fontSize: 13, color: '#374151' },
  closed:      { flex: 1, fontSize: 13, color: '#9ca3af' },
  cta:         { backgroundColor: '#5B6CFF', borderRadius: 12, paddingVertical: 14,
                 alignItems: 'center', marginTop: 16 },
  ctaDisabled: { backgroundColor: '#c7d2fe' },
  ctaText:     { color: 'white', fontWeight: '700', fontSize: 16 },
});
