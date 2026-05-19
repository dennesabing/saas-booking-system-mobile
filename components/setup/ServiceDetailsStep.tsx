import React, { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, StyleSheet,
  Switch, Text, TextInput, View,
} from 'react-native';

const DURATIONS = [15, 30, 45, 60, 90, 120];

type Props = {
  onNext: (data: { name: string; duration_minutes: number; price: number }) => void;
  onSkip: () => void;
};

export function ServiceDetailsStep({ onNext, onSkip }: Props) {
  const [name, setName]               = useState('');
  const [duration, setDuration]       = useState(30);
  const [priceDisplay, setPriceDisplay] = useState('0.00');
  const [isFree, setIsFree]           = useState(false);

  const priceCents = Math.round(parseFloat(priceDisplay || '0') * 100);

  function handleFreeToggle(val: boolean) {
    setIsFree(val);
    if (val) setPriceDisplay('0.00');
  }

  function handleNext() {
    if (!name.trim()) return;
    onNext({ name: name.trim(), duration_minutes: duration, price: isFree ? 0 : priceCents });
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Pressable onPress={onSkip} style={styles.skipRow}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      <Text style={styles.label}>What service do you offer?</Text>
      <TextInput
        testID="name-input"
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Haircut, Tennis Court, Massage"
        maxLength={100}
        returnKeyType="next"
      />

      <Text style={styles.label}>Duration</Text>
      <View style={styles.durationRow}>
        {DURATIONS.map(d => (
          <Pressable
            key={d}
            onPress={() => setDuration(d)}
            style={[styles.durationChip, duration === d && styles.durationChipActive]}
          >
            <Text style={[styles.durationChipText, duration === d && styles.durationChipTextActive]}>
              {d}m
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Price</Text>
      <TextInput
        testID="price-input"
        style={[styles.input, isFree && styles.inputDisabled]}
        value={priceDisplay}
        onChangeText={setPriceDisplay}
        keyboardType="decimal-pad"
        editable={!isFree}
      />
      <View style={styles.freeRow}>
        <Switch testID="free-switch" value={isFree} onValueChange={handleFreeToggle} />
        <Text style={styles.freeLabel}>This service is free</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Next"
        onPress={handleNext}
        style={[styles.cta, !name.trim() && styles.ctaDisabled]}
      >
        <Text style={styles.ctaText}>Next →</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:              { flex: 1, padding: 24 },
  skipRow:                { alignItems: 'flex-end', marginBottom: 16 },
  skipText:               { color: '#6b7280', fontSize: 14 },
  label:                  { fontSize: 14, fontWeight: '600', color: '#374151', marginTop: 20, marginBottom: 6 },
  input:                  { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, fontSize: 15 },
  inputDisabled:          { backgroundColor: '#f3f4f6', color: '#9ca3af' },
  durationRow:            { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  durationChip:           { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  durationChipActive:     { borderColor: '#5B6CFF', backgroundColor: '#eff1ff' },
  durationChipText:       { color: '#374151', fontSize: 14 },
  durationChipTextActive: { color: '#5B6CFF', fontWeight: '600' },
  freeRow:                { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 10 },
  freeLabel:              { color: '#374151', fontSize: 14 },
  cta:                    { backgroundColor: '#5B6CFF', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 'auto' },
  ctaDisabled:            { backgroundColor: '#c7d2fe' },
  ctaText:                { color: 'white', fontWeight: '700', fontSize: 16 },
});
