import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type Props = { userName: string; initial: string; onContinue: (orgName: string) => void };

export default function OrgDetailsStep({ userName, initial, onContinue }: Props) {
  const defaultName = initial || (userName ? `${userName}'s Business` : '');
  const [value, setValue] = useState(defaultName);
  const valid = value.trim().length > 0 && value.length <= 255;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>What should we call your business?</Text>
      <TextInput testID="org-name-input" style={styles.input} value={value} onChangeText={setValue} maxLength={255} autoFocus />
      <Text style={styles.help}>You can rename it anytime.</Text>
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: !valid }} disabled={!valid}
        onPress={() => onContinue(value.trim())} style={[styles.cta, !valid && styles.ctaDisabled]}>
        <Text style={styles.ctaText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { padding: 24, flex: 1 },
  label:       { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  input:       { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16 },
  help:        { color: '#777', marginTop: 8 },
  cta:         { backgroundColor: '#5B6CFF', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 'auto' },
  ctaDisabled: { opacity: 0.5 },
  ctaText:     { color: 'white', fontWeight: '700', fontSize: 16 },
});
